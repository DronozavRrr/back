const roleMiddleware = (requiredRole) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: 'Неавторизованный пользователь' });
      }
  
      if (req.user.role !== requiredRole) {
        return res.status(403).json({ message: 'Доступ запрещен для вашей роли' });
      }
  
      next();
    };
  };
  
  module.exports = roleMiddleware;
  