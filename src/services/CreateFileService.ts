import { ObjectId } from 'mongodb';
import { getMongoRepository } from 'typeorm'
import { File } from '../models/File'
import { ServiceError } from '../util/ServiceError'

export interface FileProps {
  key: string;
  originalname: string;
  location: string;
  contentType: string;
  size: number;
  mimetype: string;
}

interface CreateFileServiceDTO {
  userId: string;
  file: FileProps;
}


export async function CreateFileService({
  userId,
  file
}: CreateFileServiceDTO): Promise<File> {
  const filesRepository = getMongoRepository(File);

  try {
    const fileData = filesRepository.create({
      userId: new ObjectId(userId),
      ...file,
    })

    return await filesRepository.save(fileData);

  } catch (error) {
    throw new ServiceError({
      message: error.message,
      code: "unhandled"
    })
  }
}
