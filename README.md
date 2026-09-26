# Campus Lost & Found Portal

A full-stack web application for managing lost and found items within a college campus. Users can report lost items, submit found items with images, browse listings, and raise claim/return requests. Administrators can review requests, approve or reject them, and trigger email notifications for recovery coordination.

The project was developed as a Real-Time Research Project by students of the Department of Information Technology, Teegala Krishna Reddy Engineering College. The project report describes the system as a centralized platform with authentication, search, image uploads, admin verification, automated email notifications, and item-resolution tracking.

## Features

- User registration and login
- JWT-based authentication
- Separate user and admin roles
- Report lost items
- Report found items with image uploads
- Browse lost and found listings
- Search listings from the UI
- Claim found items
- Submit return requests for lost items
- Admin dashboard
- Admin approval/rejection workflow
- Email notifications after claim processing
- Automatic removal of resolved items from active listings
- Responsive web interface
- Health-check endpoint for deployment monitoring

## Tech Stack

### Frontend

- HTML5
- CSS3
- JavaScript
- Font Awesome / Google Fonts

### Backend

- Node.js
- Express.js
- JWT
- bcryptjs
- Multer
- Nodemailer

### Database

- MySQL 8+
- mysql2 connection pool

The project documentation specifies Node.js/Express.js for the backend, MySQL for data storage, and Nodemailer for email integration.

## Architecture

```text
Browser
   │
   ▼
Frontend (HTML / CSS / JavaScript)
   │
   │ HTTP / JSON / Multipart
   ▼
Node.js + Express API
   │
   ├── JWT Authentication
   ├── Claim / Return Workflow
   ├── Admin Verification
   ├── Image Uploads
   └── Email Notifications
   │
   ├──────────────► MySQL
   │
   └──────────────► SMTP / Email Service
```

The original project architecture describes the flow as user → frontend → Node/Express backend → MySQL, with email notifications and admin verification supporting the recovery workflow.

## Project Structure

```text
lost-found-portal/
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
│   ├── script.js
│   ├── signup.html
│   └── style.css
├── database/
│   └── schema.sql
├── uploads/
│   └── .gitkeep
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── requirements.txt
├── REQUIREMENTS.md
├── README.md
└── server.js
```

## Local Setup

### 1. Prerequisites

Install:

- Node.js 20+
- npm 10+
- MySQL 8+

### 2. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd lost-found-portal
```

### 3. Install dependencies

```bash
npm ci
```

### 4. Create the database

Open MySQL and run:

```sql
SOURCE database/schema.sql;
```

Or execute the contents of `database/schema.sql` using MySQL Workbench.

### 5. Configure environment variables

Create a `.env` file from `.env.example`.

```text
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=lostfound
JWT_SECRET=use-a-long-random-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@example.com
SMTP_PASS=your-app-password
MAIL_FROM=your-email@example.com
```

Do **not** commit `.env` to GitHub.

### 6. Start the server

For local development with a `.env` file and Node.js 20+:

```bash
node --env-file=.env server.js
```

Or, if the environment variables have already been configured in your terminal/IDE:

```bash
npm start
```

The application will be available at:

```text
http://localhost:3000
```

Health check:

```text
http://localhost:3000/api/health
```

## Admin Account

On startup, the application checks `ADMIN_USERNAME` and `ADMIN_PASSWORD`. If that username does not already exist, an admin account is created automatically.

Regular users cannot create an account using the configured admin username.

## Email Configuration

Email notifications use SMTP. For Gmail, use a Google App Password rather than your normal Gmail password.

If SMTP variables are not configured, the application continues to run but logs that email notifications were skipped. Configure SMTP before a public deployment if email notifications are part of the demo.

## Deployment

The application is structured so that the Node.js server can serve both the API and the static frontend from one service.

A deployment host should provide:

1. Node.js 20+
2. MySQL 8+ or a managed MySQL-compatible database
3. Environment-variable configuration
4. A persistent disk or external object storage for uploaded images
5. HTTPS

### Production environment variables

Set all required variables from `.env.example` in the hosting provider's environment-variable settings.

At minimum:

```text
PORT
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
JWT_SECRET
ADMIN_USERNAME
ADMIN_PASSWORD
SMTP_HOST
SMTP_PORT
SMTP_SECURE
SMTP_USER
SMTP_PASS
MAIL_FROM
```

### Start command

```bash
npm start
```

### Build command

No frontend build step is required because the current frontend is static HTML/CSS/JavaScript.

### Database deployment

Run `database/schema.sql` once against the production MySQL database before starting the application.

### Uploaded images

The application stores uploaded images in `uploads/`. Many cloud platforms use ephemeral application disks, so a public production deployment should attach persistent storage or replace local uploads with an object-storage service such as Cloudinary, Amazon S3, or another compatible provider.

## API Endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | Health check |
| POST | `/signup` | Public | Register user |
| POST | `/login` | Public | Authenticate user |
| GET | `/lost` | Public | List lost items |
| POST | `/lost` | User | Create lost-item report |
| GET | `/found` | Public | List found items |
| POST | `/found` | User | Create found-item report |
| POST | `/claim` | User | Create claim/return request |
| GET | `/claims` | Admin | View claims |
| POST | `/claims/:id/approve` | Admin | Approve claim |
| POST | `/claims/:id/reject` | Admin | Reject claim |
| DELETE | `/lost/:id` | Admin | Delete lost item |
| DELETE | `/found/:id` | Admin | Delete found item |

## Security Improvements Added for Deployment

The deployment-ready version includes:

- Password hashing with bcrypt
- JWT authentication with configurable secret and expiry
- Server-side admin authorization
- Admin-only delete and claim-management APIs
- Environment-based database credentials
- Environment-based SMTP credentials
- No hard-coded database or email passwords
- Upload size and MIME-type validation
- Parameterized SQL queries
- HTTP security headers
- JSON request-size limits
- MySQL connection pooling
- Health-check endpoint
- Production-friendly `PORT` handling

## Recommended Next Improvements

These are the next upgrades I recommend before calling the application production-grade:

1. Move uploaded images to Cloudinary/S3/object storage.
2. Add password reset and email verification.
3. Add pagination and server-side search/filtering.
4. Add rate limiting for login and signup endpoints.
5. Add audit logs for admin actions.
6. Add CSRF protection if the authentication model changes to cookies.
7. Add automated API tests.
8. Add Docker support for reproducible deployment.
9. Add a proper user profile and claim-history page.
10. Add a privacy policy and clear consent before exposing contact details.

## Project Background

The academic project documentation describes the portal as a centralized digital solution intended to replace notice boards, registers, and informal communication. It identifies reporting, browsing, claim/return requests, admin verification, email notifications, and resolution tracking as core functionality.

The project abstract also identifies secure authentication, responsive interfaces, search, image uploads, admin moderation, and automated email notifications as major features.

## Team

- M. Srihari
- M. Sanjay
- M. Vaishnavi
- M. Neeraj

Project Guide: Mrs. G. Archana, Assistant Professor, Department of Information Technology.

## Deployment Checklist

See [`docs/DEPLOYMENT_CHECKLIST.md`](docs/DEPLOYMENT_CHECKLIST.md) for the GitHub, database, backend, testing, and production checklist.

## License

This project is an academic portfolio project. Add a formal open-source license if you intend to allow reuse or redistribution.
