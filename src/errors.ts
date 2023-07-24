/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { ErrorRequestHandler } from 'express'
import { ValidationError } from 'express-validation'
import { HttpError } from 'express-response-errors'
import {
  ValidationErrorItem,
  ValidationError as RawValidationError,
} from '@hapi/joi'

export class ErrorResponse {
  readonly isErrorResponse = true
  readonly body: ErrorResponseBody

  constructor(body: ErrorResponseBody) {
    this.body = body
  }
}

export interface ErrorResponseBody {
  readonly status: {
    readonly code: number
    readonly message: string
  }
  readonly message?: string
  readonly details?: {
    readonly body?: any
    readonly cookies?: any
    readonly headers?: any
    readonly params?: any
    readonly query?: any
    readonly signedCookies?: any
  }
}

const errorMapper = (err?: ReadonlyArray<ValidationErrorItem>) => {
  if (err) {
    return err.reduce(
      (a, d) =>
        d.path.reduce((o: any, v, i) => {
          if (i === d.path.length - 1) {
            o[v] = d.message
            return a
          } else {
            let inner
            const p = d.path[i]
            const n = d.path[i + 1]
            if (typeof n === 'string') {
              inner = o[p] || {}
            } else {
              inner = o[p] || []
            }
            o[p] = inner
            return inner
          }
        }, a),
      {},
    )
  }
}

const errorBodyMapper = (err: ValidationError) => ({
  status: {
    code: err.statusCode,
    message: err.error,
  },
  message: err.message,
  details: {
    body: errorMapper(err.details.body as any),
    cookies: errorMapper(err.details.cookies as any),
    headers: errorMapper(err.details.headers as any),
    params: errorMapper(err.details.params as any),
    query: errorMapper(err.details.query as any),
    signedCookies: errorMapper(err.details.signedCookies as any),
  },
})

interface JoiError {
  [key: string]: ReadonlyArray<ValidationErrorItem>
}

type JoiValidationError = RawValidationError & JoiError

const joiErrorBodyMapper = (err: JoiValidationError) => ({
  status: {
    code: 400,
    message: 'Bad Request',
  },
  message: err.message,
  details: {
    body: errorMapper(err.body),
    cookies: errorMapper(err.cookies),
    headers: errorMapper(err.headers),
    params: errorMapper(err.params),
    query: errorMapper(err.query),
    signedCookies: errorMapper(err.signedCookies),
  },
})

const env = process.env.NODE_ENV || 'development'

const internalServerErrorMapper = (err: any) => ({
  status: {
    code: 500,
    message: 'Internal Server Error',
  },
  message: err instanceof Error ? err.message : undefined,
  details: {
    stack: env === 'production' ? undefined : err.stack,
  },
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json(errorBodyMapper(err))
  }
  if (err.isJoi) {
    const e = err as JoiValidationError
    return res.status(400).json(joiErrorBodyMapper(e))
  }
  if (err instanceof HttpError) {
    return res.status(err.code).json({
      status: {
        code: err.code,
        message: err.message,
      },
      message: err.message,
    })
  }
  if (err.isErrorResponse) {
    const e = err as ErrorResponse
    return res.status(e.body.status.code).json(e.body)
  }
  return res.status(500).json(internalServerErrorMapper(err))
}

export default handler
