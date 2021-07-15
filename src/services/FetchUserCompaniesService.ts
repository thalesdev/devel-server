import { getMongoManager, getMongoRepository } from "typeorm";
import { User } from '../models/User'
import { Company } from '../models/Company'
import { ServiceError } from "../util/ServiceError";
import { ObjectId } from "mongodb";

interface FetchUserCompaniesServiceDTO {
  userId: string;
}
export async function FetchUserCompaniesService({
  userId
}: FetchUserCompaniesServiceDTO) {
  const userRepository = getMongoRepository(User)
  const companyRepository = getMongoRepository(Company)

  const user = await userRepository.findOne(userId);
  if (!user) throw new ServiceError({
    message: "User not found",
    code: "company.list.U404",
    status: 400
  })

  const companies = await companyRepository.find({
    where: { ownerId: new ObjectId(userId) }
  })



  return companies;


}
