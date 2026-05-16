import express from "express";
import type { Request, Response } from "express";

import cookieParser from "cookie-parser";

import router from "./src/router/router";
import postRoutes from "./src/router/postRoute";

import { AppDataSource } from "./src/config/data-source";
import dotenv from "dotenv";
dotenv.config()
const app = express();

app.use(express.json({ limit: "100kb" }));

app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("hello world");
});

app.use("/user", router);

app.use("/blog", postRoutes);

AppDataSource.initialize()
  .then(() => {
    console.log("Database Connected");

    app.listen(3005, () => {
      console.log("server is running on port 3005");
    });
  })
  .catch((err) => {
    console.log("DB ERROR");
    console.log(err);
  });

export default app;
