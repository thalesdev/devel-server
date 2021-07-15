import { Router } from 'express';

import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { CreateUserService } from '../services/CreateUserService';
import { UpdateUserService } from '../services/UpdateUserService';
import { FetchUserService } from '../services/FetchUserService';


const router = Router();

router.get('/me', ensureAuthenticated, async (req, res) => {

  const { id: userId } = req.token.user;

  try {
    const user = await FetchUserService({ userId });
    return res.status(200).json({
      ...user,
      refreshTokens: undefined,
    })
  } catch (err) {
    return res.status(err.status).json({
      code: err.code,
      message: err.message,
      errors: err.errors
    })
  }
})

router.get('/:userId', async (req, res) => {

  const { userId } = req.params;
  try {
    const user = await FetchUserService({ userId });
    return res.status(200).json({
      ...user,
      refreshTokens: undefined,
    })
  } catch (err) {
    return res.status(err.status).json({
      code: err.code,
      message: err.message,
      errors: err.errors
    })
  }
})




router.post('/', async (req, res) => {
  const { fullname, email, password, device } = req.body;
  try {
    const newUserCredentials = await CreateUserService({ fullname, email, password, device });
    return res.status(201).json({
      ...newUserCredentials
    })
  } catch (err) {
    return res.status(err.status).json({
      code: err.code,
      message: err.message,
      errors: err.errors
    })
  }
})


router.put('/', ensureAuthenticated, async (req, res) => {
  const { fullname, password, passwordConfirmation } = req.body;
  const { user: { id: userId } } = req.token
  try {
    const user = await UpdateUserService({ fullname, passwordConfirmation, password, userId });
    return res.status(201).json({
      ...user,
      refreshTokens: undefined,
      password: undefined
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
