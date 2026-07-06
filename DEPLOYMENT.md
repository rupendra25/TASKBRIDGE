# TaskBridge Deployment Guide

This document outlines the steps to deploy the TaskBridge application to production, specifically focusing on Vercel (Frontend) and Render (Backend).

## 1. Database Deployment
We recommend using a managed MySQL database provider such as:
- [Aiven](https://aiven.io/mysql)
- [Railway](https://railway.app/)
- [PlanetScale](https://planetscale.com/) (Requires MySQL compatibility mode)

**Migration Instructions:**
Export your local database schema (and data if needed) using `mysqldump` or a GUI tool like phpMyAdmin/DBeaver, and import it into your production database instance. Make sure to note your connection string details (Host, Port, User, Password, Database Name).

## 2. Backend Deployment (Render)
1. Push your code to a GitHub repository.
2. Go to [Render](https://render.com) and create a new **Web Service**.
3. Connect your GitHub repository and select the `backend` folder as the Root Directory.
4. Set the Build Command to `npm install` and the Start Command to `npm start`.
5. Under **Environment Variables**, add the following (refer to `backend/.env.example`):
   - `PORT`: (Render will set this automatically, but you can set to 5000)
   - `DB_HOST`: Your production MySQL host
   - `DB_USER`: Your production MySQL user
   - `DB_PASSWORD`: Your production MySQL password
   - `DB_NAME`: Your production MySQL database
   - `DB_PORT`: Your production MySQL port (usually 3306 or 25060)
   - `JWT_SECRET`: A secure random string for signing JWT tokens
   - `EMAIL_USER`: Your email address for sending notifications
   - `EMAIL_PASS`: Your email App Password
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g., `https://taskbridge.vercel.app`)
6. Deploy the web service. Note the backend URL (e.g., `https://taskbridge-backend.onrender.com`).

## 3. Frontend Deployment (Vercel)
1. Go to [Vercel](https://vercel.com) and create a new **Project**.
2. Connect your GitHub repository and select the frontend root directory (the folder containing `vite.config.js`).
3. Vercel will automatically detect Vite. The Build command will be `npm run build` and output directory will be `dist`.
4. Under **Environment Variables**, add the following (refer to `.env.production`):
   - `VITE_API_URL`: Your backend URL with `/api` appended (e.g., `https://taskbridge-backend.onrender.com/api`)
   - `VITE_SOCKET_URL`: Your backend URL (e.g., `https://taskbridge-backend.onrender.com`)
5. Deploy the project.

## 4. Email Configuration
TaskBridge uses Nodemailer for automatic email notifications.
- **Gmail**: You must use a "Google App Password", not your standard account password. Enable 2-Step Verification on your Google account to generate one.
- **Brevo/SendGrid**: If using an SMTP service, update the `service` or `host` settings in `backend/config/mail.js` to match your provider.

## Troubleshooting Common Issues
- **CORS Errors**: Ensure your `FRONTEND_URL` environment variable exactly matches your Vercel URL (with `https://` and without trailing slashes).
- **Socket Disconnects**: Ensure `VITE_SOCKET_URL` is configured exactly as your backend domain on Vercel.
- **MySQL Connection Refused**: Double-check your database credentials in Render. Ensure your database provider allows external connections (IP whitelisting).
- **SMTP Authentication Failed**: Ensure you are using an App Password and not your account password.
- **JWT Errors**: Ensure `JWT_SECRET` is defined in Render environment variables. If changing the secret, all active users will be logged out.
