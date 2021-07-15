import { object, string, ref } from 'yup';
import { getMongoRepository } from 'typeorm';

import { Company } from '../models/Company';
import { ServiceError } from '../util/ServiceError';
import { AssertUserIsOwnerOfCompany } from '../util/Asserts'

interface UpdateUnitServiceDTO {
  name: string;
  companyId: string;
  unitId: string;
  userId: string;
}

export async function UpdateUnitService({
  name, companyId, userId, unitId
}: UpdateUnitServiceDTO): Promise<Company> {

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

  const unit = company.units.find(u => u.id === unitId)

  if (!unit) throw new ServiceError({
    message: "Unit doest exists",
    code: "company.unit.update.U404",
    status: 400
  })

  const updateUnitValidationSchema = object({
    name: string().required().max(50),
  })

  try {
    await updateUnitValidationSchema.validate({
      name
    });
    unit.name = name;
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
      status: 400,
      code: 'company.unit.update.VA400',
      errors: error.errors || []
    })
  }

}
