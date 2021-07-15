import { Router } from 'express';

import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { CreateCompanyService } from '../services/CreateCompanyService';
import { FetchUserCompaniesService } from '../services/FetchUserCompaniesService';
import { DeleteCompanyService } from '../services/DeleteCompanyService';
import { UpdateCompanyService } from '../services/UpdateCompanyService'
import { CreateUnitService } from '../services/CreateUnitService';
import { UpdateUnitService } from '../services/UpdateUnitService';
import { DeleteUnitService } from '../services/DeleteUnitService';
import { CreateAssetService } from '../services/CreateAssetService';
import { UpdateAssetService } from '../services/UpdateAssetService';
import { DeleteAssetService } from '../services/DeleteAssetService';
import { FetchCompanyService } from '../services/FetchCompanyService';

const router = Router();



router.get('/:companyId', ensureAuthenticated, async (req, res) => {
  const { user: { id: userId } } = req.token
  const { companyId } = req.params
  try {
    const company = await FetchCompanyService({ userId, companyId })
    return res.status(200).json({
      ...company
    })
  } catch (err) {
    return res.status(err.status).json({
      code: err.code,
      message: err.message,
      errors: err.errors
    })
  }
})

router.get('/', ensureAuthenticated, async (req, res) => {
  const { user: { id: userId } } = req.token
  try {
    const companies = await FetchUserCompaniesService({ userId })
    return res.status(200).json({
      companies
    })
  } catch (err) {
    return res.status(err.status).json({
      code: err.code,
      message: err.message,
      errors: err.errors
    })
  }
})

router.post('/', ensureAuthenticated, async (req, res) => {
  const { user: { id: userId } } = req.token
  const { name, cnpj } = req.body;
  try {
    const company = await CreateCompanyService({
      userId,
      name,
      cnpj
    });
    return res.status(201).json({
      ...company
    })
  } catch (err) {
    return res.status(err.status).json({
      code: err.code,
      message: err.message,
      errors: err.errors
    })
  }
})


//#need: update company

router.delete('/:companyId', ensureAuthenticated, async (req, res) => {
  const { user: { id: userId } } = req.token
  const { companyId } = req.params
  try {
    await DeleteCompanyService({ companyId, userId })
    return res.status(200).json({
      ok: true
    })
  } catch (err) {
    return res.status(err.status).json({
      code: err.code,
      message: err.message,
      errors: err.errors
    })
  }
})

router.put('/:companyId', ensureAuthenticated, async (req, res) => {
  const { user: { id: userId } } = req.token
  const { companyId } = req.params
  const { name } = req.body
  try {
    const company = await UpdateCompanyService({ companyId, userId, name })
    return res.status(200).json({
      ...company
    })
  } catch (err) {
    return res.status(err.status).json({
      code: err.code,
      message: err.message,
      errors: err.errors
    })
  }
})

router.post('/:companyId/units', ensureAuthenticated, async (req, res) => {
  const { companyId } = req.params
  const { user: { id: userId } } = req.token
  const { name } = req.body;
  try {
    const companyWithUnits = await CreateUnitService({
      name,
      companyId,
      userId
    });
    return res.status(201).json({
      ...companyWithUnits
    })
  } catch (err) {
    return res.status(err.status).json({
      code: err.code,
      message: err.message,
      errors: err.errors
    })
  }
})

router.delete('/:companyId/units/:unitId', ensureAuthenticated, async (req, res) => {
  const { companyId, unitId } = req.params
  const { user: { id: userId } } = req.token

  try {
    await DeleteUnitService({
      companyId,
      unitId,
      userId
    });
    return res.status(200).json({
      ok: true
    })
  } catch (err) {
    return res.status(err.status).json({
      code: err.code,
      message: err.message,
      errors: err.errors
    })
  }
})

router.put('/:companyId/units/:unitId', ensureAuthenticated, async (req, res) => {
  const { companyId, unitId } = req.params
  const { user: { id: userId } } = req.token
  const { name } = req.body

  try {
    const companyWithUnits = await UpdateUnitService({
      companyId,
      unitId,
      userId,
      name,
    });
    return res.status(200).json({
      ...companyWithUnits
    })
  } catch (err) {
    return res.status(err.status).json({
      code: err.code,
      message: err.message,
      errors: err.errors
    })
  }
})

// shallow?
router.post('/:companyId/units/:unitId/assets', ensureAuthenticated, async (req, res) => {
  const { companyId, unitId } = req.params
  const { user: { id: userId } } = req.token
  const {
    name,
    description,
    model,
    status,
    healthLevel,
    fileId,
  } = req.body;


  try {
    const companyWithUnitsAndAssets = await CreateAssetService({
      companyId,
      // userId,
      unitId,
      name,
      description,
      model,
      status,
      healthLevel,
      fileId
    });
    return res.status(201).json({
      ...companyWithUnitsAndAssets
    })
  } catch (err) {
    return res.status(err.status).json({
      code: err.code,
      message: err.message,
      errors: err.errors
    })
  }
})

router.put('/:companyId/units/:unitId/assets/:assetId', ensureAuthenticated, async (req, res) => {
  const { companyId, unitId, assetId } = req.params
  const { user: { id: userId } } = req.token
  const {
    name,
    description,
    model,
    status,
    healthLevel,
    fileId,
  } = req.body;
  try {
    const companyWithUnitsAndAssets = await UpdateAssetService({
      companyId,
      userId,
      unitId,
      assetId,
      name,
      description,
      model,
      status,
      healthLevel,
      fileId
    });
    return res.status(201).json({
      ...companyWithUnitsAndAssets
    })
  } catch (err) {
    return res.status(err.status).json({
      code: err.code,
      message: err.message,
      errors: err.errors
    })
  }
})

router.delete('/:companyId/units/:unitId/assets/:assetId', ensureAuthenticated, async (req, res) => {
  const { companyId, unitId, assetId } = req.params
  const { user: { id: userId } } = req.token

  try {
    const asset = await DeleteAssetService({
      companyId,
      userId,
      unitId,
      assetId,
    });
    return res.status(201).json({
      ...asset
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
