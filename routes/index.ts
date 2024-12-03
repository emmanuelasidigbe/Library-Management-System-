import { Router, Request, Response } from "express";
import * as authController from "../controllers/auth_controller";
import { signUpValidator } from "../middleware/validator_middleware";

const router: Router = Router();

router.get("/", (req: Request, res: Response) => {
  res.render("index", { errorMessage: null });
});
router.get("/signup", (req: Request, res: Response) => {
  res.render("signup", { errorMessage: null });
});
router.post("/signup",signUpValidator, authController.signup);
router.post("/signin", authController.signin);

export default router;
