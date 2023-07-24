import { Joi } from 'express-validation'
import type { AnySchema, CustomHelpers, Extension, ExtensionRule } from 'joi'

interface FileSchema extends AnySchema {
  readonly maxSize: (maxSize: number) => FileSchema
  readonly mimeTypes: (mimeTypes: ReadonlyArray<string>) => FileSchema
  readonly image: () => FileSchema
}

type JoiRoot = typeof Joi

export interface JoiWithFileRules extends JoiRoot {
  readonly file: () => FileSchema
}

interface FileRulesExtension extends Extension {
  rules?: Record<string, ExtensionRule & ThisType<FileSchema>>
}

const extend: (joi: JoiRoot) => FileRulesExtension = (joi) => {
  const mimeTypeRegex = /^[a-z]+?\/([a-z]+?|[a-z]+?\+[a-z]+?|[a-z._-]+?|\*)$/
  return {
    type: 'file',
    base: joi.any(),
    messages: {
      'file.mimeTypes':
        '{{#label}} mime type must match one of [{{#mimeTypes}}]',
      'file.mimeType': '{{#label}} mime type must match {{#mimeType}}',
      'file.maxSize': '{{#label}} size must be at most {{#maxSize}}',
      'file.invalid': '{{#label}} must be a valid file',
    },
    coerce: (value: Express.Multer.File) => ({ value }),
    validate: (value: Express.Multer.File, helpers) => {
      if (!value.mimetype || !value.size) {
        return { value, errors: helpers.error('file.invalid') }
      }
      return { value }
    },
    rules: {
      mimeTypes: {
        multi: true,
        method(mimeTypes: string[]) {
          return this.$_addRule({ name: 'mimeTypes', args: { mimeTypes } })
        },
        args: [
          {
            name: 'mimeTypes',
            ref: true,
            assert: (value?: ReadonlyArray<string>) => {
              if (value) {
                for (const v of value) {
                  if (!mimeTypeRegex.test(v)) {
                    return false
                  }
                }
              }
              return true
            },
            message: 'mimeTypes are invalid',
          },
        ],
        validate: (
          value: Express.Multer.File,
          helpers: CustomHelpers,
          { mimeTypes }: { readonly mimeTypes: ReadonlyArray<string> },
        ) => {
          if (mimeTypes.length === 0) {
            return value
          }
          for (const mimeType of mimeTypes) {
            if (mimeType === value.mimetype) {
              return value
            }
            if (
              mimeType.endsWith('/*') &&
              value.mimetype.startsWith(mimeType.replace(/\/\*$/, ''))
            ) {
              return value
            }
          }
          if (mimeTypes.length === 1) {
            return helpers.error('file.mimeType', { mimeType: mimeTypes[0] })
          }
          return helpers.error('file.mimeTypes', {
            mimeTypes: mimeTypes.join(),
          })
        },
      },
      image: {
        method() {
          return this.mimeTypes(['image/*'])
        },
      },
      maxSize: {
        multi: true,
        method(maxSize: number) {
          return this.$_addRule({ name: 'maxSize', args: { maxSize } })
        },
        args: [
          {
            name: 'maxSize',
            ref: true,
            assert: (value) => typeof value === 'number' && !isNaN(value),
            message: 'must be a number',
          },
        ],
        validate: (
          value: Express.Multer.File,
          helpers: CustomHelpers,
          { maxSize }: { readonly maxSize: number },
        ) => {
          if (value.size <= maxSize) {
            return value
          }
          return helpers.error('file.maxSize', { maxSize })
        },
      },
    },
  }
}

const joi: JoiWithFileRules = Joi.extend(extend)

export const extendFunction = extend

export default joi
