export interface HttpResponse { statusCode: number, body: string }

export const noContent = (): HttpResponse => {
  return {
    statusCode: 204,
    body: ''
  }
}

export const ok = (body: unknown): HttpResponse => {
  return {
    statusCode: 200,
    body: JSON.stringify(body)
  }
}

export const internalServerError = (message: string, error: unknown = new Error('Unknown failure!')): HttpResponse => {
  return {
    statusCode: 500,
    body: JSON.stringify({
      friendlyMessage: message,
      errorMessage: error instanceof Error ? error.message : 'Unknown failure!'
    })
  }
}

export const notFoundError = (message: string, error: unknown = new Error('Resource not found!')): HttpResponse => {
  return {
    statusCode: 404,
    body: JSON.stringify({
      friendlyMessage: message,
      errorMessage: error instanceof Error ? error.message : 'Resource not found!'
    })
  }
}

export const badRequest = (message: string, error: unknown = new Error('Something into the request is invalid!')): HttpResponse => {
  return {
    statusCode: 400,
    body: JSON.stringify({
      friendlyMessage: message,
      errorMessage: error instanceof Error ? error.message : 'Something into the request is invalid!'
    })
  }
}
