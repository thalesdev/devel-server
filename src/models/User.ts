import { hash } from 'bcrypt'
import { ObjectId } from 'mongodb';
import { Entity, ObjectID, ObjectIdColumn, Column, BeforeUpdate, BeforeInsert, CreateDateColumn, UpdateDateColumn } from "typeorm";

import auth from "../configs/auth";
import { RefreshToken } from './RefreshToken';

@Entity()
export class User {

  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  fullname: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  subscriptionId: ObjectId;

  @Column({ nullable: true })
  companyId: ObjectId | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column(type => RefreshToken)
  refreshTokens: RefreshToken[]


  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && this.password.length <= 16) {
      this.password = await hash(this.password, auth.crypt.rounds);
    }
  }

}
