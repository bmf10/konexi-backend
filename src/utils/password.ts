import * as crypt from 'bcrypt'

export const hash = async (plain: string): Promise<string> => {
  return crypt.hash(plain, 5)
}

export const verify = async (hash: string, plain: string): Promise<boolean> => {
  return crypt.compare(plain, hash)
}

export default { hash, verify }
