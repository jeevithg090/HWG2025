export const responseMapping = {
  SUCCESS: {
    code: 200,
    message: "Success",
  },
  CREATED: {
    code: 201,
    message: "Successfully created",
  },
  BAD_REQUEST: {
    code: 400,
    message: "Bad request",
  },
  UNAUTHORIZED: {
    code: 401,
    message: "Unauthorized access",
  },
  FORBIDDEN: {
    code: 403,
    message: "Forbidden",
  },
  NOT_FOUND: {
    code: 404,
    message: "Resource not found",
  },
  VALIDATION_ERROR: {
    code: 422,
    message: "Validation error",
  },
  SERVER_ERROR: {
    code: 500,
    message: "Internal server error",
  }
};
