import { AuthorizationError } from '../utils/errorClasses.js';


const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AuthorizationError('Authentication required');
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new AuthorizationError(
          `Access forbidden. Required role(s): ${allowedRoles.join(', ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};


const authorizeOwner = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AuthorizationError('Authentication required');
      }

      const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];

      if (req.user._id.toString() !== resourceUserId && req.user.role !== 'admin') {
        throw new AuthorizationError('You do not have permission to access this resource');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};


const authorizeOwnerOrRole = (resourceUserIdField = 'userId', ...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AuthorizationError('Authentication required');
      }

      if (allowedRoles.includes(req.user.role)) {
        return next();
      }

      const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
      
      if (req.user._id.toString() !== resourceUserId) {
        throw new AuthorizationError('You do not have permission to access this resource');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export {
  authorize,
  authorizeOwner,
  authorizeOwnerOrRole,
};
