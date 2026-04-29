# BWA Dojo

## Table of Contents

1. [Project Overview](#project-overview)
2. [Security Notice](#security-notice)
3. [Main Features](#main-features)
4. [Setup](#setup)
   - [General Requirements](#general-requirements)
   - [Important Note About Admin Features](#important-note-about-admin-features)
5. [Local Deployment](#local-deployment)
   - [Download the Project](#download-the-project)
   - [PostgreSQL Setup](#postgresql-setup)
   - [Backend Setup](#backend-setup)
   - [Frontend Setup](#frontend-setup)
6. [Docker Deployment](#docker-deployment)
7. [Default Accounts](#default-accounts)
8. [Useful Commands](#useful-commands)

## Project Overview

BWA Dojo is a deliberately vulnerable web application developed as part of a bachelor project. The application simulates a small e-commerce platform for digital game keys, where users can browse products, register an account, add games to the cart, complete a checkout, and view their orders.

The project is designed to work as a security testing environment. It contains normal web application features, but it also includes intentionally implemented vulnerabilities that can be used to study how common web security issues appear in a realistic application flow.

The application is built with:

- Next.js for the frontend;
- Laravel for the backend API;
- PostgreSQL as the database;
- Docker for containerized deployment.

The main goal of the project is not to provide a secure production application, but to create a controlled dojo where vulnerabilities can be tested, exploited, and compared against automated security scanners and manual testing.

## Security Notice

BWA Dojo is intentionally vulnerable.

It should only be used in a local machine, virtual machine, or isolated lab environment. The application contains weaknesses by design, so it should not be deployed on a public server or exposed to the internet.

The project is meant for learning, testing, and research purposes. Do not use it with real user data, real credentials, or any production database.

## Main Features

BWA Dojo includes the main features of a small game-key e-commerce application:

- user registration and login
- JWT-based authentication
- user logout
- product catalog
- product detail pages
- product comments and reviews
- shopping cart
- checkout flow
- order creation
- game key assignment after purchase
- user profile page
- user order history
- admin area for managing users
- admin area for managing products
- admin area for managing orders

These features are implemented so that the application behaves like a complete web app, while still keeping the vulnerable parts inside realistic user and admin workflows.

## Setup

This section explains the general requirements before running the application.

BWA Dojo can be started in two main ways:

- with Docker
- with a local manual setup

Docker is the easiest option if the goal is to quickly run the full application. The local setup is more useful when changing the code, debugging the backend or frontend, or testing all admin features without host-related restrictions.

### General Requirements

For the Docker setup, you need:

- Docker Desktop
- Docker Compose
- a terminal such as PowerShell, Windows Terminal, or a Linux shell

For the local setup, you need:

- Node.js 20 or newer
- pnpm
- PHP 8.2 or newer
- Composer
- PostgreSQL
- Git

### Important Note About Admin Features

Some admin features are intentionally restricted to local-host access as part of the vulnerable design of the dojo.

Because of this, if you want to test all normal admin functionality, it is recommended to run the application locally and access it through:

`http://localhost:3000`

with the backend API configured as:

`http://localhost:8000/api`

If the application is accessed through `127.0.0.1`, some admin requests may be blocked with this message:

```text
Admin interface only available to local users.
```

This behaviour is intentional. It is part of the security testing scenario implemented in the application.

## Local Deployment

The local deployment runs each part of the application directly on the host machine, without Docker.

This setup is useful during development because the frontend, backend, and database can be started and debugged separately.

The local setup uses:

- PostgreSQL running on the host machine;
- Laravel running on `http://localhost:8000`;
- Next.js running on `http://localhost:3000`.

### Download the Project

First, clone the repository from GitHub:

```powershell
git clone https://github.com/Sebiu98/BWA_BrokenWebApplication.git
```

Move into the project folder:

```powershell
cd BWA_BrokenWebApplication
```

### PostgreSQL Setup

Make sure PostgreSQL is installed and running.

On Windows, you can check the PostgreSQL service from PowerShell:

```powershell
Get-Service *postgres*
```

If the service is stopped, start it:

```powershell
Start-Service postgresql-x64-18
```

The service name may be different depending on the installed PostgreSQL version.

Create the database used by the application:

```powershell
psql -U postgres
```

Inside the PostgreSQL shell:

```sql
CREATE DATABASE bwa_dojo;
```

Exit with:

```sql
\q
```

### Backend Setup

Go to the backend folder:

```powershell
cd backend
```

Install PHP dependencies:

```powershell
composer install
```

Create the backend environment file if it does not already exist:

```powershell
copy .env.example .env
```

Configure the database connection in `backend/.env`:

```env
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=bwa_dojo
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password

FRONTEND_URL=http://localhost:3000
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

Generate the Laravel application key:

```powershell
php artisan key:generate
```

This command automatically writes `APP_KEY` inside `backend/.env`.
  
Generate a JWT secret:

```powershell
php -r "echo bin2hex(random_bytes(32)) . PHP_EOL;"
```

Then paste the generated value into `backend/.env`:

Example:

```env
JWT_SECRET=PASTE_GENERATED_VALUE_HERE
```

`JWT_SECRET` is required to sign and verify the JWT tokens used by the login system.

Clear the Laravel configuration cache:

```powershell
php artisan config:clear
```

Run migrations and seed the database:

```powershell
php artisan migrate:fresh --seed
```

Start the backend server:

```powershell
php artisan serve --host=localhost --port=8000
```

### Frontend Setup

Open a second terminal and go back to the project root folder.

Install frontend dependencies:

```powershell
pnpm install
```

Create or update `.env.local` in the project root:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

Start the frontend development server:

```powershell
pnpm run dev
```

The frontend will be available at:

`http://localhost:3000`

At this point, the application should be able to load products, register users, login, and communicate with the backend API.

## Docker Deployment

Docker is the easiest way to run the application.

The Docker setup starts:

- the Next.js frontend
- the Laravel backend API
- the PostgreSQL database

This setup uses the pre-built image published on Docker Hub, so you do not need to install Composer, Node.js, pnpm, or PostgreSQL manually.

The only optional exception is PHP: the commands below use PHP only to generate random values for `APP_KEY` and `JWT_SECRET`.

> [!NOTE]
> If PHP is not installed on your machine, you can use another random generator. `APP_KEY` must be a 32-byte random value encoded in Base64 and must keep the `base64:` prefix. `JWT_SECRET` can be a long random string, for example a 64-character hexadecimal string.

### 1. Clone the repository

The repository is still needed because it contains the Docker Compose file and the environment example file.

```powershell
git clone https://github.com/Sebiu98/BWA_BrokenWebApplication.git
```

Move into the project folder:

```powershell
cd BWA_BrokenWebApplication
```

### 2. Create the environment file

Copy the example environment file:

```powershell
copy .env.example .env
```

On Linux or macOS, use:

```bash
cp .env.example .env
```

### 3. Check the Docker image version

Open `.env` and check this value:

```env
BWA_WEBAPP_IMAGE=sebiu98/bwa-webapp:latest
```

The latest tag always points to the most recently published image but if you wish you can also use a versioned tag for an older image.

### 4. Set the required secrets

In `.env`, set values for:

```env
APP_KEY=
JWT_SECRET=
```

These values are required by the Laravel backend and the JWT authentication system.

Generate `APP_KEY` with:

```powershell
php -r "echo 'base64:' . base64_encode(random_bytes(32)) . PHP_EOL;"
```

Copy the generated value into `.env`:

```env
APP_KEY=base64:PASTE_GENERATED_VALUE_HERE
```

Then generate JWT_SECRET with:

```powershell
php -r "echo bin2hex(random_bytes(32)) . PHP_EOL;"
```

Copy the generated value into `.env`:

```env
JWT_SECRET=PASTE_GENERATED_VALUE_HERE
```

After this step, both values should no longer be empty.

### 5. Start the application

Run:

```powershell
docker compose -f docker-compose.release.yml up -d
```

This command starts the database and the web application.

If the image is not already available locally, Docker Compose downloads it automatically from Docker Hub.

### 6. Check that the containers are running

Run:

```powershell
docker compose -f docker-compose.release.yml ps
```

You should see the database container and the web application container running.

### 7. Open the application

Open the frontend in the browser:
`http://127.0.0.1:3000`

The backend API is available at:
`http://127.0.0.1:8000/api`

### 8. Stop the application

To stop the containers, run:

```powershell
docker compose -f docker-compose.release.yml down
```

### 9. Reset the database

To stop the containers and delete the database data, run:

```powershell
docker compose -f docker-compose.release.yml down -v
```

Use this only if you want to reset the application data.

## Default Accounts

After running the database seed, the application includes a default administrator account:

`Email: admin@gmail.com`
`Password: admin1234`

This account can be used to access the admin area and test the administrative features of the application.

For a standard user account, it is recommended to register a new user directly from the web interface.

## Useful Commands

### Docker

Start the Docker deployment:

```powershell
docker compose -f docker-compose.release.yml up -d
```

Stop the Docker deployment:

```powershell
docker compose -f docker-compose.release.yml down
```

View Docker logs:

```powershell
docker compose -f docker-compose.release.yml logs -f
```

Reset the Docker database:

```powershell
docker compose -f docker-compose.release.yml down -v
```

### Backend

Run migrations and seed the database:

```powershell
php artisan migrate:fresh --seed
```

Clear Laravel configuration cache:

```powershell
php artisan config:clear
```

Start the Laravel backend:

```powershell
php artisan serve --host=localhost --port=8000
```

### Frontend

Install frontend dependencies:

```powershell
pnpm install
```

Start the frontend development server:

```powershell
pnpm run dev
```

Build the frontend:

```powershell
pnpm run build
```
