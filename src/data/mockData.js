// carStatus: 'active' | 'in-repair' | 'inactive'
export const customers = [
  { id: 1, initials: 'JR', name: 'José Ramírez',    car: 'Honda Civic 2019',   plate: 'SIN-001', carStatus: 'in-repair', orders: 3, color: 'blue'   },
  { id: 2, initials: 'SM', name: 'Sandra Morales',  car: 'Ford F-150 2021',    plate: 'SIN-002', carStatus: 'in-repair', orders: 1, color: 'teal'   },
  { id: 3, initials: 'AL', name: 'Andrés López',    car: 'Toyota Camry 2020',  plate: 'SIN-003', carStatus: 'active',    orders: 5, color: 'coral'  },
  { id: 4, initials: 'PG', name: 'Patricia García', car: 'Chevy Malibu 2018',  plate: 'SIN-004', carStatus: 'inactive',  orders: 2, color: 'purple' },
  { id: 5, initials: 'MT', name: 'Marco Torres',    car: 'Nissan Altima 2022', plate: 'SIN-005', carStatus: 'active',    orders: 1, color: 'amber'  },
]

// parentId: null = main order, string = sub-order of that id
export const orders = [
  { id: '#041', parentId: null, customerId: 1, desc: 'Oil change & filter',     car: 'Honda Civic 2019',   status: 'done',     mech: 'Carlos' },
  { id: '#042', parentId: null, customerId: 2, desc: 'Brake pad replacement',   car: 'Ford F-150 2021',    status: 'progress', mech: 'Miguel' },
  { id: '#042a',parentId: '#042',customerId: 2,desc: 'Rotor resurfacing',       car: 'Ford F-150 2021',    status: 'pending',  mech: null     },
  { id: '#043', parentId: null, customerId: 3, desc: 'AC diagnostics',          car: 'Toyota Camry 2020',  status: 'pending',  mech: null     },
  { id: '#044', parentId: null, customerId: 4, desc: 'Transmission service',    car: 'Chevy Malibu 2018',  status: 'progress', mech: 'Carlos' },
  { id: '#045', parentId: null, customerId: 5, desc: 'Tire rotation & balance', car: 'Nissan Altima 2022', status: 'pending',  mech: null     },
  { id: '#046', parentId: null, customerId: 1, desc: 'Engine tune-up',          car: 'Honda Civic 2019',   status: 'done',     mech: 'Luis'   },
  { id: '#047', parentId: null, customerId: 3, desc: 'Coolant flush',           car: 'Toyota Camry 2020',  status: 'pending',  mech: null     },
]
