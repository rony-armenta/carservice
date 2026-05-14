# Car Service Dashboard — Full Project Context

> **For AI assistants:** This README is the single source of truth for this project.
> Read it completely before touching any file. Never guess — if something is unclear, ask.
> Always apply changes surgically to the specific file mentioned. Never rewrite files that were not asked to change.

---

## Project identity

| Field | Value |
|-------|-------|
| Project name | Car Service Dashboard |
| Root folder | `carservice/` |
| Frontend | React 18 + Vite 5 |
| Backend | Node.js + Express (ESM modules) |
| Database | PostgreSQL (Fedora Linux) |
| Styling | Plain CSS-in-JS (inline styles only, no Tailwind, no CSS files, no external UI lib) |
| Auth | JWT (stored in memory, never localStorage) |
| Port — frontend | 5173 |
| Port — backend | 3001 |

---

## How to run

```bash
# Terminal 1 — backend
cd carservice/server
npm install
npm run dev

# Terminal 2 — frontend
cd carservice
npm install
npm run dev
```

Open `http://localhost:5173`. Login with `admin@carservice.com` / `admin123`.

Health check: `curl http://localhost:3001/api/health`

---

## Complete folder structure

Every file in the project is listed here. Do not create files outside this structure without being asked.

```
carservice/
├── .gitignore                             # Excludes .env, node_modules, dist
├── index.html                             # Vite entry HTML
├── package.json                           # Frontend deps: react, react-dom, vite
├── vite.config.js                         # Vite config with react plugin
│
├── server/                                # Node.js + Express backend (ESM)
│   ├── .env                               # Never commit. Contains DB creds + JWT secret
│   ├── package.json                       # Backend deps (see dependencies section)
│   ├── db.js                              # pg Pool — reads from .env
│   ├── index.js                           # Express app entry — CORS, rate limit, routes
│   ├── middleware/
│   │   ├── auth.js                        # requireAuth (JWT verify) + requireAdmin (role check)
│   │   └── validate.js                    # express-validator runner — returns first error as 400
│   ├── routes/
│   │   ├── customers.js                   # GET/POST/PUT/PATCH(car-status)/DELETE — input validated
│   │   ├── vehicles.js                    # GET / PATCH :id/status
│   │   ├── orders.js                      # GET/POST/PATCH(status)/DELETE — all business rules here
│   │   ├── mechanics.js                   # GET active mechanics only
│   │   ├── users.js                       # GET/POST/PUT/DELETE + POST /login — bcrypt + JWT
│   │   └── carRecords.js                  # GET(all)/GET(vehicle/:id)/GET(:id)/POST/PUT/DELETE
│   └── scripts/
│       └── hashPasswords.js               # One-time migration: hashes plain text passwords in DB
│
└── src/
    ├── main.jsx                           # ReactDOM.createRoot — renders <App />
    ├── App.jsx                            # AuthProvider wraps AppContent; login guard; page router
    ├── index.css                          # Global reset + CSS vars (--bg, --surface, --text, etc)
    │
    ├── services/
    │   └── api.js                         # Central fetch wrapper. Attaches JWT. Fires auth:expired event on 401.
    │
    ├── context/
    │   └── AuthContext.jsx                # login() calls api.login(), stores JWT via setToken(). logout() calls clearToken().
    │
    ├── data/
    │   └── mockData.js                    # Legacy — no longer used. Do not import from here.
    │
    ├── utils/
    │   └── formatters.js                  # STATUS_LABEL, STATUS_CLASS, CAR_STATUS_LABEL, CAR_STATUS_STYLE, AVATAR_COLOR, formatDate
    │
    ├── hooks/
    │   ├── useOrders.js                   # Fetches /api/orders. Exposes: orders(filtered), filter, setFilter, addOrder, addSubOrder, updateStatus, subOrdersOf, stats, loading, error
    │   └── useCustomers.js                # Fetches /api/customers. Exposes: customers, addCustomer, editCustomer, deleteCustomer, updateCarStatus, total, loading, error
    │
    ├── components/
    │   ├── StatCard.jsx                   # Props: label, value, sub. Simple metric card.
    │   │
    │   ├── Layout/
    │   │   ├── Sidebar.jsx                # Props: page, setPage, expanded, setExpanded. Nav: dashboard, customers, records, users. SVG icons. Logout button.
    │   │   ├── AppLayout.jsx              # Wraps Sidebar + <main>. Owns expanded state.
    │   │   └── Topbar.jsx                 # Shows current date using formatDate()
    │   │
    │   ├── WorkOrders/
    │   │   ├── WorkOrders.jsx             # Props: orders, filter, setFilter, onAdd, onStatusChange, onAddSubOrder, subOrdersOf
    │   │   ├── WorkOrderRow.jsx           # Props: order, subOrders, onStatusChange, onAddSubOrder. Inline status dropdown. Expand/collapse sub-orders. "+ sub" button (disabled if order is done).
    │   │   └── WorkOrderForm.jsx          # Props: customers, onClose, onSave, parentId. Has ServiceTypeField (imported from CarRecordsPage). Fields: customer (picklist), serviceType, description, mechanic.
    │   │
    │   └── Customers/
    │       ├── Customers.jsx              # Props: customers, onAdd, onCarStatusChange. Simple panel used on Dashboard.
    │       ├── CustomerRow.jsx            # Props: customer, onCarStatusChange. Shows avatar, name, car, car status dropdown.
    │       └── CustomerForm.jsx           # Props: initial (for edit), onClose, onSave. Fields: name, phone, car, plate.
    │
    └── pages/
        ├── Dashboard.jsx                  # Uses useOrders + useCustomers. Shows StatCards, WorkOrders panel, Customers panel. Owns modal open/close state for WorkOrderForm, CustomerForm, sub-order form.
        ├── LoginPage.jsx                  # Email + password form. Calls useAuth().login(). Shows "Powered by: Claid 🔧" at bottom.
        ├── CustomersPage.jsx              # Full CRUD table. Uses useCustomers hook. Edit/delete with confirm dialog.
        ├── CarRecordsPage.jsx             # Vehicle service history. Exports ServiceTypeField (reused in WorkOrderForm). Timeline cards (expand/collapse). Search + vehicle filter. Full CRUD modal.
        └── UsersPage.jsx                  # Admin-only CRUD. Fetches /api/users directly. Cannot delete yourself.
```

---

## PostgreSQL schema — all tables

### Table: `customers`
```sql
id         SERIAL PRIMARY KEY
name       VARCHAR(100) NOT NULL
phone      VARCHAR(30)
initials   VARCHAR(3)
color      VARCHAR(20) DEFAULT 'blue'   -- one of: blue teal coral purple amber
created_at TIMESTAMPTZ DEFAULT NOW()
```

### Table: `vehicles`
```sql
id          SERIAL PRIMARY KEY
customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE
make_model  VARCHAR(100) NOT NULL
plate       VARCHAR(20)
car_status  VARCHAR(20) DEFAULT 'active'  -- one of: active in-repair inactive
created_at  TIMESTAMPTZ DEFAULT NOW()
```

### Table: `orders`
```sql
id          SERIAL PRIMARY KEY
parent_id   INTEGER REFERENCES orders(id) ON DELETE CASCADE   -- null = main order
vehicle_id  INTEGER NOT NULL REFERENCES vehicles(id)
customer_id INTEGER NOT NULL REFERENCES customers(id)
mechanic_id INTEGER REFERENCES mechanics(id)
description TEXT NOT NULL
status      VARCHAR(20) DEFAULT 'pending'  -- one of: pending progress done
record_id   INTEGER REFERENCES car_records(id) ON DELETE SET NULL
created_at  TIMESTAMPTZ DEFAULT NOW()
updated_at  TIMESTAMPTZ DEFAULT NOW()
```

### Table: `mechanics`
```sql
id         SERIAL PRIMARY KEY
name       VARCHAR(100) NOT NULL
active     BOOLEAN DEFAULT true
created_at TIMESTAMPTZ DEFAULT NOW()
```

### Table: `users`
```sql
id         SERIAL PRIMARY KEY
name       VARCHAR(100) NOT NULL
email      VARCHAR(150) NOT NULL UNIQUE
password   VARCHAR(255) NOT NULL   -- bcrypt hash, 12 rounds
role       VARCHAR(20) NOT NULL    -- one of: admin mechanic
active     BOOLEAN DEFAULT true
created_at TIMESTAMPTZ DEFAULT NOW()
```

### Table: `car_records`
```sql
id           SERIAL PRIMARY KEY
vehicle_id   INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE
order_id     INTEGER REFERENCES orders(id) ON DELETE SET NULL
service_type VARCHAR(100)
diagnostics  TEXT
error_codes  VARCHAR(255)
notes        TEXT
mileage      INTEGER
created_at   TIMESTAMPTZ DEFAULT NOW()
updated_at   TIMESTAMPTZ DEFAULT NOW()
```

Indexes:
```sql
CREATE INDEX idx_car_records_vehicle ON car_records(vehicle_id);
CREATE INDEX idx_car_records_order   ON car_records(order_id);
```

---

## Backend dependencies (`server/package.json`)

```json
{
  "type": "module",
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.18.2",
    "express-rate-limit": "^7.3.1",
    "express-validator": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.11.3"
  }
}
```

All files use `import/export` (ESM). Never use `require()`.

---

## server/.env structure

```
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=carservice
DB_USER=carservice
DB_PASSWORD=carservice123
JWT_SECRET=<64-byte hex string — generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_EXPIRES_IN=8h
ALLOWED_ORIGINS=http://localhost:5173
```

---

## API — complete endpoint reference

All routes except `/api/health` and `POST /api/users/login` require:
`Authorization: Bearer <token>` header.

Admin-only routes additionally require `role === 'admin'` in the JWT payload.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/health | public | Returns `{ status: 'ok' }` |
| POST | /api/users/login | public | Body: `{ email, password }` → Returns `{ token, user }` |
| GET | /api/users | admin | List all users (no passwords) |
| POST | /api/users | admin | Create user — body: `{ name, email, password, role }` |
| PUT | /api/users/:id | admin | Update user — same body (password optional on edit) |
| DELETE | /api/users/:id | admin | Delete user (cannot delete self) |
| GET | /api/customers | any | List customers joined with vehicle data |
| POST | /api/customers | any | Create customer + vehicle in transaction — body: `{ name, phone, car, plate }` |
| PUT | /api/customers/:id | any | Update customer + vehicle |
| PATCH | /api/customers/:id/car-status | any | Body: `{ car_status }` — one of: active, in-repair, inactive |
| DELETE | /api/customers/:id | admin | Cascade deletes vehicles + orders |
| GET | /api/vehicles | any | All vehicles joined with customer name |
| PATCH | /api/vehicles/:id/status | any | Body: `{ car_status }` |
| GET | /api/orders | any | All orders joined: customer, vehicle, mechanic |
| POST | /api/orders | any | Body: `{ vehicle_id, customer_id, description, mechanic_id?, parent_id? }` |
| PATCH | /api/orders/:id/status | any | Body: `{ status }` — enforces business rules |
| DELETE | /api/orders/:id | any | Cascade deletes sub-orders |
| GET | /api/mechanics | any | Active mechanics only |
| GET | /api/car-records | any | All records joined: vehicle, customer, order |
| GET | /api/car-records/vehicle/:vehicleId | any | Timeline for one vehicle, DESC by date |
| GET | /api/car-records/:id | any | Single record |
| POST | /api/car-records | any | Body: `{ vehicle_id, order_id?, service_type, diagnostics?, error_codes?, notes?, mileage? }` |
| PUT | /api/car-records/:id | any | Same body as POST |
| DELETE | /api/car-records/:id | any | Hard delete |

---

## Business rules enforced in the backend (orders.js)

These are validated server-side — never skip them on the frontend:

1. **Cannot create order for inactive vehicle** → 400
2. **Cannot create a second active main order for the same vehicle** (a vehicle can only have one pending/in-progress main order at a time) → 400
3. **Cannot add sub-order to a completed parent order** → 400
4. **Cannot create duplicate sub-order description under the same parent** (case-insensitive) → 400
5. **Cannot mark a main order as done if it has pending or in-progress sub-orders** → 400
6. **Auto side effects on order create:** vehicle `car_status` → `in-repair` (main orders only)
7. **Auto side effects on order done:** vehicle `car_status` → `active` (main orders only)

---

## Authentication flow (frontend)

```
User submits login form
  → LoginPage calls useAuth().login(email, password)
  → AuthContext calls api.login(email, password)
  → api.js POSTs to /api/users/login
  → Server validates credentials with bcrypt, returns { token, user }
  → AuthContext calls setToken(token) — stored in module-level variable in api.js
  → AuthContext sets user state → App re-renders → Dashboard shown

Every subsequent API call:
  → api.js reads authToken module variable
  → Adds Authorization: Bearer <token> header automatically

Token expiry (401 response):
  → api.js fires window.dispatchEvent(new Event('auth:expired'))
  → AuthContext listener calls clearToken() + setUser(null)
  → App re-renders → Login screen shown
```

---

## Frontend data flow

```
Dashboard
  ├── useOrders() ──────── GET /api/orders → normalizes snake_case to camelCase
  │     normalize(): parent_id→parentId, customer_id→customerId, vehicle_id→vehicleId, description→desc
  └── useCustomers() ───── GET /api/customers → normalizes car_status→carStatus

WorkOrderForm
  ├── Receives: customers[] from Dashboard (already normalized)
  ├── Fetches mechanics on mount: GET /api/mechanics
  ├── Imports ServiceTypeField from CarRecordsPage.jsx
  └── onSave calls: addOrder({ desc, serviceType, car, customerId, vehicleId, mechId, parentId })

CarRecordsPage
  ├── Fetches: GET /api/car-records + GET /api/customers (for vehicle picklist)
  ├── Exports ServiceTypeField component (used by WorkOrderForm)
  └── RecordForm fetches orders on vehicle select: GET /api/orders (filtered client-side by vehicle_id)
```

---

## Key component contracts (props)

### `WorkOrderForm`
```js
props: {
  customers: Customer[],   // normalized, includes vehicle_id, car, plate, carStatus
  onClose: () => void,
  onSave: (data) => Promise<void>,  // throws on API error — form catches and displays
  parentId: string | null           // null = main order, id = sub-order
}
```

### `ServiceTypeField` (exported from CarRecordsPage.jsx)
```js
props: {
  value: string,
  onChange: (value: string) => void,
  serviceTypes: string[],
  onAddType: (newType: string) => void,   // adds to parent's list
  style?: object
}
// Shows dropdown + "＋ Add custom type…" option
// When custom chosen: shows inline text input, Enter/Add confirms, Escape cancels
```

### `WorkOrderRow`
```js
props: {
  order: Order,
  subOrders: Order[],
  onStatusChange: (id, status) => void,
  onAddSubOrder: (parentId) => void
}
// "+ sub" button disabled when order.status === 'done'
// Expand arrow only shown when subOrders.length > 0
```

### `CustomerRow`
```js
props: {
  customer: Customer,
  onCarStatusChange: (id, car_status) => void
}
```

---

## Styling conventions

- **No external CSS libraries.** All styling is inline JS objects.
- **Color palette:**
  - Primary blue: `#185FA5`
  - Background: `#f5f5f4`
  - Surface (cards): `#ffffff`
  - Secondary background: `#f0efea`
  - Text primary: `#1c1c1a`
  - Text secondary: `#6b6b68`
  - Text hint: `#9b9b97`
  - Border: `rgba(0,0,0,0.1)`
  - Error red: `#A32D2D` / `#FCEBEB`
  - Success green: `#3B6D11` / `#EAF3DE`
  - Warning amber: `#854F0B` / `#FAEEDA`
  - Info blue: `#185FA5` / `#E6F1FB`
- **Border radius:** `8px` (inputs/buttons), `12px` (panels/modals), `20px` (badges)
- **Font size:** `11px` (hints/badges), `12px` (labels), `13px` (body), `14px` (panel titles), `18px` (page titles)
- **Borders:** `0.5px solid` everywhere (not `1px`)

---

## Sidebar navigation

4 items in order:
1. `dashboard` — grid icon — "Dashboard"
2. `customers` — person icon — "Customers & Vehicles"
3. `records` — document icon — "Service Records"
4. `users` — people icon — "Users & Roles"

Plus: Home button (top), collapse/expand toggle (top right), Logout button (bottom).
Collapsed width: `56px` (icons only). Expanded width: `220px`.

---

## Service types list (default — user can add custom ones at runtime)

```
Oil Change, Brake Service, Tire Rotation, Engine Diagnostics,
Transmission Service, AC Service, Electrical Repair, Suspension,
Coolant Flush, Tune-up, Battery Replacement, Other
```
Custom types added via `ServiceTypeField` persist only for the current session (in-memory state). They are NOT persisted to the DB yet.

---

## Security measures in place

| Measure | Where |
|---------|-------|
| bcrypt password hashing (12 rounds) | server/routes/users.js |
| JWT issued on login, verified on every protected request | server/middleware/auth.js |
| JWT stored in JS module variable (NOT localStorage) | src/services/api.js |
| Auto logout on 401 via custom browser event | src/services/api.js + AuthContext |
| Admin role guard | server/middleware/auth.js `requireAdmin` |
| Login rate limit: 10 req / 15 min / IP | server/routes/users.js |
| Global rate limit: 200 req / 15 min | server/index.js |
| Input validation + sanitization | server/middleware/validate.js + express-validator |
| Parameterized SQL queries everywhere | All route files |
| Security headers (nosniff, X-Frame, XSS) | server/index.js |
| Body size capped at 10kb | server/index.js |
| Generic error messages (no internals leaked) | All route files |
| User enumeration prevention (same error for wrong email/password) | server/routes/users.js |
| Self-delete prevention | server/routes/users.js |
| .env excluded from git | .gitignore |

---

## Demo credentials (seeded in DB)

| Email | Password | Role |
|-------|----------|------|
| admin@carservice.com | admin123 | admin |
| carlos@carservice.com | carlos123 | mechanic |
| luis@carservice.com | luis123 | mechanic |

> Passwords are bcrypt-hashed in the DB after running `node scripts/hashPasswords.js`

---

## Seeded mechanics

- Carlos (id: 1)
- Miguel (id: 2)
- Luis (id: 3)

---

## Features completed

### Frontend
- [x] Login screen with JWT auth — "Powered by: Claid 🔧"
- [x] JWT in memory, auto-logout on expiry
- [x] Sidebar: 4 nav items, SVG icons, collapse/expand, logout
- [x] Dashboard: stat cards (open, in-progress, done, total customers), loading state
- [x] Work orders panel: filter bar (All/Pending/In progress/Done), inline status dropdown
- [x] Work order form: customer/vehicle picklist, service type with custom option, description, mechanic dropdown
- [x] Sub-orders: create under pending/in-progress parents, expand/collapse rows
- [x] Customers panel on Dashboard: car status dropdown per row
- [x] Customers & Vehicles page: full CRUD table with edit/delete confirm
- [x] Service Records page: timeline cards (expand for details), search, vehicle filter, full CRUD modal
- [x] Service type field: shared component, dropdown + custom type input
- [x] Vehicle shown on each service record card (car + plate pill)
- [x] Users & Roles page: admin-only CRUD, role badges, cannot delete self
- [x] API errors displayed inline in all forms

### Backend
- [x] Express + PostgreSQL, ESM modules
- [x] JWT auth middleware on all protected routes
- [x] bcrypt on all passwords + one-time migration script
- [x] Input validation on all POST/PUT routes
- [x] All 5 order business rules enforced
- [x] Auto car status: in-repair on order create, active on order complete
- [x] Full CRUD: customers, vehicles, orders, mechanics, users, car_records
- [x] car_records linked to both vehicle and order (bidirectional)
- [x] Rate limiting: login + global

---

## Pending / next steps

### Docker + Minikube
- [ ] `Dockerfile` — React frontend (Vite build → nginx)
- [ ] `Dockerfile` — Node.js backend
- [ ] `docker-compose.yml` — frontend + backend + postgres
- [ ] Kubernetes manifests: `deployment.yaml`, `service.yaml`, `configmap.yaml`, `persistentvolumeclaim.yaml`

### Frontend improvements
- [ ] Confirm dialog before marking order as Done
- [ ] Edit and delete orders from the UI
- [ ] Persist custom service types to DB (new `service_types` table)
- [ ] Auto-create car record stub when work order is completed
- [ ] Invoicing & revenue section
- [ ] Mechanic assignment panel
- [ ] Search and filter on Dashboard
- [ ] Refresh token flow (currently hard-expires after 8h)

### Backend improvements
- [ ] Password hashing already done — add token refresh endpoint
- [ ] `service_types` table for persisting custom types per shop

---

## Important rules for AI assistants working on this project

1. **Read this README fully before making any change.**
2. **Only modify files explicitly mentioned in the request.** Do not touch other files.
3. **Never rewrite a whole file to make a small change** — use surgical edits (str_replace or targeted section rewrites).
4. **Always use ESM syntax** (`import`/`export`). Never use `require()`.
5. **Never use localStorage or sessionStorage** — JWT lives in a module-level variable in `api.js`.
6. **All styling is inline JS objects.** Never add CSS classes, Tailwind, or external stylesheets.
7. **Borders are `0.5px`**, not `1px`.
8. **All API calls go through `src/services/api.js`** — never call `fetch()` directly in components.
9. **SQL queries must always use parameterized `$1, $2...` placeholders** — never string interpolation.
10. **When adding a new page:** add it to `App.jsx` switch + `Sidebar.jsx` NAV array.
11. **When adding a new API route:** register it in `server/index.js` with `requireAuth`.
12. **ServiceTypeField is exported from `CarRecordsPage.jsx`** — import it from there, do not duplicate it.
13. **`mockData.js` is legacy** — never import from it.
14. **The `carservice` PostgreSQL user has least-privilege** — SELECT, INSERT, UPDATE, DELETE only. Never ALTER or DROP.
