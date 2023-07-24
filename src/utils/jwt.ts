import * as crypt from 'jsonwebtoken'
import type { SignOptions, VerifyOptions } from 'jsonwebtoken'

const signOptions: SignOptions = {
  algorithm: 'HS256',
  expiresIn: '7d',
  issuer: 'konexi-api',
  audience: 'konexi-audience',
}
const verifyOptions: VerifyOptions = {
  algorithms: ['HS256'],
  issuer: 'konexi-api',
  audience: 'konexi-audience',
}

export const sign = async (payload: object): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    const secretText = process.env.SECRET_KEY
    return crypt.sign({ payload }, secretText!, signOptions, (e, token) => {
      if (e) {
        reject(e)
      } else {
        resolve(token as string)
      }
    })
  })

export interface VerifyResult<T> {
  readonly payload: T
  readonly iat: number
  readonly exp: number
}

export const verify = async <T>(token: string): Promise<VerifyResult<T>> =>
  new Promise((resolve, reject) => {
    const secretText = process.env.SECRET_KEY
    return crypt.verify(token, secretText!, verifyOptions, (e, raw) => {
      if (e) {
        reject(e)
      } else {
        resolve(raw as VerifyResult<T>)
      }
    })
  })

export default { sign, verify }
