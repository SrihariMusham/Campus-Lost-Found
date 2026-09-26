# Deployment Checklist

## Before GitHub

- [ ] Revoke the old database password and Gmail app password that were present in the original local source.
- [ ] Create a fresh `.env` from `.env.example`.
- [ ] Confirm `.env` is ignored by Git.
- [ ] Do not commit `node_modules/`.
- [ ] Do not commit runtime `uploads/` data.
- [ ] Review the repository for API keys, passwords, tokens, and personal data.
- [ ] Add screenshots to the README before publishing.

## Database

- [ ] Create a MySQL 8+ database.
- [ ] Run `database/schema.sql`.
- [ ] Verify the application database user can create/read/update/delete required records.

## Backend

- [ ] Configure all environment variables.
- [ ] Set a strong random `JWT_SECRET`.
- [ ] Set a unique production admin username/password.
- [ ] Configure SMTP using an app password or transactional email provider.
- [ ] Configure a persistent `UPLOAD_DIR` or move image storage to object storage.
- [ ] Confirm `/api/health` returns a healthy response.

## Frontend / Application

- [ ] Test registration.
- [ ] Test login/logout.
- [ ] Test lost-item reporting.
- [ ] Test found-item reporting with image upload.
- [ ] Test claim and return requests.
- [ ] Test admin approval/rejection.
- [ ] Test email notifications.
- [ ] Test delete operations as admin.
- [ ] Confirm non-admin users cannot access admin APIs.

## Production

- [ ] Use HTTPS.
- [ ] Configure the deployment provider's environment variables instead of committing secrets.
- [ ] Configure persistent image storage.
- [ ] Add backups for MySQL.
- [ ] Monitor application logs.
- [ ] Add rate limiting before opening the application to a large public audience.
