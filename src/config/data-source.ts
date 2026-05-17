import "reflect-metadata";
import { User } from "../entity/User";
import { Blog } from "../entity/Blog";
import { Otp } from "../entity/Otp";
import dotenv from "dotenv";
const env=process.env.NODE_ENV || "local"
console.log(env)
dotenv.config({
    path:`.env.${env}`
})
import { DataSource } from "typeorm";

  console.log(process.env.DB_PASSWORD)

export const AppDataSource = new DataSource({
  type: "postgres",
//   host: "127.0.0.1",
//   port: 5432,
//   username: "postgres",
//   password: "844502",
//   database: "local_blog_db",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: false,

  entities: [User, Blog,Otp],
//   migrations: ["src/migration/*.ts"],
  migrations:[__dirname + "/../migration/*.ts"]

});
