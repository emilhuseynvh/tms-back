import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TaskEntity } from "./task.entity";

@Entity('task_status')
export class TaskStatusEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ unique: true })
	name: string

	@Column({ default: '#3B82F6' })
	color: string

	@Column({ default: 'circle' })
	icon: string

	@OneToMany(() => TaskEntity, (task) => task.status)
	tasks: TaskEntity[]

	@CreateDateColumn()
	createdAt: Date

	@UpdateDateColumn()
	updatedAt: Date
}
