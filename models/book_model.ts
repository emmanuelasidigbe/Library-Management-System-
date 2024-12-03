import sql from "../config/db";
import { Book } from "../types";



const BookModel = {
  async addBook(book: Book): Promise<Book[]> {
    return sql`
      INSERT INTO books (title, author, isbn, available)
      VALUES (${book.title}, ${book.author}, ${book.isbn}, ${
      book.available ?? true
    })
      RETURNING *;
    `;
  },

  async editBook(id: number, book: Partial<Book>): Promise<Book[]> {
    const query = sql`
      UPDATE books
      SET
        ${book.title !== undefined ? sql`title = ${book.title},` : sql``}
        ${book.author !== undefined ? sql`author = ${book.author},` : sql``}
        ${book.isbn !== undefined ? sql`isbn = ${book.isbn},` : sql``}
        ${
          book.available !== undefined
            ? sql`available = ${book.available}`
            : sql``
        }
      WHERE id = ${id}
      RETURNING *;
    `;

    // Ensure the query does not end with a dangling comma
    const sanitizedQuery = query.toString().replace(/, WHERE/, " WHERE");
    return sql.unsafe<Book[]>(sanitizedQuery);
  },

  async removeBook(id: number): Promise<boolean> {
    // Perform the delete operation and check if any row was affected
    const result = await sql`
    DELETE FROM books WHERE id = ${id}
  `;

    // If result.count is greater than 0, it means a row was deleted
    return result.count > 0;
  },
  async searchBooks(query: string): Promise<Book[]> {
    const sanitizedQuery = `%${query.toLowerCase()}%`; // Convert to lowercase and apply wildcards for partial match
    const result = await sql<Book[]>`
      SELECT * FROM books 
      WHERE LOWER(title) ILIKE LOWER(${sanitizedQuery}) 
      OR LOWER(author) ILIKE LOWER(${sanitizedQuery})
    `;
    return result; // Return matching books
  },

  async getAllBooks(): Promise<Book[]> {
    return sql`SELECT * FROM books`;
  },
  async findBookByISBN(isbn: string): Promise<Book | null> {
    const result = await sql<
      Book[]
    >`SELECT * FROM books WHERE isbn = ${isbn} LIMIT 1`;
    return result.length > 0 ? result[0] : null;
  },
  async findBookById(bookId: number): Promise<any | null> {
    const result = await sql`SELECT * FROM books WHERE id = ${bookId} LIMIT 1`;
    return result.length > 0 ? result[0] : null;
  },
  async updateBookAvailability(
    bookId: number,
    available: boolean
  ): Promise<boolean> {
    try {
      const result = await sql`
      UPDATE books
      SET available = ${available}
      WHERE id = ${bookId}
      RETURNING id;
    `;

      // Check if the book's availability was successfully updated
      return result.length > 0;
    } catch (error) {
      console.error("Error updating book availability:", error);
      return false;
    }
  },
};

export default BookModel;
