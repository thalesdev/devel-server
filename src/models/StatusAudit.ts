import { Column, CreateDateColumn } from "typeorm";
import { v4 as uuid } from 'uuid'

import { AssetStatus } from './Asset'

export class StatusAudit {

  @Column()
  id: string;

  @Column()
  value: AssetStatus;

  @CreateDateColumn()
  createdAt: Date;


  constructor(value: AssetStatus, id?: string, date?: Date) {
    this.value = value;
    this.id = id || uuid();
    this.createdAt = date || new Date();
  }

}
