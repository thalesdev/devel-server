import { Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { v4 as uuid } from 'uuid'

import { Asset } from "./Asset";

export class Unit {

  @Column()
  id: string;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column(type => Asset)
  assets: Asset[];

  constructor(name: string, assets?: Asset[]) {
    this.name = name;
    this.assets = assets || [];
    this.id = uuid();
  }

}
