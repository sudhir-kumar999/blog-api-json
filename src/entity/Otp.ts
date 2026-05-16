import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";

import { User } from "./User";

@Entity("otps")
export class Otp {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  otp!: string;

  @Column({
    default: 0,
  })
  attempt!: number;

  @Column({
    default: false,
  })
  isVerified!: boolean;

  @Column({type: "timestamp",})
  expiredAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.otps)
  @JoinColumn({
    name: "user_id",
  })
  user!: User;
}