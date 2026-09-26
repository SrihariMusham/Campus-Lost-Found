# 🎓 Campus Lost & Found Portal

A full-stack web application designed to help college students and administrators manage lost and found items on campus.

The platform allows students to report lost or found items, browse available listings, submit claims or return requests, and receive email notifications about their requests.

---

## 🚀 Features

### 👨‍🎓 Student Features

- 🔐 User Registration & Login
- 🔑 Secure authentication using JWT
- 📱 Responsive user interface
- 📌 Report Lost Items
- 📦 Report Found Items
- 🔎 Browse Lost & Found Items
- 🔍 Search and filter listings
- 📝 Submit claims for found items
- 🔄 Submit return requests for lost items
- 📧 Receive email notifications
- 👤 Manage user information

### 👨‍💼 Admin Features

- 🔐 Secure Admin Login
- 📊 Admin Dashboard
- 📋 View reported lost and found items
- 📑 Manage claims and return requests
- ✅ Approve claims
- ❌ Reject claims
- 📧 Automatic email notifications
- 🔄 Track item resolution

---

## 📧 Email Notifications

The system uses **Nodemailer + Gmail SMTP** to automatically notify users when their requests are processed.

Supported notifications include:

- 🎉 Claim Approved
- ✅ Return Request Approved
- ❌ Claim Rejected
- 🔎 Someone Found Your Lost Item

Emails use responsive HTML templates with Campus Lost & Found branding.

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

- JWT Authentication
- bcrypt Password Hashing
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
