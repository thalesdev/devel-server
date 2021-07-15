import { object, string, ref } from 'yup';
import { getMongoRepository } from 'typeorm'
import { User } from '../models/User'
import { ServiceError } from '../util/ServiceError';

interface UpdateUserServiceDTO {
  fullname: string;
  passwordConfirmation: string;
  userId: string;
  password: string;
}

export async function UpdateUserService({
  fullname, passwordConfirmation, password, userId
}: UpdateUserServiceDTO): Promise<User> {

  const usersRepostitory = getMongoRepository(User);

  const user = await usersRepostitory.findOne(userId)

  if (!user) throw new ServiceError({
    message: 'User doest exists', code: 'user.update.AR400', status: 400
  });

  const newUserValidationSchema = object({
    fullname: string().optional().max(50),
    password: string().optional().min(6).max(16),
    passwordConfirmation: string()
      .when("password",
        (password) => password && string().required().oneOf([ref('password')], 'Password mismatch'))
  })

  try {

    await newUserValidationSchema.validate({
      fullname, passwordConfirmation, password
    });
    const userData = usersRepostitory.merge(user, {
      fullname,
      password: password || user.password
    })
    return usersRepostitory.save(userData)

  } catch (error) {
    throw new ServiceError({
      message: error.message || 'Validation failed with errors.',
      status: 400,
      code: 'user.update.VA400',
      errors: error.errors || []
    })
  }

}
