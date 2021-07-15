import { getMongoRepository } from 'typeorm';

import { Company } from '../models/Company';
import { ServiceError } from '../util/ServiceError';
import { AssertUserIsOwnerOfCompany } from '../util/Asserts'
import { Asset } from '../models/Asset';
// import { File } from '../models/File';

interface DeleteAssetServiceDTO {
  companyId: string;
  unitId: string;
  assetId: string;
  userId: string;
}

export async function DeleteAssetService({
  companyId,
  userId,
  unitId,
  assetId,
}: DeleteAssetServiceDTO): Promise<Asset> {

  const companiesRepository = getMongoRepository(Company);
  // const filesRepository = getMongoRepository(File);

  const company = await companiesRepository.findOne(companyId)

  if (!company) throw new ServiceError({
    message: 'Company doest exists', code: 'company.update.C400', status: 400
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



  try {
    // need delete asset file
    unit.assets = [
      ...(unit.assets || []).filter(a => a.id !== assetId)
    ];
    const companyData = companiesRepository.merge(company, {
      units: [
        ...(company.units || []).filter(u => u.id !== unitId),
        unit
      ],
    })
    await companiesRepository.save(companyData)

    return asset;

  } catch (error) {
    throw new ServiceError({
      message: error.message || 'Validation failed with errors.',
      status: error.status || 400,
      code: 'company.asset.update.VA400',
      errors: error.errors || []
    })
  }

}
