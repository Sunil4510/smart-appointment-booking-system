import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied', 
      message: 'No token provided' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        provider: {
          select: { id: true, businessName: true, isVerified: true }
        }
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'User not found or inactive' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'Invalid token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'Token expired' 
      });
    }
    return res.status(500).json({ 
      error: 'Server error', 
      message: 'Token verification failed' 
    });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'Authentication required' 
      });
    }

    const userRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!userRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied', 
        message: 'Insufficient permissions' 
      });
    }

    next();
  };
};

const requireProvider = async (req, res, next) => {
  if (!req.user || req.user.role !== 'PROVIDER') {
    return res.status(403).json({ 
      error: 'Access denied', 
      message: 'Provider access required' 
    });
  }

  if (!req.user.provider || !req.user.provider.isVerified) {
    return res.status(403).json({ 
      error: 'Access denied', 
      message: 'Provider verification required' 
    });
  }

  req.providerId = req.user.provider.id;
  next();
};

export {
  authenticateToken,
  authenticateToken as auth, // Alias for cleaner imports
  requireRole,
  requireProvider
};