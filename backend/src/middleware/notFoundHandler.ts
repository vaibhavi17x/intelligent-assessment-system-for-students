import { Request, Response } from 'express';
import { AppError, ErrorType } from './errorHandler';

export const notFoundHandler = (req: Request, _res: Response) => {
  throw new AppError(
    ErrorType.NOT_FOUND_ERROR,
    `Route ${req.method} ${req.path} not found`,
    404
  );
};
