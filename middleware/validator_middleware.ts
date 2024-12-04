import { body } from "express-validator";
import BookModel from "../models/book_model";

export const addBookValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required.")
    .isLength({ max: 255 })
    .withMessage("Title cannot exceed 255 characters."),

  body("author")
    .trim()
    .notEmpty()
    .withMessage("Author is required.")
    .isLength({ max: 255 })
    .withMessage("Author cannot exceed 255 characters."),

  body("isbn")
    .trim()
    .notEmpty()
    .withMessage("ISBN is required.")
    .isLength({ min: 13, max: 13 })
    .withMessage("ISBN must be 13 digits.")
    .isNumeric()
    .withMessage("ISBN must be a numeric value.")
    .custom(async (isbn) => {
      // Check if ISBN already exists in the database
      const existingBook = await BookModel.findBookByISBN(isbn);
      if (existingBook) {
        throw new Error("ISBN already exists.");
      }
      return true;
    }),
];
export const editBookValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required.")
    .isLength({ max: 255 })
    .withMessage("Title cannot exceed 255 characters."),

  body("author")
    .trim()
    .notEmpty()
    .withMessage("Author is required.")
    .isLength({ max: 255 })
    .withMessage("Author cannot exceed 255 characters."),

  body("isbn")
    .trim()
    .notEmpty()
    .withMessage("ISBN is required.")
    .isLength({ min: 13, max: 13 })
    .withMessage("ISBN must be 13 digits.")
    .isNumeric()
    .withMessage("ISBN must be a numeric value.")

];

export const signUpValidator=[
  // Validate name: it must not be empty and should be at least 3 characters long
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters long"),

  // Validate email: it must be a valid email
  body("email").isEmail().withMessage("Enter a valid email address"),

  // Validate password: it must be at least 6 characters
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];
