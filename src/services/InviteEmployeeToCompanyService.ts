import { getMongoRepository } from "typeorm";

import { ServiceError } from '../util/ServiceError';
import { User } from '../models/User';
import { Company } from '../models/Company';
import { Notification } from '../models/Notification';
import { AssertUserIsOwnerOfCompany } from "../util/Asserts";

interface InviteEmployeeToCompanyServiceDTO {
  ownerId: string;
  companyId: string;
  email: string;
}

export async function InviteEmployeeToCompanyService({
  ownerId,
  companyId,
  email
}: InviteEmployeeToCompanyServiceDTO) {
  const usersRepository = getMongoRepository(User);
  const companiesRepository = getMongoRepository(Company);
  const notificationsRepository = getMongoRepository(Notification);

  //#request: validar a subscription, pra ver se ele pode ta adicionando mais cara
  let owner: User | undefined;
  let employee: User | undefined;
  let company: Company | undefined;
  try {
    owner = await usersRepository.findOne(ownerId);
    employee = await usersRepository.findOne({ where: { email } });
    company = await companiesRepository.findOne(companyId);
  } catch (error) {
    throw new ServiceError({
      message: error.message,
      code: "unhandled"
    })
  }
  if (!employee || !ownerId.length) throw new ServiceError({
    message: "User doesn't exist",
    code: "company.employee.OW404",
    status: 400
  })
  if (!owner || !email.length) throw new ServiceError({
    message: "User doesn't exist",
    code: "company.employee.U404",
    status: 400
  })
  if (!company || !companyId.length) throw new ServiceError({
    message: "Company doesn't exist",
    code: "company.employee.C404",
    status: 400
  })

  AssertUserIsOwnerOfCompany(ownerId, company, new ServiceError({
    message: "you are not allowed to complete this action",
    code: 'company.employee.add.U403',
    status: 403
  }))

  if (employee.companyId) throw new ServiceError({
    message: "User already registered in a company.",
    code: "company.employee.add.E400",
    status: 400
  })


  try {
    const notificationData = notificationsRepository.create({
      userId: employee.id as any,
      content: {
        companyId,
        userId: employee.id.toString(),
        type: "invite",
        message: `You have been invited to join the company ${company.name}`
      }
    })
    await notificationsRepository.save(notificationData)
    return true;
  } catch (error) {

    throw new ServiceError({
      message: error.message,
      code: "unhandled"
    })
  }

}
