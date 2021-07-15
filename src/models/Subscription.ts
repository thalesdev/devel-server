import { ObjectID } from "mongodb";
import { Column, Entity, ObjectIdColumn } from "typeorm";

@Entity()
export class Subscription {

	@ObjectIdColumn()
	id: ObjectID;

	@Column()
	tier: number;

	@Column()
	status: string;

}