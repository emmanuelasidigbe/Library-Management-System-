import { Request, Response, NextFunction } from "express";


export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Error occurred:", err);

  // Check for specific status code, if not set, default to 500
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // If the error is a validation or custom error, you might want to provide more context
  if (statusCode === 400) {
    return res.status(statusCode).render("error", {
      message: `Bad Request: ${message}`,
      code:400
    });
  }

  // Handle 404 Not Found
  if (statusCode === 404) {
    return res.status(statusCode).render("error", {
      message: `Not Found: ${message}`,
      code:404
    });
  }

  // Default error handler for other errors
  return res.status(statusCode).render("error", {
    message: `Something went wrong: ${message}`,
    code: statusCode
  });
}
