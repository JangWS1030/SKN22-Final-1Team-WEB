from __future__ import annotations

import json
import re
from functools import lru_cache
from pathlib import Path
from typing import Any

from django.utils import timezone


CHATBOT_DATASET_PATH = (
    Path(__file__).resolve().parent.parent / "data" / "chatbot" / "designer_support_dataset_v5_final_revised_optimized.json"
)

STOPWORDS = {
    "그리고",
    "또는",
    "또한",
    "에서",
    "에게",
    "으로",
    "으로서",
    "대한",
    "관련",
    "문의",
    "질문",
    "알려줘",
    "알려주세요",
    "해주세요",
    "있나요",
    "있을까요",
}


def _normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def _tokenize(text: str) -> list[str]:
    normalized = _normalize_text(text).lower()
    return [
        token
        for token in re.findall(r"[가-힣A-Za-z0-9]+", normalized)
        if len(token) >= 2 and token not in STOPWORDS
    ]


@lru_cache(maxsize=1)
def load_chatbot_dataset() -> tuple[dict[str, Any], ...]:
    payload = json.loads(CHATBOT_DATASET_PATH.read_text(encoding="utf-8"))
    chunks: list[dict[str, Any]] = []

    for entry in payload:
        source = str(entry.get("source") or "").strip()
        for item in entry.get("content") or []:
            text = _normalize_text(str(item.get("text") or ""))
            if not text:
                continue
            chunks.append(
                {
                    "source": source,
                    "page_number": item.get("page_number"),
                    "text": text,
                    "tables": item.get("tables", []),
                    "text_lower": text.lower(),
                    "token_set": set(_tokenize(text)),
                }
            )
    return tuple(chunks)


def _score_chunk(question_tokens: list[str], question_text: str, chunk: dict[str, Any]) -> float:
    if not question_tokens:
        return 0.0

    text_lower = chunk["text_lower"]
    token_set = chunk["token_set"]
    score = 0.0
    overlap = 0
    for token in question_tokens:
        if token in text_lower:
            overlap += 1
            score += 1.5 + (len(token) * 0.2)
        if token in chunk["source"].lower():
            score += 0.4

    if overlap:
        score += overlap * 0.75

    compact_question = _normalize_text(question_text).lower()
    if compact_question and compact_question in text_lower:
        score += 4.0

    if token_set:
        if token_set.issuperset(question_tokens):
            score += 1.5
        else:
            score += len(token_set.intersection(question_tokens)) * 0.35

    # Earlier pages usually contain higher-level explanations, so give a tiny boost.
    page_number = int(chunk.get("page_number") or 0)
    if page_number > 0:
        score += max(0.0, 1.0 - min(page_number, 40) / 80.0)

    return score


def _build_excerpt(text: str, limit: int = 220) -> str:
    normalized = _normalize_text(text)
    if len(normalized) <= limit:
        return normalized
    return normalized[: limit - 1].rstrip() + "…"


def build_admin_chatbot_reply(*, message: str, admin_name: str | None = None, store_name: str | None = None) -> dict[str, Any]:
    question = _normalize_text(message)
    if not question:
        raise ValueError("message is required.")

    question_tokens = _tokenize(question)
    chunks = load_chatbot_dataset()
    ranked_chunks = sorted(
        (
            {
                "source": chunk["source"],
                "page_number": chunk["page_number"],
                "text": chunk["text"],
                "score": round(_score_chunk(question_tokens, question, chunk), 3),
            }
            for chunk in chunks
        ),
        key=lambda item: (item["score"], -int(item["page_number"] or 0)),
        reverse=True,
    )

    top_matches = [item for item in ranked_chunks if item["score"] > 0][:3]
    if not top_matches:
        top_matches = ranked_chunks[:3]

    if top_matches:
        reply_lines = ["질문과 가장 가까운 시술 가이드를 아래 자료에서 찾았습니다."]
        for index, item in enumerate(top_matches, start=1):
            reply_lines.append(
                f"{index}. {item['source']} p.{item['page_number']}: {_build_excerpt(item['text'])}"
            )
        reply_lines.append("원하시면 시술명이나 상황을 더 구체적으로 말씀해 주세요.")
    else:
        reply_lines = [
            "현재 데이터셋에서 바로 연결할 수 있는 시술 가이드를 찾지 못했습니다.",
            "시술명, 모발 상태, 원하는 스타일을 더 구체적으로 알려주시면 다시 찾아보겠습니다.",
        ]

    return {
        "status": "success",
        "reply": "\n".join(reply_lines),
        "timestamp": timezone.now().isoformat(),
        "matched_sources": [
            {
                "source": item["source"],
                "page_number": item["page_number"],
                "score": item["score"],
                "excerpt": _build_excerpt(item["text"]),
            }
            for item in top_matches
        ],
        "dataset_source": CHATBOT_DATASET_PATH.name,
        "admin_name": admin_name,
        "store_name": store_name,
    }
