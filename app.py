from flask import Flask, render_template, request, redirect, url_for, send_file, flash
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
from io import BytesIO
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Production configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///diabetes.db')

# Fix for Render's PostgreSQL URL format
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    dob = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class BloodSugar(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    value = db.Column(db.Float, nullable=False)
    kind = db.Column(db.String(50))  # 'fasting' or 'post-meal'
    note = db.Column(db.String(300))
    measured_at = db.Column(db.DateTime, default=datetime.utcnow)

class FoodLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    name = db.Column(db.String(200))
    calories = db.Column(db.Integer, nullable=True)
    glycemic_index = db.Column(db.Integer, nullable=True)
    logged_at = db.Column(db.DateTime, default=datetime.utcnow)

# Initialize database (replaces @app.before_first_request which is deprecated)
with app.app_context():
    db.create_all()
    # create a demo user if none exists
    if User.query.count() == 0:
        demo = User(name='Demo User')
        db.session.add(demo)
        db.session.commit()
        print("✅ Demo user created")

# Routes
@app.route('/')
def index():
    user = User.query.first()
    if not user:
        # Fallback if no user exists
        user = User(name='Demo User')
        db.session.add(user)
        db.session.commit()
    
    # last 200 readings
    readings = BloodSugar.query.filter_by(user_id=user.id).order_by(BloodSugar.measured_at.desc()).limit(200).all()
    foods = FoodLog.query.filter_by(user_id=user.id).order_by(FoodLog.logged_at.desc()).limit(50).all()
    return render_template('index.html', user=user, readings=readings, foods=foods)

@app.route('/add_reading', methods=['POST'])
def add_reading():
    user = User.query.first()
    if not user:
        flash('Error: No user found')
        return redirect(url_for('index'))
    
    try:
        value = float(request.form['value'])
        kind = request.form['kind']
        note = request.form.get('note', '')
        measured_at = request.form.get('measured_at')
        
        if measured_at:
            measured_at = datetime.fromisoformat(measured_at)
        else:
            measured_at = datetime.utcnow()
        
        r = BloodSugar(user_id=user.id, value=value, kind=kind, note=note, measured_at=measured_at)
        db.session.add(r)
        db.session.commit()
        flash('Reading added successfully! 📊')
    except Exception as e:
        flash(f'Error adding reading: {str(e)}')
        db.session.rollback()
    
    return redirect(url_for('index'))

@app.route('/add_food', methods=['POST'])
def add_food():
    user = User.query.first()
    if not user:
        flash('Error: No user found')
        return redirect(url_for('index'))
    
    try:
        name = request.form['name']
        calories = request.form.get('calories') or None
        gi = request.form.get('gi') or None
        logged_at = request.form.get('logged_at')
        
        if logged_at:
            logged_at = datetime.fromisoformat(logged_at)
        else:
            logged_at = datetime.utcnow()
        
        f = FoodLog(
            user_id=user.id, 
            name=name, 
            calories=(int(calories) if calories else None),
            glycemic_index=(int(gi) if gi else None),
            logged_at=logged_at
        )
        db.session.add(f)
        db.session.commit()
        flash('Food logged successfully! 🍽️')
    except Exception as e:
        flash(f'Error logging food: {str(e)}')
        db.session.rollback()
    
    return redirect(url_for('index'))

@app.route('/dashboard')
def dashboard():
    user = User.query.first()
    if not user:
        return render_template('dashboard.html', img=None)
    
    readings = BloodSugar.query.filter_by(user_id=user.id).order_by(BloodSugar.measured_at).all()
    
    if len(readings) == 0:
        return render_template('dashboard.html', img=None)
    
    df = pd.DataFrame([{'value': r.value, 'kind': r.kind, 'measured_at': r.measured_at} for r in readings])
    img_base64 = None
    
    if not df.empty:
        df['measured_at'] = pd.to_datetime(df['measured_at'])
        df.set_index('measured_at', inplace=True)
        
        plt.figure(figsize=(10, 5))
        df['value'].plot(title='Blood Sugar Over Time', color='#667eea', linewidth=2, marker='o')
        plt.ylabel('mg/dL')
        plt.xlabel('Date')
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        
        buf = BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        
        # Convert to base64 here in Python, not in template
        import base64
        img_base64 = base64.b64encode(buf.read()).decode('utf-8')
        plt.close()
    
    return render_template('dashboard.html', img=img_base64)

@app.route('/export_csv')
def export_csv():
    user = User.query.first()
    if not user:
        flash('Error: No user found')
        return redirect(url_for('index'))
    
    readings = BloodSugar.query.filter_by(user_id=user.id).order_by(BloodSugar.measured_at).all()
    foods = FoodLog.query.filter_by(user_id=user.id).order_by(FoodLog.logged_at).all()
    
    df_r = pd.DataFrame([{
        'measured_at': r.measured_at, 
        'value': r.value, 
        'kind': r.kind, 
        'note': r.note
    } for r in readings])
    
    df_f = pd.DataFrame([{
        'logged_at': f.logged_at, 
        'name': f.name, 
        'calories': f.calories, 
        'gi': f.glycemic_index
    } for f in foods])
    
    # combine into single excel file
    out = BytesIO()
    with pd.ExcelWriter(out, engine='xlsxwriter') as writer:
        df_r.to_excel(writer, sheet_name='readings', index=False)
        df_f.to_excel(writer, sheet_name='foodlog', index=False)
    out.seek(0)
    
    return send_file(out, download_name='diatrack_data.xlsx', as_attachment=True, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

@app.route('/export_pdf')
def export_pdf():
    user = User.query.first()
    if not user:
        flash('Error: No user found')
        return redirect(url_for('index'))
    
    readings = BloodSugar.query.filter_by(user_id=user.id).order_by(BloodSugar.measured_at.desc()).limit(50).all()
    
    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=letter)
    width, height = letter
    
    c.setFont('Helvetica-Bold', 16)
    c.drawString(50, height - 50, f"Diatrack - Diabetes Summary Report")
    
    c.setFont('Helvetica', 12)
    c.drawString(50, height - 70, f"Patient: {user.name}")
    c.drawString(50, height - 90, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    
    c.setFont('Helvetica', 10)
    y = height - 120
    
    for r in readings:
        text = f"{r.measured_at.strftime('%Y-%m-%d %H:%M')} - {r.kind} - {r.value} mg/dL - {r.note or ''}"
        c.drawString(50, y, text)
        y -= 14
        if y < 80:
            c.showPage()
            c.setFont('Helvetica', 10)
            y = height - 50
    
    c.save()
    buf.seek(0)
    
    return send_file(buf, as_attachment=True, download_name='diatrack_report.pdf', mimetype='application/pdf')

# Health check endpoint for Render
@app.route('/health')
def health():
    return {'status': 'healthy', 'app': 'Diatrack'}, 200

if __name__ == '__main__':
    # Use debug=False in production
    app.run(debug=False, host='0.0.0.0', port=int(os.getenv('PORT', 5000)))