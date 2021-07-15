import { Router } from 'express';

import { AddEmployeeToCompanyService } from '../services/AddEmployeeToCompanyService';
import { InviteEmployeeToCompanyService } from '../services/InviteEmployeeToCompanyService';
import { RemoveEmployeeToCompanyService } from '../services/RemoveEmployeeToCompanyService';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';


const router = Router();

router.post('/:companyId/accept', ensureAuthenticated, async (req, res) => {
  const { user: { id: userId } } = req.token
  const { companyId } = req.params;
  const { notificationId } = req.body;
  try {
    const result = await AddEmployeeToCompanyService({ companyId, userId, notificationId })
    return res.status(200).json({ ok: result })
  } catch (error) {
    return res.status(error.status).json({
      code: error.code,
      message: error.message,
      errors: error.errors
    })
  }
})

router.delete('/:companyId', ensureAuthenticated, async (req, res) => {
  const { user: { id: ownerId } } = req.token
  const { companyId } = req.params;
  const { userId } = req.body;
  try {
    const result = await RemoveEmployeeToCompanyService({ companyId, ownerId, userId })
    return res.status(200).json({ ok: result })
  } catch (error) {
    return res.status(error.status).json({
      code: error.code,
      message: error.message,
      errors: error.errors
    })
  }
})

router.post('/:companyId/invite', ensureAuthenticated, async (req, res) => {
  const { user: { id: ownerId } } = req.token
  const { companyId } = req.params;
  const { email } = req.body;
  try {
    const result = await InviteEmployeeToCompanyService({ companyId, ownerId, email })
    return res.status(200).json({ ok: result })
  } catch (error) {
    return res.status(error.status).json({
      code: error.code,
      message: error.message,
      errors: error.errors
    })
  }
})







export default router;
