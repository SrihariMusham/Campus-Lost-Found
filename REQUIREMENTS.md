# Requirements

## Runtime

- Node.js 20 or newer
- npm 10 or newer
- MySQL 8 or newer
- Modern web browser
- Internet access for email notifications and external frontend assets

## Node.js dependencies

Install with:

```bash
npm ci
```

Dependencies are declared in `package.json` and locked in `package-lock.json`.

## Environment variables

Copy `.env.example` to `.env` for local development. Configure the database, JWT secret, admin credentials, and SMTP credentials before starting the server.

## Database

Run `database/schema.sql` against MySQL before starting the application.
