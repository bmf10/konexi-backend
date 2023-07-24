export const successResponse = (
  data: unknown,
  message = 'Success',
  code = 200,
) => ({
  status: {
    code: code,
    message: message,
  },
  message: message,
  data,
})
