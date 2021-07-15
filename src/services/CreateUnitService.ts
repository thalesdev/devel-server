import { getMongoRepository } from "typeorm";
import { Company } from "../models/Company";
import { Unit } from "../models/Unit";
import { ServiceError } from "../util/ServiceError";

interface CreateUnitServiceDTO {
  companyId: string;
  name: string;
  userId: string;
}

export async function CreateUnitService({ name, companyId, userId }: CreateUnitServiceDTO) {
  const companyRepository = getMongoRepository(Company);

  const company = await companyRepository.findOne(companyId);
  if (!company) throw new ServiceError({
    message: "company not found",
    code: "company.units.C404",
    status: 400
  })

  if (company.ownerId.toString() !== userId) throw new ServiceError({
    message: "you are not allowed to complete this action",
    code: 'company.units.U403',
    status: 403
  })

  try {
    return await companyRepository.save({
      ...company,
      units: [
        ...(company.units || []),
        new Unit(name)
      ]
    })
  } catch (error) {
    throw new ServiceError({
      message: error.message,
      code: "unhandled"
    })
  }
}
