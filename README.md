# MAU SYSTEM Login Guide

This document explains how to log in to the MAU SYSTEM for Modibbo Adama University, Yola, and which account to use for each role.

## 1. Start the app

Open the project folder in your terminal and run:

```bash
npm install
npm run dev -- --host 0.0.0.0
```

Then open the app in your browser:

- http://localhost:5173/

If port 5173 is already occupied, the app may open on a nearby port such as http://localhost:5174/.

## 2. Open the login page

When the app loads, you will see the MAU SYSTEM login screen with the following fields:

- Username
- Password

## 3. Sign in

Enter your username and password, then click the Sign in button.

If the credentials are correct, the system will redirect you to the dashboard for your role.

If the credentials are invalid, the app shows an error message:

> Invalid username or password. Use a registered system account.

## 4. Default demo accounts

The app includes built-in demo users for testing.

| Role | Username | Password | Dashboard |
| --- | --- | --- | --- |
| Admin | admin | admin123 | Admin dashboard |
| Security | security | security123 | Security verification workstation |
| Staff / Host | staff | staff123 | Host dashboard |
| Visitor | visitor | visitor123 | Visitor portal |

## 5. Role-based access after login

After successful login, the app routes users based on their role:

- Admin -> Admin Dashboard
- Security -> Security Dashboard
- Staff -> Host Dashboard
- Visitor -> Visitor Portal

## 6. Logging out

Once logged in, click the Log out button in the top-right of the app header to sign out.

## 7. Notes

- These default accounts are seeded in the local app database.
- You can change or add users from the admin dashboard if needed.
- The login flow uses the username and password combination stored in the app data.

## Quick example

To log in as the security desk user:

1. Enter: `security`
2. Enter: `security123`
3. Click Sign in
4. You will be taken to the Security Desk page

---

For support or custom account setup, use the admin panel to create or update user roles and credentials for the MAU campus environment.
