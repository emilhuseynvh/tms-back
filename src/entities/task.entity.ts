import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TaskListEntity } from "./tasklist.entity";
import { UserEntity } from "./user.entity";
import { TaskStatus } from "../shared/enums/task.enum";


@Entity('task')
export class TaskEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	title: string

	@Column({ nullable: true, type: 'text' })
	description: string

	@Column({ type: 'timestamp', nullable: true })
	startAt: Date | null

	@Column({ type: 'timestamp', nullable: true })
	dueAt: Date | null

	@Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.OPEN })
	status: TaskStatus

	@Column({ type: 'int', default: 0 })
	order: number

	@Column()
	taskListId: number

	@ManyToOne(() => TaskListEntity, (list) => list.tasks, { onDelete: 'CASCADE' })
	taskList: TaskListEntity

	@Column({ nullable: true })
	assigneeId: number

	@ManyToOne(() => UserEntity, (user) => user.id, { nullable: true, onDelete: 'SET NULL' })
	assignee: UserEntity

	@Column({ nullable: true })
	parentId: number

	@ManyToOne(() => TaskEntity, (task) => task.children, { nullable: true, onDelete: 'CASCADE' })
	parent: TaskEntity

	@OneToMany(() => TaskEntity, (task) => task.parent)
	children: TaskEntity[]

	@CreateDateColumn()
	createdAt: Date

	@UpdateDateColumn()
	updatedAt: Date
}

