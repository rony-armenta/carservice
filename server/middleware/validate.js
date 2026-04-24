import { validationResult } from 'express-validator'

// Run validation rules and return 400 if any fail
export function validate(rules) {
  return async (req, res, next) => {
    for (const rule of rules) await rule.run(req)
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg })
    }
    next()
  }
}
