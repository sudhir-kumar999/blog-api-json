import "reflect-metadata";
import { User } from "../entity/User";
import { Blog } from "../entity/Blog";
import { Otp } from "../entity/Otp";
import dotenv from "dotenv";
dotenv.config()
import { DataSource } from "typeorm";

  console.log(process.env.DB_PASSWORD)

export const AppDataSource = new DataSource({
  type: "postgres",
//   host: "127.0.0.1",
//   port: 5432,
//   username: "postgres",
//   password: "844502",
//   database: "local_blog_db",
  // host: process.env.DB_HOST,
  // port: Number(process.env.DB_PORT),
  // username: process.env.DB_USERNAME,
  // password: process.env.DB_PASSWORD,
  // database: process.env.DB_DATABASE,
  url:process.env.DATABASE_URL,
  synchronize: true,
  logging: false,
  ssl:{
    rejectUnauthorized:false,
  },

  entities: [User, Blog,Otp],
//   migrations: ["src/migration/*.ts"],
  migrations:[__dirname + "/../migration/*.ts"]

});
