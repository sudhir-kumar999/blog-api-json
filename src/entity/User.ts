import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from "typeorm";

import { Blog } from "./Blog";
import { Otp } from "./Otp";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column()
  age!: number;

  @Column({
    unique: true,
  })
  email!: string;

  @Column()
  password!: string;

  @Column()
  place!: string;

  @Column()
  city!: string;
  
  @Column({ default: false })
  otpVerified!: boolean;

  @OneToMany(() => Blog, (blog) => blog.author)
  blogs!: Blog[];

  @OneToMany(() => Otp, (otp) => otp.user)
otps!: Otp[];
}