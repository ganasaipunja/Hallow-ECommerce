# Mini E-Commerce (Full-Stack)

Backend: Django 5.x + DRF 3.15 + MySQL 9.x  
Frontend: React 18 + Vite 5

---

## Backend folder structure

```text
backend/
├── api/
│   ├── management/
│   │   ├── commands/
│   │   │   ├── __init__.py
│   │   │   └── seed_products.py
│   │   └── __init__.py
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── serializers.py
│   ├── urls.py
│   └── views.py
├── config/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── manage.py
├── requirements.txt
└── schema.sql          # Reference SQL schema (use migrations in practice)
```

## Frontend folder structure

```text
frontend/
├── public/
│   ├── abouthallow.png
│   ├── design_1.png
│   └── hallow.png
├── src/
│   ├── pages/
│   │   ├── About.css
│   │   ├── About.jsx
│   │   ├── Cart.css
│   │   ├── Cart.jsx
│   │   ├── Catalog.css
│   │   ├── Catalog.jsx
│   │   ├── Home.css
│   │   ├── home.jsx
│   │   ├── Login.jsx      # Login / OTP verification
│   │   ├── login.css
│   │   └── OrderSummary.jsx
│   ├── style/
│   ├── api.js             # API client (fetch)
│   ├── App.jsx
│   ├── index.css
│   ├── Layout.jsx
│   └── main.jsx
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

---

## API endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register/` | No | Register (body: username, email, password) |
| POST | `/api/auth/login/` | No | Login (body: username, password) |
| POST | `/api/auth/otp/send/` | No | Send OTP (body: phone); OTP printed in backend console |
| POST | `/api/auth/otp/verify/` | No | Verify OTP (body: phone, otp) |
| GET | `/api/products/` | No | List products |
| GET | `/api/cart/` | Token | Get current cart |
| POST | `/api/cart/add/` | Token | Add item (body: product_id, quantity) |
| DELETE | `/api/cart/remove/<item_id>/` | Token | Remove cart item |
| GET | `/api/orders/` | Token | List user orders |
| POST | `/api/orders/summary/` | Token | Create order from cart (order summary, no payment) |

**Authentication:** For protected endpoints send header: `Authorization: Token <token>` (from login/register/otp verify).

---

## Database (Django models → SQL)

- **users** – custom user (extends AbstractUser); fields: id, username, email, password, phone, otp, otp_created_at, etc.
- **products** – id, name, description, price, stock, created_at
- **cart** – id, user_id, product_id, quantity, created_at (unique on user, product)
- **orders** – id, user_id, total_amount, status, created_at
- **order_items** – id, order_id, product_id, quantity, price

See `backend/schema.sql` for the equivalent MySQL schema.

---

## Run locally

### Prerequisites

- Python 3.13
- Node.js 20+ (or 25.x)
- MySQL 9.x running; create a database, e.g. `ecommerce`

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

pip install -r requirements.txt
pip install Pillow
```

Set DB env (or edit `config/settings.py`):

```bash
set MYSQL_DATABASE=ecommerce
set MYSQL_USER=root
set MYSQL_PASSWORD=Ganasai@963
set MYSQL_HOST=127.0.0.1
set MYSQL_PORT=3306
```

Create migrations and apply (first time):

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py seed_products
```

Start server:

```bash
python manage.py runserver
```

Backend: http://127.0.0.1:8000

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173 (Vite proxies `/api` to the Django backend).

### 3. Use the app

1. Open http://localhost:5173
2. Login (password or OTP). For OTP: enter phone → send OTP → check backend console for the code → enter and verify.
3. Browse catalog, add to cart, open Cart, click “Proceed to order summary” to create an order.
4. View orders on the Orders page.

---

## Versions (reference)

- Python 3.13
- Django 5.x
- Django REST Framework 3.15.x
- MySQL 9.x
- mysqlclient 2.2.x
- Node.js 25.x
- React 18.x
- Vite 5.x
"# Hallow-ECommerce" 
