import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import authConfig from '../configs/auth';
import TokenPayloadType from '../contracts/TokenPayloadType';

export const ensureAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  let response;
  let status = 500;
  const authHeader = req.headers.authorization || '';
  const [, token] = authHeader.split(' ');

  if (!authHeader) {
    // modificar esse erro
    res.status(401).json({ message: 'Token not provided.' });
  }
  try {
    const decoded = jwt.verify(token, authConfig.secret);
    req.token = decoded as TokenPayloadType;
    return next();
  } catch (e) {
    if (e.message === "jwt expired") {

      response = { message: 'Token expired.', code: "auth.expire" };
      status = 401;
    } else {
      response = { message: 'Invalid token.' };
    }
  }
  res.status(status).json(response);
};

