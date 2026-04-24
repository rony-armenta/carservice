import jwt from 'jsonwebtoken'

// Verify JWT token on every protected route
export function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided. Please log in.' })
  }

  const token = header.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // { id, name, email, role }
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token. Please log in again.' })
  }
}

// Only allow admins
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' })
  }
  next()
}
