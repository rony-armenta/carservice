# Car Service Dashboard

A shop management web app built with React + Vite (frontend) and Node.js + Express + PostgreSQL (backend).

> Project root folder: `carservice/`

---

## Tech stack

**Frontend**
- React 18
- Vite 5
- Plain CSS-in-JS (inline styles, no external UI library)

**Backend**
- Node.js + Express
- PostgreSQL (latest, Fedora)
- `pg` driver
- `bcrypt` — password hashing
- `jsonwebtoken` — JWT auth
- `express-rate-limit` — brute force protection
- `express-validator` — input sanitization

---

## Running the project

**Frontend:**
```bash
cd carservice
npm install
npm run dev
```
Open `http://localhost:5173`

**Backend:**
```bash
cd carservice/server
npm install
npm run dev
```
API runs on `http://localhost:3001`

**Health check:**
```bash
curl http://localhost:3001/api/health
```

---

## First time setup — security

```bash
# 1 — Hash existing plain text passwords (run once!)
cd carservice/server
node scripts/hashPasswords.js

# 2 — Generate a strong JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Paste output into server/.env as JWT_SECRET
```

---

## Folder structure

```
carservice/
├── .gitignore                         # Excludes .env and node_modules
├── index.html
├── package.json
├── vite.config.js
├── server/
│   ├── .env                           # DB credentials + JWT secret (never commit)
│   ├── package.json
│   ├── db.js                          # PostgreSQL pool connection
│   ├── index.js                       # Express entry — CORS, rate limit, security headers
│   ├── middleware/
│   │   ├── auth.js                    # JWT verify + requireAdmin role guard
│   │   └── validate.js                # express-validator runner
│   ├── routes/
│   │   ├── customers.js               # CRUD + input validation + admin-only delete
│   │   ├── vehicles.js                # Vehicle status updates
│   │   ├── orders.js                  # CRUD + all business validations
│   │   ├── mechanics.js               # List active mechanics
│   │   ├── users.js                   # CRUD + bcrypt + JWT login + rate limit
│   │   └── carRecords.js              # Vehicle service history — full CRUD
│   └── scripts/
│       └── hashPasswords.js           # One-time migration: hash plain text passwords
└── src/
    ├── main.jsx
    ├── App.jsx                        # Root + auth guard + page routing
    ├── index.css
    ├── services/
    │   └── api.js                     # Central fetch wrapper — JWT, all endpoints
    ├── context/
    │   └── AuthContext.jsx            # Login/logout — JWT in memory, expiry handling
    ├── data/
    │   └── mockData.js                # Legacy (no longer used)
    ├── utils/
    │   └── formatters.js
    ├── hooks/
    │   ├── useOrders.js
    │   └── useCustomers.js
    ├── components/
    │   ├── StatCard.jsx
    │   ├── Layout/
    │   │   ├── Sidebar.jsx            # SVG icons, collapse toggle, logout, 4 nav items
    │   │   ├── AppLayout.jsx
    │   │   └── Topbar.jsx
    │   ├── WorkOrders/
    │   │   ├── WorkOrders.jsx
    │   │   ├── WorkOrderRow.jsx
    │   │   └── WorkOrderForm.jsx
    │   └── Customers/
    │       ├── Customers.jsx
    │       ├── CustomerRow.jsx
    │       └── CustomerForm.jsx
    └── pages/
        ├── Dashboard.jsx
        ├── LoginPage.jsx              # "Powered by: Claid 🔧"
        ├── CustomersPage.jsx
        ├── CarRecordsPage.jsx         # Vehicle service history timeline
        └── UsersPage.jsx
```

---

## PostgreSQL setup (Fedora)

```bash
sudo dnf install -y postgresql-server postgresql-contrib
sudo postgresql-setup --initdb
sudo systemctl enable --now postgresql

# Fix auth (change ident to md5 in pg_hba.conf)
sudo nano /var/lib/pgsql/data/pg_hba.conf
sudo systemctl restart postgresql

sudo -u postgres psql
```

```sql
CREATE USER carservice WITH PASSWORD 'carservice123';
CREATE DATABASE carservice OWNER carservice;
\c carservice
GRANT CONNECT ON DATABASE carservice TO carservice;
GRANT USAGE, CREATE ON SCHEMA public TO carservice;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO carservice;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO carservice;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO carservice;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO carservice;
```

### Schema tables
- `customers` — id, name, phone, initials, color
- `vehicles` — id, customer_id, make_model, plate, car_status
- `orders` — id, parent_id, vehicle_id, customer_id, mechanic_id, description, status, record_id, created_at, updated_at
- `mechanics` — id, name, active
- `users` — id, name, email, password (bcrypt), role, active
- `car_records` — id, vehicle_id, order_id, service_type, diagnostics, error_codes, notes, mileage, created_at, updated_at

### car_records SQL
```sql
CREATE TABLE car_records (
  id           SERIAL PRIMARY KEY,
  vehicle_id   INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  order_id     INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  service_type VARCHAR(100),
  diagnostics  TEXT,
  error_codes  VARCHAR(255),
  notes        TEXT,
  mileage      INTEGER,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_car_records_vehicle ON car_records(vehicle_id);
CREATE INDEX idx_car_records_order   ON car_records(order_id);
ALTER TABLE orders ADD COLUMN record_id INTEGER REFERENCES car_records(id) ON DELETE SET NULL;
```

### API endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/health | public | Health check |
| POST | /api/users/login | public | Login — returns JWT |
| GET | /api/users | admin | List users |
| POST | /api/users | admin | Create user |
| PUT | /api/users/:id | admin | Update user |
| DELETE | /api/users/:id | admin | Delete user |
| GET | /api/customers | any | List customers with vehicle |
| POST | /api/customers | any | Create customer + vehicle |
| PUT | /api/customers/:id | any | Update customer + vehicle |
| PATCH | /api/customers/:id/car-status | any | Update car status |
| DELETE | /api/customers/:id | admin | Delete customer (cascades) |
| GET | /api/vehicles | any | List vehicles |
| PATCH | /api/vehicles/:id/status | any | Update vehicle status |
| GET | /api/orders | any | List all orders |
| POST | /api/orders | any | Create order (with validations) |
| PATCH | /api/orders/:id/status | any | Update order status |
| DELETE | /api/orders/:id | any | Delete order |
| GET | /api/mechanics | any | List active mechanics |
| GET | /api/car-records | any | List all service records |
| GET | /api/car-records/vehicle/:vehicleId | any | Timeline for one vehicle |
| GET | /api/car-records/:id | any | Single record |
| POST | /api/car-records | any | Create service record |
| PUT | /api/car-records/:id | any | Update service record |
| DELETE | /api/car-records/:id | any | Delete service record |

---

## Security measures implemented

- **bcrypt** password hashing (12 salt rounds)
- **JWT tokens** — issued on login, required on all protected routes
- **Token stored in memory** (not localStorage) — cleared on logout or expiry
- **Auto logout** on token expiry — frontend listens for `auth:expired` event
- **Role-based access** — `requireAdmin` middleware on sensitive routes
- **Login rate limiting** — 10 attempts per 15 min per IP
- **Global rate limiting** — 200 requests per 15 min
- **Input validation + sanitization** on all POST/PUT routes
- **Parameterized queries** everywhere — SQL injection proof
- **Security headers** — X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
- **Body size limit** — 10kb max
- **Generic error messages** — no internals leaked to client
- **User enumeration prevention** — same error for wrong email or wrong password
- **Self-delete prevention** — admin cannot delete their own account
- **.gitignore** — .env never committed

---

## Data model

### Customer
```js
{
  id, name, initials, car, plate,
  carStatus: 'active' | 'in-repair' | 'inactive',
  orders, color,
}
```

### Order
```js
{
  id, parentId, customerId, vehicleId,
  description, status: 'pending' | 'progress' | 'done',
  mech, recordId,
}
```

### Car Record
```js
{
  id, vehicleId, orderId,
  serviceType, diagnostics, errorCodes,
  notes, mileage, createdAt, updatedAt,
  // joined: car, plate, customerName, orderDesc, orderStatus
}
```

---

## Features built

### Frontend
- [x] Login screen wired to API — "Powered by: Claid 🔧"
- [x] JWT stored in memory, sent with every request, auto logout on expiry
- [x] Sidebar — 4 nav items with SVG icons, collapse/expand toggle
- [x] Dashboard — stat cards + loading state
- [x] Work orders — filter, inline status change, sub-orders expand/collapse
- [x] New work order form — customer/car picklist, mechanic dropdown
- [x] Customers & Vehicles page — full CRUD wired to API
- [x] Car status dropdown — updates DB in real time
- [x] Service Records page — timeline view, search, vehicle filter, full CRUD
- [x] Users & Roles page — admin-only CRUD wired to API
- [x] Inline API error messages in all forms

### Backend
- [x] Express + PostgreSQL fully wired
- [x] JWT auth on all protected routes
- [x] bcrypt password hashing + migration script
- [x] Input validation on all routes
- [x] All order business logic validations
- [x] Auto car status: in-repair on order create, active on order done
- [x] Rate limiting — login + global
- [x] Car records CRUD — linked to vehicle + order, full timeline

---

## Pending / next steps

### Docker + Minikube
- [ ] `Dockerfile` for React frontend (Vite build via nginx)
- [ ] `Dockerfile` for Node.js backend
- [ ] `docker-compose.yml` (frontend + backend + postgres)
- [ ] Kubernetes manifests:
  - `deployment.yaml`
  - `service.yaml`
  - `configmap.yaml`
  - `persistentvolumeclaim.yaml`

### Other improvements
- [ ] Confirm dialog before marking order as Done
- [ ] Edit and delete orders from UI
- [ ] Auto-create a car record stub when a work order is completed
- [ ] Invoicing & revenue section
- [ ] Mechanic assignment panel
- [ ] Search and filter on Dashboard
- [ ] Refresh token flow (JWT expires after 8h)

---

## Demo users
- admin@carservice.com / admin123 (admin)
- carlos@carservice.com / carlos123 (mechanic)
- luis@carservice.com / luis123 (mechanic)

## Mechanics (seeded in DB)
- Carlos, Miguel, Luis
