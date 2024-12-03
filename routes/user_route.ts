import { Router,Request,Response } from "express";
import { ensureRole } from "../middleware/auth_middleware";
import BookModel from "../models/book_model";
import UserController from "../controllers/user_controller";


const router: Router = Router();

router.use(ensureRole("user"));

router.get("/dashboard", async (req:Request, res:Response) => {
  const books = await BookModel.getAllBooks()
  res.render("user/index",{data:books});
});
router.get("/history",UserController.getHistory);

router.post('/loan',UserController.borrowBook)


router.post("/search",UserController.searchBook)

export default router;
 