# Mechanic Shop Dashboard

A shop management web app built with React + Vite.

---

## Tech stack

- React 18
- Vite 5
- Plain CSS-in-JS (inline styles, no external UI library)

## Running the project

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`.

---

## Folder structure

```
mechanic-shop/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx               # App entry point
    ├── App.jsx                # Root component
    ├── index.css              # Global reset + CSS variables
    ├── data/
    │   └── mockData.js        # Sample orders and customers (in-memory)
    ├── utils/
    │   └── formatters.js      # Status labels, badge styles, avatar colors, date helper
    ├── hooks/
    │   ├── useOrders.js       # Order state, filtering, addOrder, addSubOrder, updateStatus
    │   └── useCustomers.js    # Customer state, addCustomer, updateCarStatus
    ├── components/
    │   ├── StatCard.jsx       # Summary metric card
    │   ├── Layout/
    │   │   └── Topbar.jsx     # Dashboard header with date
    │   ├── WorkOrders/
    │   │   ├── WorkOrders.jsx     # Panel + filter bar
    │   │   ├── WorkOrderRow.jsx   # Single order row with sub-order expand
    │   │   └── WorkOrderForm.jsx  # Modal form for new orders and sub-orders
    │   └── Customers/
    │       ├── Customers.jsx      # Panel
    │       ├── CustomerRow.jsx    # Single customer row with car status dropdown
    │       └── CustomerForm.jsx   # Modal form for new customers
    └── pages/
        └── Dashboard.jsx      # Assembles everything, owns modal open/close state
```

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
  color: String,          // avatar color key: 'blue' | 'teal' | 'coral' | 'purple' | 'amber'
}
```

### Order
```js
{
  id: String,             // e.g. '#042'
  parentId: String|null,  // null = main order, '#042' = sub-order of #042
  customerId: Number,     // links to customer
  desc: String,           // service description
  car: String,            // copied from customer at creation time
  status: String,         // 'pending' | 'progress' | 'done'
  mech: String|null,      // assigned mechanic name or null
}
```

---

## Features built

- [x] Dashboard with summary stat cards (open, in-progress, done, total customers)
- [x] Work orders panel with filter bar (All / Pending / In progress / Done)
- [x] Inline order status change via dropdown on each row
- [x] New work order form — picks customer/car from registry
- [x] Car status validation on order form (blocked if car is inactive)
- [x] Sub-orders — create child orders under a pending or in-progress parent
- [x] Sub-order expand/collapse toggle on parent rows
- [x] Customers & vehicles panel
- [x] Car status dropdown per customer (Active / In repair / Inactive)
- [x] New customer form (name, phone, vehicle, plate)

---

## Pending / next steps

### Validations (work orders workflow)
- [ ] Validate that a customer has no other active order for the same car before creating a new one
- [ ] Validate that a sub-order description is not duplicated under the same parent
- [ ] Prevent changing a parent order to "Done" if it still has pending/in-progress sub-orders
- [ ] Auto-update car status to "in-repair" when an order is created, and back to "active" when done
- [ ] Confirm dialog before marking an order as Done (irreversible action)

### PostgreSQL database
- [ ] Design and create schema tables:
  - `customers` (id, name, phone, initials, color)
  - `vehicles` (id, customer_id, make_model, plate, car_status)
  - `orders` (id, parent_id, vehicle_id, customer_id, desc, status, mech, created_at)
  - `mechanics` (id, name)
- [ ] Replace in-memory mockData with API calls to a Node.js/Express backend
- [ ] Connect backend to PostgreSQL using `pg` or an ORM like Prisma

### Docker + Minikube
- [ ] Create a `Dockerfile` for the React frontend (Vite build served via nginx)
- [ ] Create a `Dockerfile` for the Node.js backend
- [ ] Write a `docker-compose.yml` for local development (frontend + backend + postgres)
- [ ] Write Kubernetes manifests for Minikube:
  - `deployment.yaml` for frontend and backend
  - `service.yaml` to expose both
  - `configmap.yaml` for environment variables
  - `persistentvolume.yaml` for PostgreSQL data

### Other improvements
- [ ] Edit and delete orders
- [ ] Edit and delete customers
- [ ] Invoicing & revenue section
- [ ] Mechanic assignment panel
- [ ] Search and filter customers

---

## Mechanics available (hardcoded for now)

- Carlos
- Miguel
- Luis
