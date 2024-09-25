from app import app, db, User, BloodSugar, FoodLog
from datetime import datetime

print("Starting to add sample data...")

with app.app_context():
    user = User.query.first()
    
    if not user:
        print("❌ No user found! Creating demo user...")
        user = User(name='Demo User')
        db.session.add(user)
        db.session.commit()
    
    print(f"👤 Found user: {user.name} (ID: {user.id})")
    
    # Add sample readings with custom dates starting from 2024-09-12
    sample_readings = [
        {'value': 98, 'kind': 'fasting', 'date': datetime(2024, 9, 12, 7, 0), 'note': 'Morning'},
        {'value': 145, 'kind': 'post-meal', 'date': datetime(2024, 9, 12, 13, 30), 'note': 'After lunch'},
        {'value': 92, 'kind': 'fasting', 'date': datetime(2024, 9, 13, 7, 0), 'note': 'Morning'},
        {'value': 138, 'kind': 'post-meal', 'date': datetime(2024, 9, 13, 20, 0), 'note': 'After dinner'},
        {'value': 105, 'kind': 'fasting', 'date': datetime(2024, 9, 14, 7, 0), 'note': 'Morning'},
        {'value': 152, 'kind': 'post-meal', 'date': datetime(2024, 9, 14, 13, 0), 'note': 'After lunch'},
        {'value': 88, 'kind': 'fasting', 'date': datetime(2024, 9, 15, 7, 0), 'note': 'Morning'},
        {'value': 142, 'kind': 'post-meal', 'date': datetime(2024, 9, 15, 19, 45), 'note': 'After dinner'},
        {'value': 95, 'kind': 'fasting', 'date': datetime(2024, 9, 16, 7, 0), 'note': 'Morning'},
        {'value': 135, 'kind': 'post-meal', 'date': datetime(2024, 9, 16, 12, 45), 'note': 'After lunch'},
        {'value': 102, 'kind': 'fasting', 'date': datetime(2024, 9, 17, 7, 0), 'note': 'Morning'},
        {'value': 148, 'kind': 'post-meal', 'date': datetime(2024, 9, 17, 20, 15), 'note': 'After dinner'},
        {'value': 90, 'kind': 'fasting', 'date': datetime(2024, 9, 18, 7, 0), 'note': 'Morning'},
        {'value': 140, 'kind': 'post-meal', 'date': datetime(2024, 9, 18, 13, 20), 'note': 'After lunch'},
    ]
    
    print(f"📊 Adding {len(sample_readings)} blood sugar readings...")
    
    for i, reading in enumerate(sample_readings, 1):
        try:
            r = BloodSugar(
                user_id=user.id,
                value=reading['value'],
                kind=reading['kind'],
                measured_at=reading['date'],
                note=reading['note']
            )
            db.session.add(r)
            print(f"  ✓ Added reading {i}: {reading['value']} mg/dL on {reading['date']}")
        except Exception as e:
            print(f"  ✗ Error adding reading {i}: {e}")
    
    # Add sample foods with custom dates
    sample_foods = [
        {'name': 'Oatmeal with berries', 'calories': 250, 'gi': 55, 'date': datetime(2024, 9, 12, 7, 30)},
        {'name': 'Grilled chicken salad', 'calories': 320, 'gi': 35, 'date': datetime(2024, 9, 13, 13, 0)},
        {'name': 'Brown rice and vegetables', 'calories': 380, 'gi': 50, 'date': datetime(2024, 9, 14, 19, 30)},
        {'name': 'Greek yogurt', 'calories': 150, 'gi': 40, 'date': datetime(2024, 9, 15, 10, 0)},
        {'name': 'Whole wheat toast with avocado', 'calories': 280, 'gi': 45, 'date': datetime(2024, 9, 16, 7, 30)},
        {'name': 'Salmon with quinoa', 'calories': 420, 'gi': 35, 'date': datetime(2024, 9, 17, 20, 0)},
    ]
    
    print(f"\n🍽️ Adding {len(sample_foods)} food logs...")
    
    for i, food in enumerate(sample_foods, 1):
        try:
            f = FoodLog(
                user_id=user.id,
                name=food['name'],
                calories=food['calories'],
                glycemic_index=food['gi'],
                logged_at=food['date']
            )
            db.session.add(f)
            print(f"  ✓ Added food {i}: {food['name']}")
        except Exception as e:
            print(f"  ✗ Error adding food {i}: {e}")
    
    try:
        db.session.commit()
        print("\n✅ All data committed to database successfully!")
    except Exception as e:
        print(f"\n❌ Error committing to database: {e}")
        db.session.rollback()
    
    # Verify the data was added
    total_readings = BloodSugar.query.filter_by(user_id=user.id).count()
    total_foods = FoodLog.query.filter_by(user_id=user.id).count()
    
    print(f"\n📈 Final count:")
    print(f"   Total readings: {total_readings}")
    print(f"   Total foods: {total_foods}")