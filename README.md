# 🎓 Campus Lost & Found Portal

A full-stack web application designed to help college students and administrators manage lost and found items within a campus.

The platform provides a centralized system where students can report lost or found items, browse listings, submit claims or return requests, and receive automated email notifications. Administrators can review requests and manage the resolution process.

---

## 🚀 Features

### 👨‍🎓 Student Features

- 🔐 User Registration & Login
- 🔑 JWT-based authentication
- 📱 Responsive user interface
- 📌 Report Lost Items
- 📦 Report Found Items
- 🔎 Browse Lost & Found Listings
- 🔍 Search and filter items
- 📝 Submit claims for found items
- 🔄 Submit return requests for lost items
- 📧 Receive automated email notifications
- 👤 Manage user information

### 👨‍💼 Admin Features

- 🔐 Secure Admin Login
- 📊 Admin Dashboard
- 📋 View reported lost and found items
- 📑 Manage claims and return requests
- ✅ Approve claims
- ❌ Reject claims
- 📧 Send automated email notifications
- 🔄 Track item resolution

---

## 📧 Email Notifications

The application uses **Nodemailer with Gmail SMTP** to send automated email notifications.

Supported notifications include:

- 🎉 Claim Approved
- ✅ Return Request Approved
- ❌ Claim Rejected
- 🔎 Someone Found Your Lost Item

The emails use responsive HTML templates with **Campus Lost & Found** branding.

---

## 🛠️ Tech Stack

### Frontend

- HTML5
- CSS3
- JavaScript
- Responsive Web Design

### Backend

- Node.js
- Express.js
- REST API

### Database

- MySQL
- MySQL2

### Authentication & Security

- JWT
- bcrypt
- Environment Variables
- CORS
- Security Headers

### Email

- Nodemailer
- Gmail SMTP

### File Uploads

- Multer

---

## 🏗️ Project Structure

```text
CampusLostFound/
│
├── public/
│   ├── assets/
│   ├── about.html
│   ├── admin.html
│   ├── claim.html
│   ├── contact.html
│   ├── find.html
│   ├── found.html
│   ├── index.html
│   ├── login.html
│   ├── return-claim.html
│   ├── signup.html
│   ├── script.js
│   └── style.css
│
├── database/
│   └── schema.sql
│
├── docs/
│   └── DEPLOYMENT_CHECKLIST.md
│
├── uploads/
│   └── .gitkeep
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── requirements.txt
├── REQUIREMENTS.md
├── README.md
└── server.js
```

---

## 🗄️ Database

The application uses **MySQL** to store user, item, and claim information.

### Main Tables

- `users`
- `lost_items`
- `found_items`
- `claims`

The database schema is available in:

```text
database/schema.sql
```

---

## 🔄 Application Workflow

```text
                    STUDENT
                       │
             ┌─────────┴─────────┐
             │                   │
          Register              Login
             │                   │
             └─────────┬─────────┘
                       │
             ┌─────────┴──────────┐
             │                    │
        Report Lost          Report Found
             │                    │
             └─────────┬──────────┘
                       │
                 Browse Items
                       │
                       ▼
              Submit Claim /
              Return Request
                       │
                       ▼
                ADMIN DASHBOARD
                       │
                ┌──────┴──────┐
                │             │
             Approve        Reject
                │             │
                ▼             ▼
          Email Alert     Email Alert
```

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/SrihariMusham/Campus-Lost-Found.git
cd Campus-Lost-Found
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create the Database

Create a MySQL database:

```sql
CREATE DATABASE lost_found_db;
```

Then import the database schema:

```text
database/schema.sql
```

### 4. Configure Environment Variables

Create a `.env` file in the project root.

Use `.env.example` as a reference.

Example:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=lost_found_db

JWT_SECRET=your_secure_jwt_secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password

MAIL_FROM=your_email@gmail.com
```

> ⚠️ **Never commit `.env` to GitHub.**

### 5. Start the Application

```bash
npm start
```

The application will be available at:

```text
http://localhost:3000
```

---

## 🔐 Security

The project includes several security measures:

- 🔒 Password hashing using bcrypt
- 🔑 JWT-based authentication
- 🛡️ Protected admin routes
- 🔐 Environment-based configuration
- 🚫 `.env` excluded from Git
- 📁 File upload validation
- 🛡️ Security headers
- 🌐 CORS configuration

---

## 📱 Responsive Design

The application is designed to work across different screen sizes:

- 💻 Desktop
- 💻 Laptop
- 📱 Mobile
- 📲 Tablet

---

## 🎯 Project Objective

The objective of the **Campus Lost & Found Portal** is to provide a centralized platform for managing lost and found items within a college campus.

Instead of relying on manual announcements or disconnected communication channels, students can report items, search listings, submit claims or return requests, and receive updates through a single platform.

Administrators can review requests, approve or reject claims, and help coordinate the recovery process.

---

## 🔮 Future Enhancements

Possible future improvements include:

- 📍 Location-based item matching
- 🤖 AI-powered lost/found item matching
- 📱 Progressive Web App support
- 🔔 Real-time notifications
- 📊 Advanced admin analytics
- ☁️ Cloud-based image storage
- 🔎 Advanced search and filtering
- 📧 Additional notification channels

---

## 👨‍💻 Author

### Srihari Musham

GitHub:  
https://github.com/SrihariMusham

---

## 📄 License

This project is intended for educational and academic purposes.
