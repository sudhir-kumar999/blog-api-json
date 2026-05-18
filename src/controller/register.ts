/* eslint-disable prefer-const */
import { type Request, type Response } from "express";
import fs from "fs";
import bcrypt from "bcrypt";
// import { v4 as uuidv4 } from "uuid";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken";
import dotenv from "dotenv";
dotenv.config();
import { sendMail } from "../utils/emailSend";
import { generateOtp } from "../utils/otp";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import { Otp } from "../entity/Otp";
// import { Blog } from "../entity/Blog";
const userRepo = AppDataSource.getRepository(User);
const otpRepo = AppDataSource.getRepository(Otp);
// const blogRepo = AppDataSource.getRepository(Blog);

// import { Webhook } from "discord-webhook-node";
// const hook = new Webhook(process.env.DISCORD_WEBHOOK);

interface reqData {
  id: string;
  name: string;
  age: number;
  email: string;
  password: string;
  place: string;
  city: string;
  otp?: string;
  otpVerified: boolean;
}
interface decode {
  name: string;
  email: string;
  id: string;
  iat: number;
  exp: number;
}
interface RequestWithUserRole extends Request {
  user?: decode;
}

interface body {
  email: string;
  otp: string;
}

const stringRegex = /^[A-Za-z ]+$/;
const passRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// interface otp {
//   email: string;
//   otp: string;
//   attempt: number;
//   isVerified: boolean;
//   createdAt: number;
//   expiredAt: number;
// }

interface valid {
  email: string;
  password: string;
}

export const getData = (req: Request, res: Response) => {
  try {
    const limit: number = Number(req.query.limit);
    const skip: number = Number(req.query.skip);
    if (isNaN(limit) || isNaN(skip)) {
      return res.status(400).json({
        success: false,
        message: "limit and skip must be numbers",
      });
    }

    if (limit <= 0 || skip < 0) {
      return res.status(400).json({
        success: false,
        message: "invalid limit and skip value",
      });
    }
    const offset: number = limit * skip;
    const last: number = skip * limit + limit;
    fs.readFile("data.json", "utf-8", (err, data: string) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message || "error occurred at writing file",
        });
      }
      if (data) {
        const parsed = JSON.parse(data);
        const sendData: reqData[] = parsed.slice(offset, last);
        return res.json({
          success: true,
          message: "data fetched of all user",
          data: sendData,
        });
      }
      return res.status(404).json({
        success: false,
        message: "no user found in database or json file",
      });
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message || "internal server error",
      });
    }
  }
};

export const postData = async (req: RequestWithUserRole, res: Response) => {
  try {
    // const remaining = res.getHeader("RateLimit-Remaining");
    const bodyData: reqData = req.body;
    let { name, age, email, password, place, city }: reqData = req.body;

    if (
      name == undefined ||
      age == undefined ||
      email == undefined ||
      password == undefined ||
      place == undefined ||
      city == undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "ever field is required for register",
      });
    }
    // const now = new Date().toTimeString();

    if (!passRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "password contains at least one digit a uppercase letter a lowercase letter and special character and min length 8",
      });
    }

    if (!stringRegex.test(name)) {
      return res.status(400).json({
        success: false,
        message: "only letter are allowed in names",
      });
    }

    if (typeof age != "number") {
      return res.status(400).json({
        success: false,
        message: "only number are allowed in age",
      });
    }

    if (age <= 0 || age >= 150) {
      return res.status(400).json({
        success: false,
        message: "age can only  be between 1 and 150",
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "email is not valid enter valid email",
      });
    }
    if (!stringRegex.test(city)) {
      return res.status(400).json({
        success: false,
        message: "only letter are allowed in city",
      });
    }
    if (!stringRegex.test(place)) {
      return res.status(400).json({
        success: false,
        message: "only letter are allowed in place",
      });
    }

    name = name?.trim();
    city = city?.trim();
    place = place?.trim();
    email = email?.trim().toLowerCase();
    bodyData.email = email;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "name is required it acnnot be empty",
      });
    }

    if (!city) {
      return res.status(400).json({
        success: false,
        message: "city is not be required",
      });
    }

    if (!place) {
      return res.status(400).json({
        success: false,
        message: "place cannot be empty string",
      });
    }

    const strPassword = password.toString();
    const hashed = await bcrypt.hash(strPassword, 10);
    bodyData.password = hashed;

    let checkUser = await userRepo.findOne({
      where: {
        email,
      },
    });
    // console.log(checkUser)
    if (checkUser) {
      return res.status(409).json({
        success: false,
        message: "user already exists",
      });
    }
    let res2 = await userRepo.save(bodyData);
    console.log(res2);

    return res.status(201).json({
      success: false,
      message: "user created successfuly",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message || "internal server error",
      });
    }
  }
};

export const loginController = async (
  req: RequestWithUserRole,
  res: Response,
) => {
  try {
    let { email, password }: valid = req.body;
    if (email == undefined || password == undefined) {
      return res.status(401).json({
        success: false,
        message: "email and password is required for login",
      });
    }
    email = email.trim().toLowerCase();
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "email is not valid enter valid email",
      });
    }

    let userExist = await userRepo.findOne({
      where: {
        email,
      },
    });
    if (!userExist) {
      return res.json({
        success: false,
        message: "user not register sign up first",
      });
    }
    const verifyPass = await bcrypt.compare(password, userExist.password);
    if (!verifyPass) {
      return res.json({
        success: false,
        message: "wrong password entered",
      });
    }
    const otp = generateOtp();
    const template = `
    <h1>Your otp is ${otp}</h1>
    `;

    let optCheck = await otpRepo.findOne({
      where: {
        user: {
          id: userExist.id,
        },
      },
    });
    console.log("check otp", optCheck);

    if (optCheck) {
      const currentTime = new Date();
      const resendTime = new Date(optCheck.createdAt.getTime() + 1 * 60 * 1000);
      if (currentTime < resendTime) {
        return res.status(400).json({
          success: false,
          message: `send otp after 2 min`,
        });
      }
      await otpRepo.remove(optCheck);
    }
    const mailInfo = await sendMail(userExist.email, template);
    if (!mailInfo?.accepted[0]) {
      return res.status(502).json({
        success: false,
        message: "Failed when send Email",
      });
    }

    const otpData = {
      otp: String(otp),
      attempt: 0,
      isVerified: false,
      user: userExist,
      expiredAt: new Date(Date.now() + 20 * 60 * 1000),
    };
    const otpSave = await otpRepo.create(otpData);
    await otpRepo.save(otpSave);
    // console.log(otpSave)
    if (!otpSave) {
      return res.status(400).json({
        success: false,
        message: "otp sending failed",
      });
    }
    return res.status(200).json({
      success: true,
      message: "otp sent successfully",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message || "internal server error",
      });
    }
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    let { email, otp }: body = req.body;

    if (email == undefined) {
      return res.status(401).json({
        success: false,
        message: "email cannot be empty string",
      });
    }
    if (!otp) {
      return res.status(401).json({
        success: false,
        message: "otp cannot be empty string",
      });
    }
    email = email.trim().toLowerCase();
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "email is not valid enter valid email",
      });
    }

    if (typeof otp != "string") {
      return res.status(401).json({
        success: false,
        message: "otp must be string",
      });
    }
    if (otp.length != 6) {
      return res.status(401).json({
        success: false,
        message: "otp must be 6 digit long",
      });
    }
    otp = otp.trim();

    const user = await userRepo.findOne({
      where: {
        email,
      },
    });
    // console.log(user)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "no user found register first",
      });
    }

    let optCheck = await otpRepo.findOne({
      where: {
        user: {
          id: user.id,
        },
      },
    });
    // console.log("check otp",optCheck)
    if (!optCheck) {
      return res.status(401).json({
        success: false,
        message: "no otp found of provided user",
      });
    }
    let currTime = new Date();
    let expTime = new Date(optCheck.expiredAt.getTime());
    if (currTime > expTime) {
      return res.status(401).json({
        success: false,
        message: "otp is expired generate new otp",
      });
    }

    if (optCheck.attempt >= 3) {
      return res.status(401).json({
        success: false,
        message: "otp attempt exceed generate new otp",
      });
    }
    if (optCheck.otp != otp) {
      optCheck.attempt += 1;
      console.log(optCheck.attempt);
      await otpRepo.save(optCheck);
      return res.status(401).json({
        success: false,
        message: "Invalid OTP",
      });
    }
    user.otpVerified= true;
  await userRepo.save(user);

    await otpRepo.remove(optCheck);
    const payload = {
      name: user.name,
      email: user.email,
      id: user.id,
    };

    const accessToken = generateAccessToken(
      payload,
      process.env.ACCESS_KEY as string,
    );

    const refreshPayload = {
      id: user.id,
    };

    const refreshToken = generateRefreshToken(
      refreshPayload,
      process.env.REFRESH_KEY as string,
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
    });

    return res.status(200).json({
      success: true,
      message: "otp verified success",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        message: error.message || "internal server error",
      });
    }
  }
};

export const updateData = async (req: RequestWithUserRole, res: Response) => {
  try {
    let { name, age, email, password, place, city } = req.body;
    const tokenId: decode | undefined = req.user;
    const author_id: string | undefined = tokenId?.id;

    if (!author_id) {
      return res.status(401).json({
        success: false,
        message: "No author_id found login again",
      });
    }
    if (
      name == undefined &&
      age == undefined &&
      city == undefined &&
      place == undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "give at least one field to update",
      });
    }
    interface update {
      name?: string;
      age?: number;
      place?: string;
      city?: string;
    }
    let updateData: update = {};
    if (name !== undefined) {
      if (typeof city != "string") {
        return res.status(400).json({
          success: false,
          message: "only string are allowed in city",
        });
      }
      name = name?.trim();

      if (!stringRegex.test(name)) {
        return res.status(400).json({
          success: false,
          message: "only letter are allowed in name",
        });
      }
      updateData.name = name;
    }

    if (age !== undefined) {
      if (typeof age != "number") {
        return res.status(400).json({
          success: false,
          message: "only number are allowed in age",
        });
      }

      if (age <= 0 || age >= 150) {
        return res.status(400).json({
          success: false,
          message: "age can only  be between 1 and 150",
        });
      }
      updateData.age = age;
    }

    if (city !== undefined) {
      if (typeof city != "string") {
        return res.status(400).json({
          success: false,
          message: "only string are allowed in city",
        });
      }
      city = city?.trim();
      if (!stringRegex.test(city)) {
        return res.status(400).json({
          success: false,
          message: "only letter are allowed in city",
        });
      }
      updateData.city = city;
    }

    if (place !== undefined) {
      if (!stringRegex.test(place)) {
        return res.status(400).json({
          success: false,
          message: "only letter are allowed in place",
        });
      }
      place = place?.trim();
      updateData.place = place;
    }
    email = email?.trim().toLowerCase();
    if (email != undefined) {
      return res.status(422).json({
        success: true,
        message: "Email cannot be change",
      });
    }
    if (password != undefined) {
      return res.status(422).json({
        success: true,
        message: "password cannot be change",
      });
    }
    console.log(updateData);
    let user = await userRepo.findOne({
      where: {
        id: author_id,
      },
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "no user found from your token login first",
      });
    }

    let finalData = { ...user, ...updateData };
    console.log(finalData);

    let result = await userRepo.save(finalData);
    console.log(result);
    return res.status(201).json({
      success: true,
      message: "user data updated success",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message || "internal server error",
      });
    }
  }
};

export const deleteData = async (req: RequestWithUserRole, res: Response) => {
  try {
    const tokenId: decode | undefined = req.user;
    const author_id: string | undefined = tokenId?.id;
    if (!author_id || author_id == undefined) {
      return res.status(401).json({
        success: false,
        message: "no author id found",
      });
    }

    let user = await userRepo.findOne({
      where: {
        id: author_id,
      },
    });
    console.log(user);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "no user found from your token login first",
      });
    }
    await userRepo.delete(user.id);
    res.clearCookie("accessToken");

    res.clearCookie("refreshToken");
    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message || "internal server error",
      });
    }
  }
};
