import { getMongoRepository } from "typeorm";
import { Company } from "../models/Company";
import { ServiceError } from "../util/ServiceError";

interface DeleteUnitServiceDTO {
  companyId: string;
  unitId: string;
  userId: string;
}

export async function DeleteUnitService(
  { companyId, unitId, userId }: DeleteUnitServiceDTO
): Promise<Company> {
  const companyRepostiory = getMongoRepository(Company);

  const company = await companyRepostiory.findOne(companyId);
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
    return await companyRepostiory.save({
      ...company,
      units: (company.units || []).filter(unit => unit.id !== unitId)
    })
  } catch (error) {
    throw new ServiceError({
      message: error.message,
      code: "unhandled"
    })
  }

}
