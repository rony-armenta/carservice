const BASE = 'http://localhost:3001/api'

let authToken = null
export function setToken(token)  { authToken = token }
export function clearToken()     { authToken = null  }

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`

  const opts = { method, headers }
  if (body) opts.body = JSON.stringify(body)

  const res  = await fetch(`${BASE}${path}`, opts)
  const data = await res.json()

  if (res.status === 401) {
    clearToken()
    window.dispatchEvent(new Event('auth:expired'))
  }

  if (!res.ok) throw new Error(data.error || 'Something went wrong')
  return data
}

export const api = {
  // Auth
  login: (email, password)            => request('POST', '/users/login', { email, password }),

  // Customers
  getCustomers: ()                    => request('GET',    '/customers'),
  createCustomer: (data)              => request('POST',   '/customers', data),
  updateCustomer: (id, data)          => request('PUT',    `/customers/${id}`, data),
  updateCarStatus: (id, car_status)   => request('PATCH',  `/customers/${id}/car-status`, { car_status }),
  deleteCustomer: (id)                => request('DELETE', `/customers/${id}`),

  // Orders
  getOrders: ()                       => request('GET',    '/orders'),
  createOrder: (data)                 => request('POST',   '/orders', data),
  updateOrderStatus: (id, status)     => request('PATCH',  `/orders/${id}/status`, { status }),
  deleteOrder: (id)                   => request('DELETE', `/orders/${id}`),

  // Mechanics
  getMechanics: ()                    => request('GET', '/mechanics'),

  // Users
  getUsers: ()                        => request('GET',    '/users'),
  createUser: (data)                  => request('POST',   '/users', data),
  updateUser: (id, data)              => request('PUT',    `/users/${id}`, data),
  deleteUser: (id)                    => request('DELETE', `/users/${id}`),

  // Car records
  getCarRecords: ()                   => request('GET',    '/car-records'),
  getVehicleRecords: (vehicleId)      => request('GET',    `/car-records/vehicle/${vehicleId}`),
  createCarRecord: (data)             => request('POST',   '/car-records', data),
  updateCarRecord: (id, data)         => request('PUT',    `/car-records/${id}`, data),
  deleteCarRecord: (id)               => request('DELETE', `/car-records/${id}`),
}
