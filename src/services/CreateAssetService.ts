import { getMongoRepository } from "typeorm";

import { ServiceError } from '../util/ServiceError'
import { File } from '../models/File'
import { Company } from '../models/Company'
import { Asset, AssetStatus } from "../models/Asset";
import { number, object, string } from "yup";

interface CreateAssetServiceDTO {
  name: string;
  description: string;
  model: string;
  status: AssetStatus;
  healthLevel: number;
  fileId: string;
  companyId: string;
  unitId: string;
}

export async function CreateAssetService({
  name,
  description,
  model,
  status,
  healthLevel,
  fileId,
  companyId,
  unitId
}: CreateAssetServiceDTO) {
  const filesRepository = getMongoRepository(File);

  const companiesRepository = getMongoRepository(Company);
  let file: File | undefined;
  let company: Company | undefined;
  try {
    file = await filesRepository.findOne(fileId);
    company = await companiesRepository.findOne(companyId);
  } catch (error) {
    throw new ServiceError({
      message: error.message,
      code: "unhandled"
    })
  }

  if (!file) throw new ServiceError({
    message: "File not found",
    code: "company.asset.F404",
    status: 400
  })

  if (!company) throw new ServiceError({
    message: "Company not found",
    code: "company.asset.C404",
    status: 400
  })

  const unit = (company.units || []).find(unit => unit.id === unitId)



  if (!unit) throw new ServiceError({
    message: "Asset not found",
    code: "company.asset.A404",
    status: 400
  })

  const newAssetValidationSchema = object({
    name: string().required(),
    description: string().optional(),
    model: string().required(),
    healthLevel: number().min(0).max(100),
    status: string().oneOf(["Running", "Alerting", "Stopped"]).required(),
  })

  try {
    await newAssetValidationSchema.validate({
      name,
      description,
      model,
      status,
      healthLevel
    })
    unit.assets = [
      ...(unit.assets || []),
      new Asset(
        name, // required
        description, // required
        model, // required
        status, // verificar o status
        healthLevel, // verificar range do health level
        file.id
      )
    ];

    return await companiesRepository.save({
      ...company,
      units: [
        ...company.units.filter(unit => unit.id !== unitId),
        unit
      ]
    })

  } catch (error) {
    // melhorar esse erro
    throw new ServiceError({
      message: error.message,
      code: "unhandled"
    })
  }

}
