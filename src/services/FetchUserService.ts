import { ObjectId } from "mongodb";
import { getMongoRepository } from "typeorm";
import { User } from "../models/User";
import { ServiceError } from "../util/ServiceError";

interface FetchUserServiceDTO {
  userId: string;
}
export async function FetchUserService({ userId }: FetchUserServiceDTO) {
  const usersRepository = getMongoRepository(User);
  try {
    const user = (await usersRepository.aggregate<User>([
      {
        $lookup: {
          from: 'company',
          localField: '_id',
          foreignField: 'ownerId',
          as: 'owns',
        }
      },
      {
        $lookup: {
          from: 'notification',
          localField: '_id',
          foreignField: 'userId',
          as: 'notifications',
        }
      },
      {
        $lookup: {
          from: 'company',
          localField: 'companyId',
          foreignField: '_id',
          as: 'works',

        }
      },
      {
        $match: { "_id": new ObjectId(userId) }
      },
      {
        $project: {
          id: true,
          email: true,
          fullname: true,
          owns: true,
          works: true,
          notifications: true,
        }
      }
    ]).toArray())[0]

    return user;

  } catch (error) {
    console.log(error)
    throw new ServiceError({
      message: error.message || 'Unhandled error.',
      status: 500,
      code: 'unhandled',
    })
  }
}
