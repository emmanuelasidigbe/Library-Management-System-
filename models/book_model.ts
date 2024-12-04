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
  const fields = [];
  const values = [];

  if (book.title !== undefined) {
    fields.push("title = $1");
    values.push(book.title);
  }
  if (book.author !== undefined) {
    fields.push("author = $2");
    values.push(book.author);
  }
  if (book.isbn !== undefined) {
    fields.push("isbn = $3");
    values.push(book.isbn);
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  const query = `
    UPDATE books
    SET ${fields.join(", ")}
    WHERE id = $4
    RETURNING *;
  `;

  try {
    // Use type assertion to tell TypeScript that the result matches the Book type
    const updatedBook = (await sql.unsafe(query, [...values, id])) as Book[];

    return updatedBook;
  } catch (error) {
    console.error("Error updating book:", error);
    throw error;
  }
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
