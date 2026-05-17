import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

import { User } from "./User";

@Entity("blogs")
export class Blog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column()
  meta_tag!: string;

  @Column("text")
  content!: string;

  @Column()
  category!: string;

  @Column("text", {
    array: true,
  })
  tags!: string[];

  @Column({
    default: "pending",
  })
  status!: string;

  @Column({
    unique: true,
  })
  post_id!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
  
    @ManyToOne(() => User, (user) => user.blogs, {
        onDelete:"CASCADE"
    })
  @JoinColumn({
    name: "author_id",
  })
  author!: User;
}