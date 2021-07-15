import { getMongoRepository } from "typeorm";

import { ServiceError } from '../util/ServiceError';
import { User } from '../models/User';
import { Company } from '../models/Company';
import { AssertUserIsEmployeeOfCompany, AssertUserIsOwnerOfCompany } from "../util/Asserts";

interface RemoveEmployeeToCompanyServiceDTO {
  companyId: string;
  userId: string;
  ownerId: string;
}

export async function RemoveEmployeeToCompanyService({
  companyId,
  userId,
  ownerId
}: RemoveEmployeeToCompanyServiceDTO) {
  const usersRepository = getMongoRepository(User);
  const companiesRepository = getMongoRepository(Company);

  let owner: User | undefined;
  let employee: User | undefined;
  let company: Company | undefined;
  try {
    owner = await usersRepository.findOne(ownerId);
    employee = await usersRepository.findOne(userId);
    company = await companiesRepository.findOne(companyId);
  } catch (error) {
    throw new ServiceError({
      message: error.message,
      code: "unhandled"
    })
  }

  if (!employee) throw new ServiceError({
    message: "User doesn't exist",
    code: "company.employee.U404",
    status: 400
  })
  if (!company) throw new ServiceError({
    message: "Company doesn't exist",
    code: "company.employee.C404",
    status: 400
  })

  const fail403 = new ServiceError({
    message: "you are not allowed to complete this action",
    code: 'company.employee.add.U403',
    status: 403
  })

  AssertUserIsOwnerOfCompany(ownerId, company, fail403)
  AssertUserIsEmployeeOfCompany(employee, company.id.toString(), fail403)

  try {
    await usersRepository.save({
      ...employee,
      companyId: null
    })
    return true;
  } catch (error) {

    throw new ServiceError({
      message: error.message,
      code: "unhandled"
    })
  }

}
