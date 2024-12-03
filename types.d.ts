import session from "express-session";

declare module "express-session" {
  interface SessionData {
    user: {
      id: number;
      name: string;
      email: string;
      role: "librarian" | "user";
    };
  }
}

interface Loan {
  id?: number;
  user_id: number;
  book_id: number;
  loan_date?: string;
  return_date?: string | null;
}
interface Book {
  id?: number;
  title: string;
  author: string;
  isbn: string;
  available?: boolean;
}