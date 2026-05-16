import express from "express";
import { deleteData, getData, loginController, postData, updateData, verifyOtp } from "../controller/register";
import { limiter } from "../middleware/rateMiddleware";
import { checkLogin } from "../middleware/loginMiddleware";
import { twoFactor } from "../middleware/twoFactor";
const router=express.Router();

router.get("/getData",checkLogin,getData);
router.post("/signin",limiter,postData);
router.post("/login",limiter,loginController);
router.post("/verify",limiter,verifyOtp);
router.patch("/updateData",checkLogin,twoFactor,updateData);
router.delete("/deleteData",checkLogin,twoFactor,deleteData);

export default router;