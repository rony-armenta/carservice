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

## Folder structure

```
carservice/
├── index.html
├── package.json
├── vite.config.js
├── server/                        ← Node.js + Express backend
│   ├── .env                       # DB credentials (never commit this)
│   ├── package.json
│   ├── db.js                      # PostgreSQL pool connection
│   ├── index.js                   # Express entry point
│   └── routes/
│       ├── customers.js           # CRUD + car status
│       ├── vehicles.js            # Vehicle status updates
│       ├── orders.js              # CRUD + all validations
│       ├── mechanics.js           # List active mechanics
│       └── users.js               # CRUD + login
└── src/
    ├── main.jsx                   # App entry point
    ├── App.jsx                    # Root + auth guard + page routing
    ├── index.css                  # Global reset + CSS variables
    ├── context/
    │   └── AuthContext.jsx        # Hardcoded login/logout state
    ├── data/
    │   └── mockData.js            # In-memory data (to be replaced by API)
    ├── utils/
    │   └── formatters.js          # Status labels, badge styles, avatar colors, date helper
    ├── hooks/
    │   ├── useOrders.js           # Order state, filtering, addOrder, addSubOrder, updateStatus
    │   └── useCustomers.js        # Customer state, addCustomer, editCustomer, deleteCustomer, updateCarStatus
    ├── components/
    │   ├── StatCard.jsx           # Summary metric card
    │   ├── Layout/
    │   │   ├── Sidebar.jsx        # Left sidebar with SVG icons, collapse toggle, logout
    │   │   ├── AppLayout.jsx      # Sidebar + main content wrapper
    │   │   └── Topbar.jsx         # Dashboard header with date
    │   ├── WorkOrders/
    │   │   ├── WorkOrders.jsx     # Panel + filter bar
    │   │   ├── WorkOrderRow.jsx   # Single order row with sub-order expand
    │   │   └── WorkOrderForm.jsx  # Modal form — customer picklist + car status validation
    │   └── Customers/
    │       ├── Customers.jsx      # Panel
    │       ├── CustomerRow.jsx    # Single customer row with car status dropdown
    │       └── CustomerForm.jsx   # Modal form — supports create and edit
    └── pages/
        ├── Dashboard.jsx          # Assembles everything, owns modal open/close state
        ├── LoginPage.jsx          # Login screen — "Powered by: Claid 🔧"
        ├── CustomersPage.jsx      # Full CRUD table for customers & vehicles
        └── UsersPage.jsx          # Users & roles management (admin only)
```

---

## PostgreSQL setup (Fedora)

```bash
# Install
sudo dnf install -y postgresql-server postgresql-contrib
sudo postgresql-setup --initdb
sudo systemctl enable --now postgresql

# Fix auth method (change ident to md5 in pg_hba.conf)
sudo nano /var/lib/pgsql/data/pg_hba.conf
sudo systemctl restart postgresql

# Create user and database
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
- `users` — id, name, email, password, role, active

### API endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /api/customers | List all customers with vehicle |
| POST | /api/customers | Create customer + vehicle |
| PUT | /api/customers/:id | Update customer + vehicle |
| PATCH | /api/customers/:id/car-status | Update car status |
| DELETE | /api/customers/:id | Delete customer (cascades) |
| GET | /api/vehicles | List all vehicles |
| PATCH | /api/vehicles/:id/status | Update vehicle status |
| GET | /api/orders | List all orders |
| POST | /api/orders | Create order (with validations) |
| PATCH | /api/orders/:id/status | Update order status (with validations) |
| DELETE | /api/orders/:id | Delete order |
| GET | /api/mechanics | List active mechanics |
| GET | /api/users | List users (no passwords) |
| POST | /api/users/login | Login |
| POST | /api/users | Create user |
| PUT | /api/users/:id | Update user |
| DELETE | /api/users/:id | Delete user |

---

## Data model

### Customer
```js
{
  id: Number,
  name: String,
  initials: String,       // auto-generated from name
  car: String,            // e.g. "Honda Civic 2019"
  plate: String,          // license plate
  carStatus: String,      // 'active' | 'in-repair' | 'inactive'
  orders: Number,         // order count
  color: String,          // avatar color: 'blue' | 'teal' | 'coral' | 'purple' | 'amber'
}
```

### Order
```js
{
  id: String,             // e.g. '#042'
  parentId: String|null,  // null = main order, '#042' = sub-order
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
- [x] Login screen with auth guard — "Powered by: Claid 🔧"
- [x] Left sidebar with clean SVG icons, collapse/expand toggle
- [x] Dashboard page with summary stat cards
- [x] Work orders panel — filter bar, inline status dropdown
- [x] New work order form — customer/car picklist from registry
- [x] Sub-orders — create under pending/in-progress parents, expand/collapse
- [x] Customers & Vehicles page — full CRUD table
- [x] Car status dropdown per customer (Active / In repair / Inactive)
- [x] Users & Roles page — admin can create, edit, delete users
- [x] Page routing (Dashboard / Customers / Users)

### Backend (API ready, frontend not yet wired)
- [x] Express server on port 3001
- [x] PostgreSQL connection with `pg` pool
- [x] All CRUD routes for customers, vehicles, orders, mechanics, users
- [x] Validation: block order if car is inactive
- [x] Validation: block duplicate active order for same vehicle
- [x] Validation: block sub-order if parent is done
- [x] Validation: block duplicate sub-order descriptions
- [x] Validation: block marking order done if sub-orders still pending
- [x] Auto set car to `in-repair` when order is created
- [x] Auto set car back to `active` when order is marked done

---

## Pending / next steps

### Connect frontend to backend API
- [ ] Create `src/services/api.js` — central fetch wrapper
- [ ] Replace `useOrders.js` mock data with API calls
- [ ] Replace `useCustomers.js` mock data with API calls
- [ ] Wire `AuthContext` login to `POST /api/users/login`
- [ ] Wire `UsersPage` to API
- [ ] Handle loading and error states in the UI

### Docker + Minikube
- [ ] Create `Dockerfile` for React frontend (Vite build served via nginx)
- [ ] Create `Dockerfile` for Node.js backend
- [ ] Write `docker-compose.yml` (frontend + backend + postgres)
- [ ] Write Kubernetes manifests for Minikube:
  - `deployment.yaml` for frontend and backend
  - `service.yaml` to expose both
  - `configmap.yaml` for environment variables
  - `persistentvolumeclaim.yaml` for PostgreSQL data

### Other improvements
- [ ] Confirm dialog before marking order as Done (frontend)
- [ ] Edit and delete orders
- [ ] Invoicing & revenue section
- [ ] Mechanic assignment panel
- [ ] Search and filter customers
- [ ] Password hashing (bcrypt) before moving to production

---

## Mechanics available (seeded in DB)
- Carlos
- Miguel
- Luis

## Demo users (seeded in DB)
- admin@carservice.com / admin123 (admin)
- carlos@carservice.com / carlos123 (mechanic)
- luis@carservice.com / luis123 (mechanic)
