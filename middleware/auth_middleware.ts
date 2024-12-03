import { NextFunction, Request, Response } from "express";
export const ensureRole = (role: "librarian" | "user") => {
  return (req: Request, res: Response, next: NextFunction) => {
    
    const user = (req.session as any)?.user as  any;

    if (user && user.role === role) {
      // If user exists and has the correct role, proceed to the next middleware
      return next();
    } else {
      console.log(
        `Unauthorized access attempt by ${user?.email || "unknown user"}`
      );
      return res
        .status(403)
        .render("403", {
          errorMessage: "Access denied: insufficient permissions.",
        });
    }
  };
};
