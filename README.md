# StudyQuest

StudyQuest is a secure Node.js and Microsoft SQL Server web application for managing academic tasks, deadlines, points and achievement badges.

## Technology

- Node.js and Express
- EJS, HTML, CSS and JavaScript
- Microsoft SQL Server
- bcrypt password hashing
- JWT authentication stored in an HTTP-only cookie
- express-validator input validation

## 1. Create the project locally

Open PowerShell:

```powershell
cd C:\Dev
mkdir StudyQuest
cd StudyQuest
```

Copy the supplied project files into this folder, then install packages:

```powershell
npm install
```

## 2. Create the SQL Server database

1. Open SQL Server Management Studio.
2. Connect to your local SQL Server instance.
3. Open `sql/01-create-database.sql` and execute it.
4. Open `sql/02-create-login.sql` and execute it.
5. Change the login password in both `02-create-login.sql` and `.env` before using the project beyond development.

SQL Server must allow TCP/IP connections. In SQL Server Configuration Manager:

1. Open SQL Server Network Configuration.
2. Select Protocols for your SQL Server instance.
3. Enable TCP/IP.
4. Restart the SQL Server service.

For SQL Server Express, confirm the active TCP port and place it in `.env`. Port 1433 is used in the example.

## 3. Configure environment variables

Copy `.env.example` to `.env`:

```powershell
Copy-Item .env.example .env
```

Generate a long JWT secret in PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Paste the result into `JWT_SECRET` in `.env`.

## 4. Run the application

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
```

## 5. Create the GitHub repository

On GitHub:

1. Sign in to the same account used for your first ICE task.
2. Select New repository.
3. Repository name: `StudyQuest`.
4. Keep it public or private according to your lecturer's requirements.
5. Do not initialise it with a README because this project already contains one.

Run these commands inside the project folder:

```powershell
git init
git branch -M main
git config user.name "ST10089304"
git config user.email "ST10089304@vcconnect.edu.za"
git add .
git commit -m "Create StudyQuest secure task management application"
git remote add origin https://github.com/ST10089304/StudyQuest.git
git push -u origin main
```

## Database tables

- `Users`: account details, secure password hash and point total
- `Tasks`: each user's task title, description, priority, due date and completion state
- `Badges`: available achievements
- `UserBadges`: badges earned by each user

## Security notes

- Passwords are hashed with bcrypt and never stored as plain text.
- Authentication tokens are stored in HTTP-only cookies.
- Every task query includes the authenticated user's ID, preventing one student from accessing another student's tasks.
- Form data is validated on the server.
- SQL parameters are used instead of joining user input into SQL statements.
- Secrets and database credentials are excluded from Git through `.gitignore`.
