import { Request, Response } from "express";
import BookModel from "../models/book_model";
import LoanModel from "../models/loan_model";

const UserController = {
  async searchBook(req: Request, res: Response): Promise<void> {
    const { query } = req.body; // or req.query if you pass it via URL query params

    if (!query) {
      res.status(400).json({ error: "Search query is required" });
      return;
    }

    try {
      // Search books using the model method
      const books = await BookModel.searchBooks(query);

      if (books.length === 0) {
        res.render("user/search",{data:[]});
        return;
      }

      res.render("user/search", { data: books }); // Return the list of found books
    } catch (error) {
      console.error("Error searching books:", error);
      res.status(500).json({ error: "Error searching books" });
    }
  },
  async getHistory(req: Request, res: Response) {
    try {
      // Retrieve user ID from session
      const userId = (req.session as any).user?.id;

      // Check if userId exists in the session
      if (!userId) {
        res
          .status(400)
          .json({ error: "User not logged in or session expired" });
        return;
      }

      // Fetch loan history from the model
      const history = await LoanModel.getUserLoans(userId);

      // If no history is found, respond with a message
      if (!history) {
        res
          .status(404)
          .json({ message: "No loan history found for this user" });
        return;
      }

     res.render("user/history", { loans:history });
    } catch (error) {
      console.error("Error retrieving loan history:", error);
      res
        .status(500)
        .json({ error: "An error occurred while fetching loan history" });
    }
  },
  async borrowBook(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.session as any).user?.id;
      const { bookId } = req.body;

      if (!userId) {
        res
          .status(400)
          .json({ error: "User not logged in or session expired" });
        return;
      }

      if (!bookId) {
        res.status(400).json({ error: "Book ID is required" });
        return;
      }

      // Check if the book exists and is available
      const book = await BookModel.findBookById(parseInt(bookId));
      if (!book) {
        res.status(404).json({ error: "Book not found" });
        return;
      }

      if (!book.available) {
        res.status(400).json({ error: "Book is currently unavailable" });
        return;
      }

      // Create a new loan entry
      const loanCreated = await LoanModel.addLoan(userId, parseInt(bookId));
      console.log("Loan creation result:", loanCreated);

      if (!loanCreated) {
        res.status(500).json({ error: "Failed to create loan" });
        return;
      }

      // Update the book's availability status
      const availabilityUpdated = await BookModel.updateBookAvailability(
        parseInt(bookId),
        false
      );
      console.log("Book availability update result:", availabilityUpdated);

      if (!availabilityUpdated) {
        res.status(500).json({ error: "Failed to update book availability" });
        return;
      }

      // Redirect to the user's history page if successful
      res.redirect("/user/history");
    } catch (error) {
      console.error("Error borrowing book:", error);
      res
        .status(500)
        .json({ error: "An error occurred while borrowing the book" });
    }
  },
};

export default UserController;
