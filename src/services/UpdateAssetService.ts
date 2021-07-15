import { object, string, ref, number } from 'yup';
import { getMongoRepository } from 'typeorm';

import { Company } from '../models/Company';
import { ServiceError } from '../util/ServiceError';
import { AssertUserIsOwnerOfCompany } from '../util/Asserts'
import { AssetStatus } from '../models/Asset';
import { HealthLevelAudit } from '../models/HealthLevelAudit';
import { StatusAudit } from '../models/StatusAudit';
import { File } from '../models/File';
import { ObjectId } from 'mongodb';

interface UpdateAssetServiceDTO {
  companyId: string;
  unitId: string;
  assetId: string;
  userId: string;
  fileId: string;
  name?: string;
  description?: string;
  model?: string;
  status?: AssetStatus,
  healthLevel: number;
}

export async function UpdateAssetService({
  name,
  companyId,
  userId,
  unitId,
  assetId,
  fileId,
  description,
  model,
  status,
  healthLevel
}: UpdateAssetServiceDTO): Promise<Company> {

  const companiesRepository = getMongoRepository(Company);
  const filesRepository = getMongoRepository(File);

  const company = await companiesRepository.findOne(companyId)

  if (!company) throw new ServiceError({
    message: 'Company doest exists', code: 'company.update.C400', status: 400
  });

  const file = await filesRepository.findOne(fileId)

  if (fileId && !file) throw new ServiceError({
    message: 'File doest exists', code: 'company.update.F400', status: 400
  });

  AssertUserIsOwnerOfCompany(userId, company, new ServiceError({
    message: "You not allowed to complete this action",
    code: "company.update.U403",
    status: 403
  }))

  const unit = company.units.find(u => u.id === unitId)

  if (!unit) throw new ServiceError({
    message: "Unit doest exists",
    code: "company.unit.update.U404",
    status: 400
  })

  const asset = unit.assets.find(a => a.id === assetId)


  if (!asset) throw new ServiceError({
    message: "Asset doest exists",
    code: "company.asset.update.U404",
    status: 400
  })


  const updateAssetValidationSchema = object({
    name: string().optional(),
    description: string().optional(),
    model: string().optional(),
    healthLevel: number().optional().min(0).max(100),
    status: string().optional().oneOf(["Running", "Alerting", "Stopped"]),
  })

  try {
    await updateAssetValidationSchema.validate({
      name,
      description,
      model,
      healthLevel,
      status
    });
    // #Need: improved
    asset.model = model || asset.model;
    asset.name = name || asset.name;
    asset.description = description || asset.description;
    if (healthLevel && healthLevel !== asset.healthLevel) {
      asset.healthLevelAudits = [
        ...(asset.healthLevelAudits || []),
        new HealthLevelAudit(asset.healthLevel)
      ];
    }
    asset.healthLevel = healthLevel || asset.healthLevel;

    if (status && status !== asset.status) {
      asset.statusAudits = [
        ...(asset.statusAudits || []),
        new StatusAudit(asset.status)
      ];
    }
    asset.status = status || asset.status;
    if (file && file?.id.toString() !== asset?.fileId.toString()) {
      const oldFile = await filesRepository.findOne(asset?.fileId.toString())
      if (oldFile) {
        await filesRepository.delete(oldFile);
      }
      asset.fileId = file.id;
    }
    // #Need: end of improve request
    unit.assets = [
      ...(unit.assets || []).filter(a => a.id !== assetId),
      asset
    ];
    const companyData = companiesRepository.merge(company, {
      units: [
        ...(company.units || []).filter(u => u.id !== unitId),
        unit
      ],
    })
    return companiesRepository.save(companyData)

  } catch (error) {
    throw new ServiceError({
      message: error.message || 'Validation failed with errors.',
      status: error.status || 400,
      code: 'company.asset.update.VA400',
      errors: error.errors || []
    })
  }

}
