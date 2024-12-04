import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { getUserByEmail,createUser } from "../models/user_model";
import { validationResult } from "express-validator";

export async function signin(req: Request, res: Response) {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await getUserByEmail(email);

    if (user && bcrypt.compareSync(password, user.password)) {
      // Store user data in the session //the assersion 'any' is used to avoid typescript error because the type user is not defined for the session in express-session package
      (req.session as any).user = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        } 
      // Redirect based on role
      if (user.role === "librarian") {
        return res.redirect("/librarian/dashboard");
      } else if (user.role === "user") {
        return res.redirect("/user/dashboard");
      }
    } else {
      res.render("index", {
        errorMessage: "Invalid email or password",
      });
    }
  } catch (error) {
    console.error(error);
    res.render("index", {
      errorMessage: "Something went wrong, please try again.",
    });
  }
}

export async function signup(req: Request, res: Response) {
  const { name, email, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // If validation failed, send the errors back to the client
     res.status(400).render("signup",{errorMessage:"Invalid arguments,please try again"});
     return
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    //create new user
    await createUser(name, email, hashedPassword);
    //redirect user 
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.render("signup", {
      errorMessage: "Something went wrong, please try again.",
    });
  }
}
