import { Request, Response } from "express";
import BookModel from "../models/book_model";
import { validationResult } from "express-validator";
import LoanModel from "../models/loan_model";
import { Book } from "../types";
import { getAllUsers } from "../models/user_model";

const LibrarianController = {
  async getReport(req: Request, res: Response) {
      try {
        // Fetch all users, books, and loan transactions
        const users = await getAllUsers(); // Fetch all users from user model
        const books = await BookModel.getAllBooks(); // Fetch all books from the BookModel
        const transactions = await LoanModel.getAllLoanTransactions(); // Fetch all loan transactions from LoanModel
        const avialbaleBooks= books.filter((book) => book.available)
        const unavailableBooks= books.filter((book)=> !book.available)
        // Pass the data to the EJS template
        res.render("librarian/report", {
          unavailableBooks,
          avialbaleBooks,
          users,
          books,
          loans:transactions,
        });
      } catch (error) {
        console.error("Error fetching data for admin dashboard:", error);
        res.status(500).send("Internal Server Error");
      }

  },
  async addBook(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      res.status(400).render("librarian/add", {
        errorMessage: "invalid arguments, try again",
        formData: req.body,
      });
      return;
    }

    const { author, title, isbn } = req.body;

    try {
      // Add book to the database
      const book = await BookModel.addBook({ author, title, isbn });

      if (!book) {
        res.status(500).render("librarian/add", {
          errorsMessage: "Failed to add the book. Please try again.",
          formData: req.body,
        });
      }

      // Redirect to the dashboard on success
      res.redirect("/librarian/dashboard");
    } catch (error: any) {
      console.error("Error adding book:", error);

      // Render the add-book form with an error message
      res.status(500).render("librarian/add", {
        errorsMessage:"something went wrong on our side",
        formData: req.body,
      });
    }
  },
  async getEditBook(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const book: Book = await BookModel.findBookById(parseInt(id)); // Fetch the book by its ID from the database

      if (!book) {
        res.status(404).send("Book not found");
        return;
      }

      // Pass the book data to the EJS view
      res.render("librarian/edit", { book, errorMessage: "" });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  },

  async editBook(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { title, author, isbn, available } = req.body;
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      // Render the form with validation errors and pre-filled form data
      res.status(400).render("librarian/edit", {
        book: { title, author, isbn, available, id },
        errorMessage: "invalid params, try again",
      });
      return;
    }
    try {
      const book = await BookModel.editBook(parseInt(id), {
        title,
        author,
        isbn,
      });
      console.log(book);

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
        res.render("librarian/search", { data: [] });
        return;
      }

      res.render("librarian/search", { data: books }); // Return the list of found books
    } catch (error) {
      console.error("Error searching books:", error);
      res.status(500).render("error", {
        errorMessage: "Error searching books",
        details: error,
      });
    }
  },

  async getAllBooks(req: Request, res: Response): Promise<void> {
    try {
      const books = await BookModel.getAllBooks();
      res.render("librarian/index", { data: books });
    } catch (error) {
      res
        .status(500)
        .render("error", {
          errorMessage: "Error fetching books",
          details: error,
        });
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
        .render("error", {
          errorMessage: "An error occurred while fetching the loan history.",
          details: error,
        });
    }
  },
};

export default LibrarianController;
