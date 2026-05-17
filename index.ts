import express from "express";
import type { Request, Response } from "express";

import cookieParser from "cookie-parser";

import router from "./src/router/router";
import postRoutes from "./src/router/postRoute";

import { AppDataSource } from "./src/config/data-source";
import dotenv from "dotenv";
const env=process.env.NODE_ENV || "local"
dotenv.config({
    path:`env.${env}`
})
const app = express();

app.use(express.json({ limit: "100kb" }));

app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("hello world");
});

app.use("/user", router);

app.use("/blog", postRoutes);
const PORT=process.env.PORT
AppDataSource.initialize()
  .then(() => {
    console.log("Database Connected");

    app.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("DB ERROR");
    console.log(err);
  });

export default app;
