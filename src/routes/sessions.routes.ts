import { Router } from 'express';
import { SignInService } from '../services/SignInService';
import { RefreshSignInService } from '../services/RefreshSignInService';


const router = Router();



router.post('/', async (req, res) => {
  const { email, password, device } = req.body;
  try {
    const { payload, refreshToken, token } = await SignInService({
      email,
      password,
      device
    });
    return res.status(200).json({
      token,
      refreshToken: refreshToken,
      ...payload
    })
  } catch (err) {
    return res.status(err.status).json({
      code: err.code,
      message: err.message,
      errors: err.errors
    })
  }
})

router.post('/refresh', async (req, res) => {
  const { token: tokenProvided, device } = req.body;
  try {
    const { payload, refreshToken, token } = await RefreshSignInService({
      tokenProvided,
      device
    });
    return res.status(200).json({
      token,
      refreshToken: refreshToken,
      ...payload
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
