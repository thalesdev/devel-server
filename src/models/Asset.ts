import { ObjectId } from "mongodb";
import { Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { v4 as uuid } from 'uuid'

import { HealthLevelAudit } from './HealthLevelAudit'
import { StatusAudit } from './StatusAudit'

export type AssetStatus = "Running" | "Alerting" | "Stopped"

export class Asset {

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string | undefined;

  @Column()
  model: string;

  @Column()
  id: string;

  @Column()
  status: AssetStatus;

  @Column(type => HealthLevelAudit)
  healthLevelAudits: HealthLevelAudit[];

  @Column()
  fileId: ObjectId;

  @Column()
  healthLevel: number;

  @Column(type => StatusAudit)
  statusAudits: StatusAudit[];



  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


  constructor(
    name: string,
    description: string | undefined,
    model: string,
    status: AssetStatus,
    healthLevel: number,
    fileId: ObjectId,
    id?: string
  ) {

    this.name = name;
    this.description = description;
    this.model = model;
    this.status = status;
    this.healthLevel = healthLevel;
    this.fileId = fileId;
    this.id = id || uuid();
  }

}
