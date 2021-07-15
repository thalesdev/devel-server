import { ObjectId } from "mongodb";
import { getMongoRepository } from "typeorm";

import { Company } from "../models/Company";
import { User } from "../models/User";
import { AssertUserIsPartOfCompany } from "../util/Asserts";
import { ServiceError } from "../util/ServiceError";

interface FetchCompanyServiceDTO {
  userId: string;
  companyId: string;
}
export async function FetchCompanyService({ userId, companyId }: FetchCompanyServiceDTO) {
  const usersRepository = getMongoRepository(User);
  const companiesRepository = getMongoRepository(Company);
  try {
    const companyExists = await companiesRepository.findOne(companyId);
    const userExists = await usersRepository.findOne(userId);

    AssertUserIsPartOfCompany(userExists, companyExists);

    const company = (await companiesRepository.aggregate<Company>([
      {
        $lookup: {
          from: 'user',
          localField: '_id',
          foreignField: 'companyId',
          as: 'employees',
        }
      },
      {
        $match: { "_id": new ObjectId(companyId) }
      },
      {
        $project: {
          "employees.password": false,
          "employees.companyId": false,
        }
      }
    ]).toArray())[0]

    return company;

  } catch (error) {
    throw new ServiceError({
      message: error.message || 'Unhandled error.',
      status: 500,
      code: 'unhandled',
    })
  }
}
