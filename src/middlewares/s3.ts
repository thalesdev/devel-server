import multer from 'multer';
import multerS3 from 'multer-s3';
import { uuid } from 'uuidv4';

import { S3, AwsBucket } from '../configs/s3';


export const s3 = (options: any = {}) =>
  multer({
    storage: multerS3({
      s3: S3,
      bucket: AwsBucket,
      acl: 'public-read',
      key(request, file: any, cb: any) {
        cb(null, `${uuid()}-${file.originalname}`);
      },
      ...options,
    }),
    limits: {
      fileSize: 1024 * 1024 * 12, // max 12mb upload
    },
  });

