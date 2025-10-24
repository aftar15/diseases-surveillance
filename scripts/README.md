# Database Setup Scripts

This directory contains scripts for setting up and managing the Dengue Monitoring System database.

## Prerequisites

- MySQL server (or XAMPP with MySQL enabled)
- Node.js installed

## Database Setup Instructions

### 1. Start MySQL Server

If using XAMPP:
1. Open XAMPP Control Panel
2. Start MySQL service
3. (Optional) Start Apache if you want to use phpMyAdmin

### 2. Install Dependencies

From the `scripts` directory, run:

```bash
npm install
```

This will install the required dependencies (mysql2 and dotenv).

### 3. Set Environment Variables

Make sure you have the `.env.local` file at the root of your project with the database configuration:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=dengue_tracker
```

Adjust these values according to your MySQL setup. If using XAMPP with default settings, you can leave the password empty.

### 4. Run the Setup Script

From the `scripts` directory, run:

```bash
npm run setup-db
```

This will:
1. Create the database if it doesn't exist
2. Create all required tables
3. Set up indexes for performance
4. Insert sample data for testing

## Troubleshooting

If you encounter any issues:

1. **Connection Errors**
   - Verify MySQL is running
   - Check your host, port, username, and password in `.env.local`
   - Make sure your MySQL user has privileges to create databases and tables

2. **SQL Errors**
   - Check the console output for specific errors
   - You may need to drop the database and start over if schema changes conflict

3. **Sample Data Issues**
   - The script only inserts sample data if tables are empty
   - To reload sample data, you can drop the tables or the entire database first 