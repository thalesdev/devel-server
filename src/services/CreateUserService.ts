import { object, string, number } from 'yup';
import { getMongoRepository } from 'typeorm'
import { User } from '../models/User'
import { ServiceError } from '../util/ServiceError';
import { SignInService } from './SignInService';

interface CreateUserServiceDTO {
  fullname: string;
  email: string;
  password: string;
  device?: string;
}

export async function CreateUserService({
  fullname, email, password, device
}: CreateUserServiceDTO) {

  const userRepository = getMongoRepository(User);

  const userEmailExists = await userRepository.findOne({ where: { email: email } })

  if (userEmailExists) throw new ServiceError({
    message: 'User already exists', code: 'user.create.AR400', status: 400
  });

  const newUserValidationSchema = object({
    email: string().defined().email(),
    fullname: string().defined().max(50),
    password: string().defined().min(6).max(16),
  })

  try {

    await newUserValidationSchema.validate({
      fullname, email, password
    });
    const userData = userRepository.create({
      fullname,
      email,
      password
    })

    await userRepository.save(userData)
    const credentials = await SignInService({ email, password, device });

    return credentials;

  } catch (error) {

    throw new ServiceError({
      message: error.message || 'Validation failed with errors.',
      status: 400,
      code: 'user.create.VA400',
      errors: error.errors || []
    })
  }

}
