# 🩺 DiaTrack - Diabetes Management System

**Live Demo:** [https://diatrack-vd9c.onrender.com/](https://diatrack-vd9c.onrender.com/)

![Python](https://img.shields.io/badge/python-3.11-blue.svg)
![Flask](https://img.shields.io/badge/flask-2.2.5-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Deployment](https://img.shields.io/badge/deployed-Render-brightgreen.svg)

## 📋 Overview

DiaTrack is a comprehensive web-based diabetes management application that helps users track, monitor, and manage their blood sugar levels, diet, and lifestyle habits. Built with Flask and deployed on Render, it provides an intuitive interface for diabetic patients to maintain better control over their health.

## ✨ Features

### Core Functionality
- 📊 **Blood Sugar Tracking** - Log fasting and post-meal glucose readings with timestamps and notes
- 🍽️ **Food Logging** - Track meals with calorie counts and glycemic index values
- 📈 **Interactive Dashboard** - Visualize blood sugar trends over time with dynamic charts
- 📥 **Data Export** - Download your health data in Excel (XLSX) or PDF format
- 🕐 **Historical Data** - View and analyze past readings and patterns

### Data Visualization
- Line charts showing blood sugar trends over time
- Color-coded readings (normal, elevated, high)
- Date-based filtering and sorting
- Visual indicators for fasting vs post-meal readings

## 🛠️ Technology Stack

**Backend:**
- Flask 2.2.5 - Python web framework
- SQLAlchemy - ORM for database operations
- PostgreSQL - Production database (Render)
- SQLite - Local development database

**Data Processing:**
- Pandas - Data analysis and manipulation
- Matplotlib - Chart generation
- ReportLab - PDF generation
- XlsxWriter - Excel export

**Deployment:**
- Render - Cloud hosting platform
- Gunicorn - WSGI HTTP Server

## 🚀 Installation & Setup

### Prerequisites
- Python 3.11+
- Git

### Local Development

1. **Clone the repository:**
```bash
git clone https://github.com/HrithikWadile/DiaTrack.git
cd DiaTrack
```

2. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Run the application:**
```bash
python app.py
```

5. **Open in browser:**
```
http://127.0.0.1:5000
```

## 📦 Project Structure
```
DiaTrack/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── runtime.txt           # Python version specification
├── templates/            # HTML templates
│   ├── index.html       # Home page
│   └── dashboard.html   # Dashboard with charts
├── add_sample_data.py   # Script to populate sample data
├── .gitignore           # Git ignore file
└── README.md            # Project documentation
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file for local development:
```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///diabetes.db
```

For production (Render), set these in the dashboard:
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - Random secret key for sessions
- `PYTHON_VERSION` - 3.11.0

## 📊 Database Schema

### User Table
| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Primary key |
| name | String | User's name |
| dob | Date | Date of birth |
| created_at | DateTime | Account creation time |

### BloodSugar Table
| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Primary key |
| user_id | Integer | Foreign key to User |
| value | Float | Blood sugar value (mg/dL) |
| kind | String | 'fasting' or 'post-meal' |
| note | String | Optional notes |
| measured_at | DateTime | Reading timestamp |

### FoodLog Table
| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Primary key |
| user_id | Integer | Foreign key to User |
| name | String | Food name |
| calories | Integer | Calorie count |
| glycemic_index | Integer | GI value |
| logged_at | DateTime | Log timestamp |

## 🌐 Deployment

The application is deployed on Render with:
- Free PostgreSQL database
- Automatic deployments from GitHub
- HTTPS enabled by default

### Deploy Your Own

1. Fork this repository
2. Create a [Render](https://render.com) account
3. Create a PostgreSQL database
4. Create a Web Service connected to your repo
5. Add environment variables
6. Deploy!

## 📝 Usage

### Add Blood Sugar Reading
1. Enter glucose value (mg/dL)
2. Select type (fasting or post-meal)
3. Add optional date/time and notes
4. Click "Add Reading"

### Log Food
1. Enter food name
2. Add calories and glycemic index
3. Optionally set date/time
4. Click "Add Food"

### View Dashboard
- Click "📊 View Dashboard" to see trends
- Interactive charts show readings over time
- Visual representation of blood sugar patterns

### Export Data
- **Excel**: Download all readings and food logs in XLSX format
- **PDF**: Generate a summary report of recent readings

## 🎯 Future Enhancements

- [ ] AI-powered pattern detection
- [ ] Medication tracking
- [ ] Meal recommendations based on GI
- [ ] Mobile app version
- [ ] Multi-user support with authentication
- [ ] Alerts for high/low readings
- [ ] Integration with fitness trackers

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Hrithik Wadile**
- GitHub: [@HrithikWadile](https://github.com/HrithikWadile)
- Project Link: [https://github.com/HrithikWadile/DiaTrack](https://github.com/HrithikWadile/DiaTrack)

## 🙏 Acknowledgments

- Built with [Flask](https://flask.palletsprojects.com/) framework
- Deployed on [Render](https://render.com)
- Inspired by the need for better diabetes management tools
- Thanks to the open-source community

## 📧 Support

For support, create an issue in the GitHub repository or contact via email.

---

⭐ **If you find this project helpful, please give it a star on GitHub!**

---

## 📸 Screenshots

### Home Page
![Home Page](screenshots/home.png)

### Dashboard
![Dashboard](screenshots/dashboard.png)

*Note: Add screenshots to a `screenshots/` folder in your repository*

---

**Made with ❤️ for better diabetes management**
