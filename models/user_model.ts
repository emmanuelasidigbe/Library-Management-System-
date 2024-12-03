import sql from "../config/db";
import { Request,Response } from "express";
import LoanModel from "./loan_model";

export const getUserByEmail = async (email: string) => {
  const data = await sql`SELECT * FROM users WHERE email = ${email}`;
  return data[0];
};

export const createUser = async (
  name: string,
  email: string,
  password: string
) => {
  const data = await sql`
    INSERT INTO users (name, email, password, role)
    VALUES (${name}, ${email}, ${password}, 'user')
    RETURNING *`;
  return data[0];
};


