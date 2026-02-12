# Pharmacare

Pharmacare is a comprehensive Django-based pharmacy management system designed to streamline inventory management, user accounts, and billing processes for pharmacies.

## Features

- **User Management**: Registration, login, and profile management for users.
- **Inventory Management**: Add, update, and track medicines with details like name, composition, manufacturing date, expiry date, MRP, buy/sell prices, and stock levels.
- **Billing System**: Handle billing and payments integration (using Stripe).
- **Admin Panel**: Administrative interface for managing users, inventory, and system settings.
- **Dashboard**: Overview of key metrics like total medicines, soon-expiring items, etc.
- **Responsive UI**: Built with HTML, CSS, and JavaScript for a user-friendly experience.

## Technologies Used

- **Backend**: Django 5.0.4
- **Database**: SQLite (default), with support for MySQL via mysqlclient
- **Frontend**: HTML, CSS, JavaScript
- **Other Libraries**: Django Framework, Pillow, Faker, Requests, python-dotenv

## Installation

1. **Clone the Repository**:
   ```
   git clone <repository-url>
   cd Pharmacare
   ```

2. **Install Dependencies**:
   ```
   pip install -r requirements.txt
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the root directory and add necessary environment variables (e.g., Stripe keys, database settings).

4. **Run Migrations**:
   ```
   python manage.py migrate
   ```

5. **Create Superuser**:
   ```
   python manage.py createsuperuser
   ```

6. **Run the Development Server**:
   ```
   python manage.py runserver
   ```

7. **Access the Application**:
   Open your browser and go to `http://localhost:8000`.

- **Home**: Landing page with navigation.
- **Registration/Login**: Create an account or log in.
- **Dashboard**: View inventory summaries and alerts.
- **Inventory**: Manage medicines (add, edit, delete).
- **Billing**: Process payments and view bills.
- **Admin**: Access Django admin for advanced management.





