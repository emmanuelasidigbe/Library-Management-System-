import { Router, Request, Response } from "express";
import { ensureRole } from "../middleware/auth_middleware";
import BookModel from "../models/book_model";
import LibrarianController from "../controllers/librarian_controller";
import { addBookValidator, editBookValidator } from "../middleware/validator_middleware";

const router: Router = Router();

router.use(ensureRole("librarian"));

router.get("/dashboard", async (req: Request, res: Response) => {
  const books = await BookModel.getAllBooks();

  res.render("librarian/index", { data: books });
});
router.get("/add-book", (req: Request, res: Response) => {
  res.render("librarian/add", {
    errorMessage: "",
  });
});
router.get("/report", LibrarianController.getReport);


router.get("/edit-book/:id", LibrarianController.getEditBook);
router.get("/transactions", LibrarianController.getAllTransactions);
router.post("/edit-book/:id", editBookValidator, LibrarianController.editBook);
router.post("/transactions", LibrarianController.returnBook);

router.post("/add-book", addBookValidator, LibrarianController.addBook);

router.post("/delete-book", LibrarianController.deleteBook);

router.post("/search", LibrarianController.searchBook);

export default router;
