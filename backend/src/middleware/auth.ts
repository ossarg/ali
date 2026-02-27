import { Request, Response, NextFunction } from 'express'

// Roles: admin > gerente > abogado
export type Role = 'admin' | 'gerente' | 'abogado'

export interface AuthUser {
  id: string
  name: string
  role: Role
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

// PoC: auth simple por header X-User-Role
// TODO: reemplazar con JWT/OAuth antes de producción
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const role = req.headers['x-user-role'] as Role
  const userId = req.headers['x-user-id'] as string

  if (!role || !['admin', 'gerente', 'abogado'].includes(role)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  req.user = { id: userId || 'unknown', name: '', role }
  next()
}

export const requireRole = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden — insufficient permissions' })
    }
    next()
  }
}

export default authMiddleware
