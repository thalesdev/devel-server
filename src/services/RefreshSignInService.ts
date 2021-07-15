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

interface RefreshSignInServiceDTO {
  tokenProvided: string;
  device?: string;
}

export async function RefreshSignInService({
  tokenProvided,
  device
}: RefreshSignInServiceDTO) {
  const userRepository = getMongoRepository(User);

  const user = await userRepository.findOne({
    where: {
      'refreshTokens.token': { $eq: tokenProvided }
    }
  })

  if (!user) throw new ServiceError({
    message: "Invalid Token.",
    code: "auth.signin.U404",
    status: 400
  })

  const tokenData = user.refreshTokens.find(token => token.token === tokenProvided)

  if (moment(tokenData?.expiresAt).diff(moment().toNow(), 'seconds') < 0) throw new ServiceError({
    message: "Token provived is expired",
    code: "auth.signin.T400",
    status: 401
  })

  try {
    const payload: TokenPayloadType = {
      user: {
        id: user.id as unknown as string,
        fullname: user.fullname,
        email: user.email,
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
        ...(user.refreshTokens || []).filter(t => t.token !== tokenProvided),
        refreshToken
      ]
    });
    return { token, refreshToken: refreshToken.token, payload };

  } catch (e) {
    throw new ServiceError({ message: e.message, code: "unhandled" })
  }
}
