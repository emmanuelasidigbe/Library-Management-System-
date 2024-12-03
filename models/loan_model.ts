import sql from "../config/db";
import { Loan } from "../types";

const LoanModel = {
  async addLoan(userId: number, bookId: number): Promise<boolean> {
    try {
      const result = await sql`
      INSERT INTO loans (user_id, book_id)
      VALUES (${userId}, ${bookId})
      RETURNING id;
    `;

      // Check if the loan was successfully created
      return result.length > 0;
    } catch (error) {
      console.error("Error creating loan:", error);
      return false;
    }
  },

  async getUserLoans(userId: number): Promise<Loan[]> {
    const result = await sql<Loan[]>`
      SELECT 
        loans.id,
        loans.user_id,
        books.title,
        books.author,
        loans.loan_date
      FROM loans
      JOIN books ON loans.book_id = books.id
      WHERE loans.user_id = ${userId}
      ORDER BY loans.loan_date DESC;
    `;
    return result;
  },

  async getAllLoanTransactions(): Promise<Loan[]> {
    return sql<Loan[]>`
    SELECT 
      l.id AS id,
      u.id AS user_id,
      u.name AS user_name,
      b.title AS title,
      b.author AS author,
      l.loan_date AS loan_date,
      l.return_date AS return_date
    FROM 
      loans l
    INNER JOIN 
      users u ON l.user_id = u.id
    INNER JOIN 
      books b ON l.book_id = b.id
    ORDER BY 
      l.loan_date DESC;
  `;
  },
  async returnLoanTransaction(loanId: number): Promise<void> {
    await sql.begin(async (trx) => {
      // 1. Update the loan's return_date to the current date
      await trx`
      UPDATE loans
      SET return_date = CURRENT_DATE
      WHERE id = ${loanId}
    `;

      // 2. Set the book's availability to true
      await trx`
      UPDATE books
      SET available = TRUE
      WHERE id = (
        SELECT book_id FROM loans WHERE id = ${loanId}
      )
    `;
    });
  },
};

export default LoanModel;
