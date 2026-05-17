/* eslint-disable prefer-const */
import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { Blog } from "../entity/Blog";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";

// interface reqData {
//   id: string;
//   name: string;
//   age: number;
//   email: string;
//   password: string;
//   place: string;
//   city: string;
//   otp?: string;
//   otpVerified: boolean;
// }
interface blogType {
  post_id: string;
  title: string;
  content: string;
  Meta_tag: string;
  author: User;
  category: string;
  tags: string[];
  status: string;
}

interface updateBlog {
  post_id?: string;
  title?: string;
  content?: string;
  meta_tag?: string;
  author_id?: string;
  category?: string;
  tags?: string[];
  status?: string;
}

interface decode {
  name?: string;
  email?: string;
  id?: string;
  iat?: number;
  exp?: number;
}

const blogRepo = AppDataSource.getRepository(Blog);
const userRepo = AppDataSource.getRepository(User);

const stringrgx = /^[A-Za-z ]+$/;
const contentrgx = /^[A-Za-z0-9 ]+$/;
interface RequestWithUserRole extends Request {
  user?: decode;
}

export const getPost = async (req: Request, res: Response) => {
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
        message: "invalid pagination values",
      });
    }
    const offset: number = limit * skip;
    const last: number = skip * limit + limit;
    let data = await blogRepo.find();
    console.log(data);
    if (data.length == 0) {
      return res.status(404).json({
        success: false,
        message: "No data found in DB",
      });
    }
    let sendData = data.slice(offset, last);
    return res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      data: sendData,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error occurred at Get all post API",
      });
    }
  }
};

export const addPost = async (req: RequestWithUserRole, res: Response) => {
  try {
    console.log("run post ")
    const bodyData: blogType = req.body;
    let { title, meta_tag, content, category, tags, status } = req.body;
    const tokenId: decode | undefined = req.user;
    const userId = tokenId?.id;
    if (!userId) {
      return res.status(404).json({
        success: false,
        message: "No user id found inside token",
      });
    }
    if (
      title == undefined &&
      meta_tag == undefined &&
      content == undefined &&
      category == undefined &&
      tags == undefined &&
      status == undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "every field is required to post blog",
      });
    }
    status = status?.trim();
    if (status !== "pending" && status !== "published") {
      return res.status(400).json({
        success: false,
        message: "status can only be pending or published",
      });
    }

    title = title?.trim();
    meta_tag = meta_tag?.trim();
    content = content?.trim();
    category = category?.trim();

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "title is required",
      });
    }

    if (!meta_tag) {
      return res.status(400).json({
        success: false,
        message: "meta_tag is required",
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "content is required",
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "category is required",
      });
    }

    if (!stringrgx.test(title)) {
      return res.status(401).json({
        success: false,
        message: "title must be string",
      });
    }

    if (typeof content != "string") {
      return res.status(401).json({
        success: false,
        message: "content must be string or number",
      });
    }
    if (typeof meta_tag != "string") {
      return res.status(401).json({
        success: false,
        message: "meta_tage must be string",
      });
    }

    if (!contentrgx.test(meta_tag)) {
      return res.status(401).json({
        success: false,
        message: "title must be string",
      });
    }

    if (!stringrgx.test(category)) {
      return res.status(401).json({
        success: false,
        message: "category must be string",
      });
    }
    if (!Array.isArray(tags)) {
      return res.status(401).json({
        success: false,
        message: "tags can only be an array",
      });
    }
    if (tags.length === 0) {
      return res.status(401).json({
        success: false,
        message: "category must contains some element inside array",
      });
    }
    const id: string = uuidv4();
    bodyData.post_id = id;
    console.log(bodyData);

    let user = await userRepo.findOne({
      where: {
        id: userId,
      },
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "no user found with your id create an id",
      });
    }
    console.log(user);
    bodyData.author = user;
    let result = await blogRepo.create(bodyData);
    if (!result) {
      return res.status(400).json({
        success: false,
        message: "data is not saved",
      });
    }
    console.log("result",result)
    await blogRepo.save(result);
    return res.status(201).json({
      success: false,
      message: "Blog post created successfully",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        message: error.message || " Error occurred at post creation",
      });
    }
  }
};

export const editPost = async (req: RequestWithUserRole, res: Response) => {
  try {
    const tokenId: decode | undefined = req.user;
    const author_id: string = String(tokenId?.id);
    const blog_id: string = String(req.query.blog_id);
    const bodyData: updateBlog = req.body;
    let { title, meta_tag, content, category, tags, status } = req.body;
    if (
      title === undefined &&
      meta_tag === undefined &&
      content === undefined &&
      category === undefined &&
      tags === undefined &&
      status === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    // title = title?.trim();
    // meta_tag = meta_tag?.trim();
    // content = content?.trim();
    // category = category?.trim();

    if (bodyData.post_id != undefined || bodyData.author_id != undefined) {
      return res.status(400).json({
        success: false,
        message: "you cannot update author id and post id",
      });
    }
    if (blog_id == "undefined") {
      return res.status(400).json({
        success: false,
        message: "please provide blog_id ",
      });
    }

    interface blog2 {
      title?: string;
      meta_tag?: string;
      content?: string;
      category?: string;
      tags?: string[];
      status?: string;
    }
    let updateData: blog2 = {};
    if (status != undefined) {
      if (status !== "pending" && status !== "published") {
        return res.status(400).json({
          success: false,
          message: "status can only be pending or published",
        });
      }
    }

    if (title != undefined) {
      if (typeof title !== "string") {
        return res.status(401).json({
          success: false,
          message: "title must be string",
        });
      }
      title = title?.trim();
      updateData.title = title;
      if (title.length == 0) {
        return res.status(400).json({
          success: false,
          message: "title is required cannot empty",
        });
      }
    }

    if (content != undefined) {
      if (typeof content != "string") {
        return res.status(401).json({
          success: false,
          message: "content must be string ",
        });
      }
      content = content?.trim();
      updateData.content = content;
      if (content.length == 0) {
        return res.status(400).json({
          success: false,
          message: "content is required",
        });
      }
    }

    if (meta_tag != undefined) {
      if (typeof meta_tag !== "string") {
        return res.status(401).json({
          success: false,
          message: "title must be string",
        });
      }
      meta_tag = meta_tag?.trim();
      updateData.meta_tag = meta_tag;
      if (meta_tag.length == 0) {
        return res.status(400).json({
          success: false,
          message: "meta_tag is required",
        });
      }
    }

    if (category != undefined) {
      if (!stringrgx.test(category)) {
        return res.status(401).json({
          success: false,
          message: "category must be string",
        });
      }
      category = category?.trim();
      updateData.category = category;
      if (!category) {
        return res.status(400).json({
          success: false,
          message: "category is required",
        });
      }
    }

    if (tags != undefined) {
      if (!Array.isArray(tags)) {
        return res.status(401).json({
          success: false,
          message: "tags can only be an array",
        });
      }
      updateData.tags = tags;
      if (tags.length === 0) {
        return res.status(401).json({
          success: false,
          message: "category must contains some element inside array",
        });
      }
    }

    let user = await userRepo.findOne({
      where: {
        id: author_id,
      },
    });
    // console.log(user)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "no user found with your id create an id",
      });
    }

    let post = await blogRepo.findOne({
      where: {
        id: blog_id,
      },
    });
    // console.log(post)
    if (!post) {
      return res.status(401).json({
        success: false,
        message: "no blod found with your id create an blog",
      });
    }
    // console.log(updateData)
    let newUpdate = { ...post, ...updateData };
    let result = await blogRepo.create(newUpdate);
    await blogRepo.save(result);

    return res.status(200).json({
      success: true,
      message: "blog post updated successsfully",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error occurred at Get all post API",
      });
    }
  }
};

export const deletePost = async (req: RequestWithUserRole, res: Response) => {
  try {
    const tokenId: decode | undefined = req.user;
    const author_id: string | undefined = tokenId?.id;
    const blog_id = req.query.blog_id;
    if (!blog_id || typeof blog_id !== "string") {
      return res.status(400).json({
        success: false,
        message: "blog_id is required",
      });
    }
    let user = await userRepo.findOne({
      where: {
        id: author_id,
      },
    });
    // console.log(user);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "no user found login first",
      });
    }

    const blog=await blogRepo.findOne({
      where:{
        id:blog_id
      }
    })

    console.log(blog)
    if(!blog){
      return res.status(400).json({
        success:false,
        message:"no blog found with given  blog id"
      })
    }
    await blogRepo.delete(blog_id)
    return res.status(200).json({
      success: true,
      message: "blog deleted successfully",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error occurred at Get all post API",
      });
    }
  }
};

export const getPostByUser = async(req: RequestWithUserRole, res: Response) => {
  try {
    const tokenId: decode | undefined = req.user;
    const author_id: string = String(tokenId?.id);
    if (author_id == "undefined") {
      return res.status(400).json({
        success: false,
        message: "please provide author id",
      });
    }
    let user = await userRepo.findOne({
      where: {
        id: author_id,
      },
    });
    // console.log(user);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "no user found login first",
      });
    }
    const posts=await blogRepo.findOne({
      where:{
        author:{
        id:user.id
        }
      }
    })
    console.log(posts)
    if(!posts){
      return res.status(404).json({
        success:false,
        message:"no blog post found"
      })
    }
    return res.status(200).json({
      success:true,
      message:"blog posts found",
      data:posts
    })
      } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error occurred at Get all post API",
      });
    }
  }
};
