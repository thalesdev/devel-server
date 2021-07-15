import { ObjectId } from "mongodb";
import { getMongoRepository } from "typeorm";
import { object, string } from "yup";
import { Company } from "../models/Company";
import { User } from "../models/User";
import { ServiceError } from "../util/ServiceError";

interface CreateCompanyServiceDTO {
  userId: string;
  name: string;
  cnpj: string;
}

export async function CreateCompanyService({
  userId,
  name,
  cnpj
}: CreateCompanyServiceDTO): Promise<Company> {

  const userRepository = getMongoRepository(User);
  const companyRepository = getMongoRepository(Company);


  const userExists = await userRepository.findOne(userId)
  if (!userExists) throw new ServiceError({
    message: "User does not exist",
    code: "company.create.U404",
    status: 400,
  })

  const cnpjExists = await companyRepository.findOne({ where: { cnpj } })

  if (cnpjExists) throw new ServiceError({
    message: "CNPJ already registered",
    code: "company.create.C400",
    status: 400,
  })


  const newCompanyValidationSchema = object({
    cnpj: string().defined(),
    name: string().defined().max(50)
  })

  try {
    await newCompanyValidationSchema.validate({
      cnpj,
      name
    })
    const companyData = companyRepository.create({
      cnpj,
      name,
      ownerId: new ObjectId(userId)
    })
    const company = await companyRepository.save(companyData)

    return company;

  } catch (error) {
    throw new ServiceError({
      message: error.message || 'Validation failed with errors.',
      status: 400,
      code: 'company.create.VA400',
      errors: error.errors || []
    })
  }

}
