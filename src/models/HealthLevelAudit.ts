import { Column, CreateDateColumn } from "typeorm";
import { v4 as uuid } from 'uuid'


export class HealthLevelAudit {

  @Column()
  id: string;

  @Column()
  value: number;

  @CreateDateColumn()
  createdAt: Date;


  constructor(value: number, id?: string, date?: Date) {
    this.value = value;
    this.id = id || uuid();
    this.createdAt = date || new Date();
  }

}
