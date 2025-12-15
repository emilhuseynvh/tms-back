import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TaskEntity } from "./task.entity";

@Entity('task_status')
export class TaskStatusEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ unique: true })
	name: string

	@OneToMany(() => TaskEntity, (task) => task.status)
	tasks: TaskEntity[]

	@CreateDateColumn()
	createdAt: Date

	@UpdateDateColumn()
	updatedAt: Date
}
