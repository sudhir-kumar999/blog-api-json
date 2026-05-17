import type { Request, Response, NextFunction } from "express";
import { User } from "../entity/User";
import { AppDataSource } from "../config/data-source";

interface RequestWithUserRole extends Request {
  user?: decode;
}
const userRepo = AppDataSource.getRepository(User);

interface decode {
  name: string;
  email: string;
  id: string;
  iat: number;
  exp: number;
}
// interface reqData {
//   id: string;
//   name: string;
//   age: number;
//   email: string;
//   password: string;
//   place: string;
//   city: string;
//   otp?:string;
//   otpVerified:boolean;
// }

export const twoFactor = async (
  req: RequestWithUserRole,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tokenId: decode | undefined = req.user;
    const userId: string = String(tokenId?.id);

    const user = await userRepo.findOne({
      where: {
        id: userId,
      },
    });
    // console.log(user);

    if (!user) {
      return res.json({
        success: false,
        message: "no user found login again",
      });
    }
    if (user.otpVerified != true) {
      return res.json({
        success: false,
        message: "otp is not verified",
      });
    }
    next();
  } catch (error) {
    // fs.readFile("data.json","utf-8",(err,data)=>{
    //   if(!err && data){
    //     const checkVerify:reqData[]=JSON.parse(data);
    //     const filetrData:reqData | undefined=checkVerify.find((ele)=>ele.id==userId);
    //     if(filetrData?.otpVerified==false){
    //       return res.status(403).json({
    //         success:false,
    //         message:"otp is not verified, otp verify first"
    //       });
    //     }
    //     next();
    //   }
    // });
    // }
    return res.status(401).json({
      success: false,
      message: "two factor not verified. verify the otp first",
      Error: error,
    });
  }
};
