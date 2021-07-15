import { getMongoRepository } from "typeorm";
import { File } from '../models/File'
import { ServiceError } from "../util/ServiceError";

interface FetchFileServiceDTO {
  fileId: string;
}

export async function FetchFileService({ fileId }: FetchFileServiceDTO) {
  const filesRepository = getMongoRepository(File);
  let file: File | undefined;
  try {
    file = await filesRepository.findOne(fileId);
  } catch (err) {
    throw new ServiceError({
      message: err.message,
    })
  }
  if (!file) throw new ServiceError({
    message: "file not found",
    code: "files.f404",
    status: 400
  })
  return file;
}
