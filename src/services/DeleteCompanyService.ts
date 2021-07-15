import { getMongoRepository } from "typeorm";

import { ServiceError } from '../util/ServiceError'
import { Company } from '../models/Company'
import { ObjectId } from "mongodb";

interface DeleteCompanyServiceDTO {
  userId: string;
  companyId: string;
}

export async function DeleteCompanyService({
  userId, companyId
}: DeleteCompanyServiceDTO) {
  const companyRepository = getMongoRepository(Company);

  const company = await companyRepository.findOne(companyId);

  if (!company) throw new ServiceError({
    message: 'Company does not found',
    code: 'company.delete.C404',
    status: 400
  })

  if (company.ownerId.toString() !== userId) throw new ServiceError({
    message: "you are not allowed to complete this action",
    code: 'company.delete.U403',
    status: 403
  })

  return await companyRepository.delete(company);
}
