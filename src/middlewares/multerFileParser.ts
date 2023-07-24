/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import type { RequestHandler } from 'express'
import type { Schema } from 'joi'
import { merge, toArray, flatten } from 'lodash'

const parse = (files: ReadonlyArray<Express.Multer.File>) =>
  files.reduce((a, f) => {
    const path = f.fieldname
      .split(/\[|\]/)
      .filter((v) => v !== '')
      .map((v) => {
        const n = Number(v)
        if (Number.isNaN(n)) {
          return v
        }
        return n
      })
    return path.reduce((o: any, p, i) => {
      if (i === path.length - 1) {
        o[p] = f
        return a
      } else {
        let inner
        const n = path[i + 1]
        if (typeof n === 'string') {
          inner = o[p] || {}
        } else {
          inner = o[p] || []
        }
        o[p] = inner
        return inner
      }
    }, a)
  }, {})

export default (schema?: Schema): RequestHandler =>
  async (req, res, next) => {
    try {
      const files = Array.isArray(req.files)
        ? req.files
        : req.file
        ? [req.file]
        : req.files
        ? flatten(
            toArray(req.files).map((fs) =>
              fs.length <= 1
                ? fs[0]
                : fs.map((f, i) => ({ ...f, path: `${f.path}[${i}]` })),
            ),
          )
        : []
      if (files.length === 0) {
        return next()
      }
      const parsedFiles = parse(files)
      if (schema) {
        await schema.validateAsync(parsedFiles)
      }
      req.parsedFile = parsedFiles
      req.body = merge(req.body, parsedFiles)
      return next()
    } catch (e) {
      if ((e as { [k: string]: any }).isJoi) {
        ;(e as { [k: string]: any }).body = (e as { [k: string]: any }).details
      }
      return next(e)
    }
  }
