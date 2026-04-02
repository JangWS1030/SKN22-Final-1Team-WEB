import os
import random
import django
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.hashers import make_password

# Django 환경 설정
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mirrai_project.settings")
django.setup()

from app.models_django import AdminAccount, Designer, Client, ConsultationRequest

def generate_test_data():
    print("🚀 테스트 데이터 생성을 시작합니다...")

    # 1. 매장 생성 (또는 기존 매장 사용)
    shop, created = AdminAccount.objects.get_or_create(
        phone="01080001000",
        defaults={
            "name": "테스트 점주",
            "store_name": "MirrAI 테스트점",
            "business_number": "000-00-00000",
            "password_hash": make_password("1234") # 관리자 비번도 1234로 해싱
        }
    )
    print(f"✅ 매장: {shop.store_name} ({'생성됨' if created else '기존 사용'})")

    # 2. 디자이너 10명 생성
    designers = []
    names_male = ["민수", "준호", "지훈", "현우", "도윤"]
    names_female = ["서연", "지아", "하은", "미나", "유진"]

    # 기존 데이터 삭제 (중복 방지 및 갱신)
    Designer.objects.filter(shop=shop).delete()

    for i in range(5):
        # 남성 디자이너 (PIN: 0001)
        d_male = Designer.objects.create(
            shop=shop,
            name=f"김{names_male[i]}",
            phone=f"0101111000{i}",
            pin_hash=make_password("0001"),
            is_active=True
        )
        designers.append(d_male)

        # 여성 디자이너 (PIN: 0002)
        d_female = Designer.objects.create(
            shop=shop,
            name=f"이{names_female[i]}",
            phone=f"0102222000{i}",
            pin_hash=make_password("0002"),
            is_active=True
        )
        designers.append(d_female)
    
    print(f"✅ 디자이너 10명 생성 완료.")

    # 3. 고객 100명 생성
    last_names = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임"]
    first_names = ["서준", "하준", "도윤", "시우", "지호", "민준", "예준", "주원", "유준", "우진", "서연", "서윤", "지우", "서현", "하윤", "하은", "민서", "지유", "윤서", "채원"]
    
    genders = ["male", "female"]
    
    for i in range(100):
        name = random.choice(last_names) + random.choice(first_names)
        gender = random.choice(genders)
        phone = f"010{random.randint(1000, 9999)}{random.randint(1000, 9999)}"
        age_input = random.randint(20, 50)
        birth_year = 2026 - age_input
        
        # 중복 폰번호 방지
        if Client.objects.filter(phone=phone).exists():
            phone = f"010{random.randint(1000, 9999)}{random.randint(8888, 9999)}"

        client = Client.objects.create(
            name=name,
            gender=gender,
            phone=phone,
            shop=shop,
            designer=random.choice(designers),
            age_input=age_input,
            birth_year_estimate=birth_year
        )

        # 4. 가상 방문 기록 생성 (최근 방문 필터링 테스트용)
        # 1~5회 랜덤 방문
        visit_count = random.randint(1, 5)
        for v in range(visit_count):
            # 최근 1년 이내 랜덤 날짜
            days_ago = random.randint(0, 400)
            visit_date = timezone.now() - timedelta(days=days_ago)
            
            ConsultationRequest.objects.create(
                client=client,
                admin=shop,
                designer=client.designer,
                status="CLOSED",
                created_at=visit_date
            )

    print(f"✅ 고객 100명 및 방문 기록 생성 완료.")
    print("✨ 모든 테스트 데이터가 Supabase에 성공적으로 입력되었습니다.")

if __name__ == "__main__":
    generate_test_data()
