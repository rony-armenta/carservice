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
# Paste the output into server/.env as JWT_SECRET
```

---

## Folder structure

```
carservice/
├── .gitignore                         # Excludes .env and node_modules
├── index.html
├── package.json
├── vite.config.js
├── server/                            ← Node.js + Express backend
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
│   │   ├── orders.js                  # CRUD + all validations + input sanitization
│   │   ├── mechanics.js               # List active mechanics
│   │   └── users.js                   # CRUD + bcrypt + JWT login + rate limit
│   └── scripts/
│       └── hashPasswords.js           # One-time migration: hash plain text passwords
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── services/
    │   └── api.js                     # Fetch wrapper — attaches JWT, handles 401/expiry
    ├── context/
    │   └── AuthContext.jsx            # Login/logout — stores JWT in memory, handles expiry
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
    │   │   ├── Sidebar.jsx
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
- `orders` — id, parent_id, vehicle_id, customer_id, mechanic_id, description, status, created_at, updated_at
- `mechanics` — id, name, active
- `users` — id, name, email, password (bcrypt), role, active

### API endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/health | public | Health check |
| POST | /api/users/login | public | Login — returns JWT |
| GET | /api/users | admin | List users |
| POST | /api/users | admin | Create user |
| PUT | /api/users/:id | admin | Update user |
| DELETE | /api/users/:id | admin | Delete user |
| GET | /api/customers | any | List customers |
| POST | /api/customers | any | Create customer |
| PUT | /api/customers/:id | any | Update customer |
| PATCH | /api/customers/:id/car-status | any | Update car status |
| DELETE | /api/customers/:id | admin | Delete customer |
| GET | /api/vehicles | any | List vehicles |
| PATCH | /api/vehicles/:id/status | any | Update vehicle status |
| GET | /api/orders | any | List orders |
| POST | /api/orders | any | Create order |
| PATCH | /api/orders/:id/status | any | Update order status |
| DELETE | /api/orders/:id | any | Delete order |
| GET | /api/mechanics | any | List mechanics |

---

## Security measures implemented

- **bcrypt** password hashing (12 salt rounds)
- **JWT tokens** — issued on login, required on all protected routes
- **Token stored in memory** (not localStorage) — cleared on logout or expiry
- **Auto logout** when token expires — frontend listens for `auth:expired` event
- **Role-based access** — `requireAdmin` middleware on sensitive routes
- **Login rate limiting** — 10 attempts per 15 min per IP
- **Global rate limiting** — 200 requests per 15 min
- **Input validation + sanitization** on all POST/PUT routes via express-validator
- **Parameterized queries** everywhere — no raw SQL string interpolation
- **Security headers** — X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
- **Body size limit** — 10kb max request body
- **Generic error messages** — no internal details leaked to client
- **User enumeration prevention** — same error for wrong email or wrong password
- **Self-delete prevention** — admin cannot delete their own account
- **.gitignore** — .env files never committed

---

## Data model

### Customer
```js
{
  id: Number,
  name: String,
  initials: String,
  car: String,
  plate: String,
  carStatus: String,      // 'active' | 'in-repair' | 'inactive'
  orders: Number,
  color: String,
}
```

### Order
```js
{
  id: Number,
  parentId: Number|null,
  customerId: Number,
  vehicleId: Number,
  description: String,
  status: String,         // 'pending' | 'progress' | 'done'
  mech: String|null,
}
```

---

## Features built

### Frontend
- [x] Login screen wired to API — "Powered by: Claid 🔧"
- [x] JWT token stored in memory, sent with every API request
- [x] Auto logout on token expiry
- [x] Left sidebar with SVG icons, collapse/expand
- [x] Dashboard with stat cards + loading state
- [x] Work orders panel — filter bar, inline status dropdown
- [x] New work order form — customer/car picklist, mechanic dropdown
- [x] Sub-orders — expand/collapse, create under pending/in-progress parents
- [x] Customers & Vehicles page — full CRUD
- [x] Car status dropdown per customer
- [x] Users & Roles page — admin-only CRUD
- [x] API error messages shown inline in forms

### Backend
- [x] Express + PostgreSQL fully wired
- [x] JWT auth on all protected routes
- [x] bcrypt password hashing
- [x] Input validation on all routes
- [x] All order business logic validations
- [x] Auto car status updates on order create/complete
- [x] Rate limiting on login and global

---

## Pending / next steps

### Docker + Minikube
- [ ] Create `Dockerfile` for React frontend (Vite build via nginx)
- [ ] Create `Dockerfile` for Node.js backend
- [ ] Write `docker-compose.yml` (frontend + backend + postgres)
- [ ] Write Kubernetes manifests:
  - `deployment.yaml`
  - `service.yaml`
  - `configmap.yaml`
  - `persistentvolumeclaim.yaml`

### Other improvements
- [ ] Confirm dialog before marking order as Done
- [ ] Edit and delete orders from the UI
- [ ] Invoicing & revenue section
- [ ] Mechanic assignment panel
- [ ] Search and filter customers
- [ ] Refresh token flow (currently JWT expires after 8h — user must re-login)

---

## Demo users (seeded in DB — passwords hashed after running migration)
- admin@carservice.com / admin123 (admin)
- carlos@carservice.com / carlos123 (mechanic)
- luis@carservice.com / luis123 (mechanic)

## Mechanics (seeded in DB)
- Carlos, Miguel, Luis
