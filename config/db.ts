import postgres from "postgres";

const sql = postgres({
  host: "localhost",
  port: 5432,
  database: "book_store",
  username: "myuser",
  password: "mypassword",
});

async function migration() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(10) CHECK (role IN ('librarian', 'user')) NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        isbn VARCHAR(13) UNIQUE NOT NULL,
        available BOOLEAN DEFAULT TRUE
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS loans (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        book_id INT REFERENCES books(id) ON DELETE CASCADE,
        loan_date DATE DEFAULT CURRENT_DATE,
        return_date DATE
      );
    `;

    console.log("Tables created successfully!");
  } catch (error) {
    console.error("Error creating tables:", error);
  } finally {
    // Close the database connection after the migration
    await sql.end();
  }
}

export { migration,sql as default};