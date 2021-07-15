import { getMongoRepository } from "typeorm";

import { ServiceError } from '../util/ServiceError';
import { User } from '../models/User';
import { Company } from '../models/Company';
import { Notification } from "../models/Notification";

interface AddEmployeeToCompanyServiceDTO {
  notificationId: string;
  companyId: string;
  userId: string;
}

export async function AddEmployeeToCompanyService({
  notificationId,
  companyId,
  userId
}: AddEmployeeToCompanyServiceDTO) {
  const usersRepository = getMongoRepository(User);
  const companiesRepository = getMongoRepository(Company);
  const notificationsRepository = getMongoRepository(Notification);

  //#request: validar a subscription, pra ver se ele pode ta adicionando mais cara
  // let owner: User | undefined;
  let employee: User | undefined;
  let company: Company | undefined;
  let notification: Notification | undefined;
  try {
    // owner = await usersRepository.findOne(ownerId);
    employee = await usersRepository.findOne(userId);
    company = await companiesRepository.findOne(companyId);
    notification = await notificationsRepository.findOne(notificationId);
  } catch (error) {
    throw new ServiceError({
      message: error.message,
      code: "unhandled"
    })
  }
  if (!employee || !userId.length) throw new ServiceError({
    message: "User doesn't exist",
    code: "company.employee.U404",
    status: 400
  })
  if (!company || !companyId.length) throw new ServiceError({
    message: "Company doesn't exist",
    code: "company.employee.C404",
    status: 400
  })

  if (!notification || !notificationId.length) throw new ServiceError({
    message: "Notification doesn't exist",
    code: "company.employee.N404",
    status: 400
  })


  if (employee.companyId) throw new ServiceError({
    message: "User already registered in a company.",
    code: "company.employee.add.E400",
    status: 400
  })

  //#request: validar a subscripton [slots de user] 

  try {
    // gerar a notificação pro user e pro owner

    const readedNotification = notificationsRepository.merge(notification, {
      readAt: new Date()
    })
    await notificationsRepository.save(readedNotification)

    await usersRepository.save({
      ...employee,
      companyId: company.id
    })
    return true;
  } catch (error) {

    throw new ServiceError({
      message: error.message,
      code: "unhandled"
    })
  }

}
