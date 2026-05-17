import "reflect-metadata";
import { User } from "../entity/User";
import { Blog } from "../entity/Blog";
import { Otp } from "../entity/Otp";
import dotenv from "dotenv";
const env = process.env.NODE_ENV || "local";
console.log(env);
dotenv.config({
  path: `.env.${env}`,
});
import { DataSource } from "typeorm";

console.log(process.env.DB_PASSWORD);

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  //    for local
  //   host: "localhost",
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  //    fro local
  //   database: "local_blog_db",
  database: process.env.DB_DATABASE,
  synchronize: true,
  logging: false,

  entities: [User, Blog, Otp],
  //   migrations: ["src/migration/*.ts"],
  migrations: [__dirname + "/../migration/*.ts"],
});
