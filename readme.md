# Library Management System

A simple library management system built using Express.js and following the MVC architecture.

## Features

### Librarian (Admin)

- Add, Edit, Remove Books
- View All Transactions
- Generate Reports

### Patron (User)

- Browse Book Catalog
- Borrow Books
- View Loan History
- Search Books

## Requirements

- Node.js (LTS version)
- PostgreSQL / docker postgres

## Setup Instructions

1. Clone this repository.

```bash
  git clone
  cd the repo
```

2. Install dependencies:
```bash
    npm i
```
3. Set up database

```bash
    install docker desktop
    run: docker run -d \
    --name my_book_store \
    -e POSTGRES_USER=myuser \
    -e POSTGRES_PASSWORD=mypassword \
    -e POSTGRES_DB=book_store \
    -v my_book_data:/var/lib/postgresql/data \
    -p 5432:5432 \
    postgres
```

4. Run migration

```bash
   npm run migration

```

5. Run project
```bash
   npm run dev
```

## Note

insert data into the db to be able to login as librarian
the password for the hashed value is 'chinhuahua'

```bash
INSERT INTO users (name, email, password, role) VALUES ('kokoro', 'kokoro@gmail.com', ' $2b$10$GUkw41RotM9TnQuYBmCB3uRYV5bz6u35N4.rECjYd0F7pk63nvINe', 'librarian');

```
