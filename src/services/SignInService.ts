import { getMongoRepository } from "typeorm";
import { sign, Secret, SignOptions } from 'jsonwebtoken';
import { compare } from 'bcrypt'
import { promisify } from 'util'
import ms from 'ms'

import TokenPayloadType from "../contracts/TokenPayloadType";
import { User } from "../models/User";
import authConfig from '../configs/auth';
import { ServiceError } from "../util/ServiceError";
import { RefreshToken } from "../models/RefreshToken";
import moment from "moment";

interface SignInServiceDTO {
  email: string;
  password: string;
  device?: string;
}

export async function SignInService({
  email,
  password,
  device
}: SignInServiceDTO) {
  const userRepository = getMongoRepository(User);
  console.log(email)
  const user = await userRepository.findOne({
    where: { email }, select: [
      'password',
      'fullname',
      'id',
      'refreshTokens'
    ]
  })
  if (!user) throw new ServiceError({
    message: "User not found",
    code: "auth.signin.U404",
    status: 400
  })



  try {
    const result = await promisify(compare)(password, user.password);
    if (result) {
      const payload: TokenPayloadType = {
        user: {
          id: user.id as unknown as string,
          fullname: user.fullname,
          email,
        },
      };
      const token = await promisify<TokenPayloadType, Secret, SignOptions>(
        sign,
      )(payload, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      });
      const refreshToken = new RefreshToken(
        device || 'devil-web',
        moment().add(ms(authConfig.refreshable), 'milliseconds').toDate()
      );
      await userRepository.save({
        id: user.id,
        refreshTokens: [
          ...(user.refreshTokens || []),
          refreshToken
        ]
      });
      console.log(token)
      return { token, refreshToken: refreshToken.token, payload };
    }
    throw new ServiceError({
      message: "bad credentials",
      code: "auth.signin.M404",
      status: 400
    })
  } catch (e) {
    throw new ServiceError({ message: e.message, code: "unhandled" })
  }
}
