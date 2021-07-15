import { ObjectId } from "mongodb";
import { BeforeRemove, Column, CreateDateColumn, Entity, ObjectIdColumn, UpdateDateColumn, ObjectID } from "typeorm";
import { AwsBucket, S3 } from "../configs/s3";
import { ServiceError } from "../util/ServiceError";

@Entity()
export class File {

  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  key: string;

  @Column()
  location: string;

  @Column()
  mimetype: string;

  @Column()
  contentType: string;

  @Column()
  originalname: string;

  @Column()
  size: number;

  @Column({ nullable: false })
  userId: ObjectId;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


  @BeforeRemove()
  async handleRemoveFromCloud() {
    try {
      await S3.deleteObject({
        Bucket: AwsBucket,
        Key: this.key,
      }).promise();
    } catch (err) {
      throw new ServiceError({
        message: `Error on remove file from Amazon S3: ${err}`,
      });
    }
  }
}
