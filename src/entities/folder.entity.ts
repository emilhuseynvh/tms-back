import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./user.entity";
import { TaskListEntity } from "./tasklist.entity";

@Entity('folder')
export class FolderEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	name: string

	@Column({ nullable: true })
	description: string

	@Column()
	ownerId: number

	@ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
	owner: UserEntity

	@OneToMany(() => TaskListEntity, (list) => list.folder)
	taskLists: TaskListEntity[]

	@CreateDateColumn()
	createdAt: Date

	@UpdateDateColumn()
	updatedAt: Date
}

