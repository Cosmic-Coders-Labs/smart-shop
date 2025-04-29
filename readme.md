# SmartShop Laravel Application

Welcome to **SmartShop**, a Laravel-based e-commerce application. This README provides instructions for setting up and running the SmartShop application locally using Laravel 12 with a MySQL database.

## Prerequisites

Before running the application, ensure you have the following installed:

- **PHP** (>= 8.2)
- **Composer** (latest version)
- **MySQL** (5.7 or higher)
- **Node.js** and **NPM** (for front-end assets)
- **Git** (for cloning the repository)

## Setup Instructions

Follow these steps to set up and run the SmartShop application:

### 1. Clone the Repository

Clone the SmartShop repository to your local machine:

```bash
git clone https://github.com/Cosmic-Coders-Labs/smart-shop.git
cd smartshop
```

### 2. Install Dependencies

Install the required PHP and JavaScript dependencies:

```bash
composer install
npm install
```

### 3. Configure Environment File

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Update the `.env` file with your MySQL database credentials:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=smartshop
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
```

Replace `smartshop` with your database name, and `your_mysql_username`/`your_mysql_password` with your MySQL credentials.

### 4. Generate Application Key

Generate a unique application key for Laravel:

```bash
php artisan key:generate
```

### 5. Run Migrations

Run the database migrations to create the necessary tables:

```bash
php artisan migrate
```

(Optional) Seed the database with sample data:

```bash
php artisan db:seed
```

### 6. Build Front-End Assets

Compile the front-end assets (CSS, JavaScript) using Vite:

```bash
npm run build
```

### 7. Start the Development Server

Run the Laravel development server:

```bash
php artisan serve
```

The application will be accessible at `http://localhost:8000`.

### 8. Access the Application

Open your browser and navigate to `http://localhost:8000`. If everything is set up correctly, you should see the SmartShop homepage.

## Additional Commands

- **Clear Configuration Cache** (if you encounter configuration issues):

    ```bash
    php artisan config:clear
    ```

- **Run Tests** (if applicable):

    ```bash
    php artisan test
    ```

- **Queue Worker** (if the application uses queues):
    ```bash
    php artisan queue:work
    ```

## Troubleshooting

- **Database Connection Errors**: Ensure MySQL is running, and the `.env` file has the correct credentials. Verify the MySQL user has proper permissions.
- **Missing Dependencies**: Run `composer install` and `npm install` again if you encounter errors.
- **Port Conflicts**: If port `8000` is in use, specify a different port with `php artisan serve --port=8001`.
- **Vite Errors**: Ensure Node.js and NPM are installed, and run `npm run build` to recompile assets.

## Project Structure

- `app/`: Contains the application logic (models, controllers, etc.).
- `database/`: Includes migrations and seeders.
- `resources/`: Contains views, CSS, and JavaScript files.
- `routes/`: Defines the application routes.
- `public/`: Stores compiled assets and the entry point (`index.php`).

## Contributing

To contribute to SmartShop, please fork the repository, create a new branch, and submit a pull request. Ensure your code follows Laravel coding standards and includes tests where applicable.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

For any issues or questions, please open an issue on the GitHub repository or contact the project maintainer.

Happy shopping with SmartShop!
