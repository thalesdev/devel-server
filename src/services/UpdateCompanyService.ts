import { object, string, ref } from 'yup';
import { getMongoRepository } from 'typeorm';

import { Company } from '../models/Company';
import { ServiceError } from '../util/ServiceError';
import { AssertUserIsOwnerOfCompany } from '../util/Asserts'

interface UpdateCompanyServiceDTO {
  name: string;
  companyId: string;
  userId: string;
}

export async function UpdateCompanyService({
  name, companyId, userId
}: UpdateCompanyServiceDTO): Promise<Company> {

  const companiesRepository = getMongoRepository(Company);

  const company = await companiesRepository.findOne(companyId)

  if (!company) throw new ServiceError({
    message: 'Company doest exists', code: 'company.update.AR400', status: 400
  });

  AssertUserIsOwnerOfCompany(userId, company, new ServiceError({
    message: "You not allowed to complete this action",
    code: "company.update.U403",
    status: 403
  }))

  const updateCompanyValidationSchema = object({
    name: string().required().max(50),
  })

  try {
    await updateCompanyValidationSchema.validate({
      name
    });
    const companyData = companiesRepository.merge(company, {
      name,
    })
    return companiesRepository.save(companyData)

  } catch (error) {
    throw new ServiceError({
      message: error.message || 'Validation failed with errors.',
      status: 400,
      code: 'company.update.VA400',
      errors: error.errors || []
    })
  }

}
