import jwt from 'jsonwebtoken';
import config from '../../Commons/config.js';
import AuthenticationError from '../../Commons/exceptions/AuthenticationError.js';

const tokenAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AuthenticationError('Missing authentication'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.auth.accessTokenKey);
    req.user = decoded;
    next();
  } catch {
    next(new AuthenticationError('Token tidak valid'));
  }
};

export default tokenAuthMiddleware;
