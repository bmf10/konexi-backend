import fs from 'fs'

export const readFile = (file: string): Promise<Buffer> =>
  new Promise<Buffer>((reolve, reject) => {
    fs.readFile(file, (e, data) => {
      if (e) {
        reject(e)
      } else {
        reolve(data)
      }
    })
  })

export const unlink = (file: string): Promise<void> =>
  new Promise((resolve, reject) => {
    fs.unlink(file, (e) => {
      if (e) {
        reject(e)
      } else {
        resolve()
      }
    })
  })

export default { readFile, unlink }
