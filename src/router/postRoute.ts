import express from "express";
import { addPost, deletePost, editPost, getPost, getPostByUser } from "../controller/postController";
import { limiter } from "../middleware/rateMiddleware";
import { checkLogin } from "../middleware/loginMiddleware";
import { twoFactor } from "../middleware/twoFactor";
const postRoutes=express.Router();

postRoutes.get("/allData",getPost);
postRoutes.post("/post",limiter,checkLogin,twoFactor,addPost);
postRoutes.patch("/update",checkLogin,editPost);
postRoutes.delete("/delete",checkLogin,deletePost);
postRoutes.get("/user-wise", checkLogin ,getPostByUser);

export default postRoutes;