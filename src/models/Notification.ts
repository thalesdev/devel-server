import { Column, Entity, ObjectIdColumn, ObjectID } from "typeorm";
import { ObjectId } from "mongodb";

@Entity()
export class Notification {

  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  createAt: Date;

  @Column({ nullable: true })
  readAt: Date | null;

  @Column()
  content: any;

  @Column({ nullable: true })
  userId: ObjectId | null;

}
