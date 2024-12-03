import { Request, Response } from "express";
import BookModel from "../models/book_model";
import { validationResult } from "express-validator";
import LoanModel from "../models/loan_model";

const LibrarianController = {
  async addBook(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // Render the form with validation errors and pre-filled form data
      return res.status(400).render("add-book", {
        errors: errors.array(),
        formData: req.body,
      });
    }

    const { author, title, isbn } = req.body;

    try {
      // Add book to the database
      const book = await BookModel.addBook({ author, title, isbn });

      if (!book) {
        throw new Error("Failed to add the book. Please try again.");
      }

      // Redirect to the dashboard on success
      res.redirect("/librarian/dashboard");
    } catch (error: any) {
      console.error("Error adding book:", error);

      // Render the add-book form with an error message
      res.status(500).render("add-book", {
        errors: [{ msg: error.message }],
        formData: req.body,
      });
    }
  },
   async getEditBook(req:Request, res:Response)  {
    try {
        const bookId = req.body;
        const book = await BookModel.findBookById(parseInt(bookId)); // Fetch the book by its ID from the database

        if (!book) {
          res.status(404).send("Book not found");
            return 
        }

        // Pass the book data to the EJS view
        res.render('edit', { book });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
},


  async editBook(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { title, author, isbn, available } = req.body;
    try {
      const book = await BookModel.editBook(parseInt(id), {
        title,
        author,
        isbn,
        available,
      });
      res.redirect("/librarian/dashboard");
    } catch (error) {
      res.status(500).json({ error: "Error editing book", details: error });
    }
  },

  async deleteBook(_req: Request, res: Response) {
    const { id } = _req.body;

    if (!id) {
      // If ID is missing, return early to prevent further execution
      res.status(400).redirect("/librarian/dashboard");
      return;
    }

    try {
      // Attempt to remove the book by its ID
      const deleted = await BookModel.removeBook(parseInt(id));

      if (!deleted) {
        // If no book was deleted, it means the book was not found, return response and stop further execution
        res.status(404).json({ error: "Book not found" });
        return;
      }

    
      res.redirect("/librarian/dashboard");
    } catch (error) {
      // If there's an error, send the error response and stop execution
      console.error("Error deleting book:", error);
      res.status(500).json({ error: "Error removing book", details: error });
    }
  },
  async returnBook(req: Request, res: Response) {
    const { loanId } = req.body; // Extract loanId from request body

    if (!loanId || isNaN(parseInt(loanId))) {
      res.status(400).send("Invalid loan ID");
      return; 
    }

    try {

      await LoanModel.returnLoanTransaction(Number(loanId));

      res.redirect("/librarian/transactions"); // Redirect to transactions page after return
    } catch (error) {
      console.error("Error returning the book:", error);
      res.status(500).send("Internal Server Error");
    }
  },
  async searchBook(req: Request, res: Response): Promise<void> {
    const { query } = req.body; 

    if (!query) {
      res.status(400).json({ error: "Search query is required" });
      return;
    }

    try {
      // Search books using the model method
      const books = await BookModel.searchBooks(query);

      if (books.length === 0) {
        res.render("librarian/search",{data:[]});
        return;
      }

      res.render("librarian/search", { data: books }); // Return the list of found books
    } catch (error) {
      console.error("Error searching books:", error);
      res.status(500).json({ error: "Error searching books" });
    }
  },

  async getAllBooks(req: Request, res: Response): Promise<void> {
    try {
      const books = await BookModel.getAllBooks();
      res.render("librarian/index", { data: books });
    } catch (error) {
      res
        .status(500)
        .render("error", { error: "Error fetching books", details: error });
    }
  },
  async getAllTransactions(req: Request, res: Response): Promise<void> {
    try {
      // Query to fetch loan history with book and user details

      const transctions = await LoanModel.getAllLoanTransactions();
      // Render the loan history page with the fetched loans
      res.render("librarian/history", { loans: transctions });
    } catch (error) {
      console.error("Error fetching loan history:", error);
      res
        .status(500)
        .send("An error occurred while fetching the loan history.");
    }
  },
};

export default LibrarianController;
