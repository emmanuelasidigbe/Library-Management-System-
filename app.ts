import express, { Application } from "express";
import homeRoute from "./routes/index";
import   userRoute from "./routes/user_route";
import librarianRoute from "./routes/librarian_routes";
import session from "express-session";
import morgan from "morgan";
import { migration } from "./config/db";
import helmet from "helmet";
import { errorHandler } from "./middleware/error_middleware";
import expressLayout from "express-ejs-layouts"



const app: Application = express();

app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
    maxAge: 24 * 60 * 60 * 1000     
    }
}))

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(morgan("dev"));
app.use(helmet()); 
app.use(expressLayout);
app.set('layout','layout')
app.set("views", "views");
app.set("view engine", "ejs");


const PORT = 3000;


app.use('/',homeRoute)
app.use('/user',userRoute)
app.use("/librarian",librarianRoute);// app.use(errorHandler);
(async () => {
  // Run database migration
  // await migration();

  // Start the server after migration completes
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
})()




