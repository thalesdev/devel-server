import { Router } from 'express';

import { s3 } from '../middlewares/s3';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { CreateFileService, FileProps } from '../services/CreateFileService'
import { FetchFileService } from '../services/FetchFileService'


const router = Router();


router.post('/', ensureAuthenticated, s3().single('file'), async (req, res) => {
  const { user: { id: userId } } = req.token
  try {
    const file = await CreateFileService({
      userId,
      file: (req.file as unknown) as FileProps,
    });
    return res.status(201).json({
      location: file.location,
      id: file.id,
      name: file.originalname,
    })
  } catch (err) {
    return res.status(err.status).json({
      code: err.code,
      message: err.message,
      errors: err.errors
    })
  }
})


router.get('/:fileId', async (req, res) => {
  const { fileId } = req.params
  try {
    const file = await FetchFileService({
      fileId
    });
    return res.status(201).json({
      location: file.location,
      id: file.id,
      name: file.originalname,
    })
  } catch (err) {
    return res.status(err.status).json({
      code: err.code,
      message: err.message,
      errors: err.errors
    })
  }
})





export default router;


