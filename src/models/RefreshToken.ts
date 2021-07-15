import { Column } from "typeorm";
import { v4 as uuid } from 'uuid'

export class RefreshToken {

  @Column()
  name: string;

  @Column()
  token: string;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  constructor(name: string, expiresAt: Date, token?: string) {
    this.name = name;
    this.expiresAt = expiresAt;
    this.token = token || uuid()
  }
}
