import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const bearerHeader = req.headers.authorization;
    console.log(bearerHeader)
    if (bearerHeader) {
      const bearerToken = bearerHeader.split(' ')[1];
      jwt.verify(bearerToken, process.env.TOKEN_SECRET || "", (err, decodedToken: any) => {
        if (err) {
          console.log(err)
          res.status(401).send('Not logged-in');
        } else {
          console.log(decodedToken);
          (req as any).userId = decodedToken.id; // Add to req object
          next();
        }
      });
    } else {
      res.status(401).send('Not logged-in');
    }
  } catch {
    res.status(500).send('Something went wrong');
  }
};

export default verifyToken;
