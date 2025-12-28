import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, JoinTable } from "typeorm";
import { TaskListEntity } from "./tasklist.entity";
import { UserEntity } from "./user.entity";
import { TaskStatusEntity } from "./task-status.entity";


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

	@Column({ nullable: true })
	statusId: number

	@ManyToOne(() => TaskStatusEntity, (status) => status.tasks, { nullable: true, onDelete: 'SET NULL', eager: true })
	@JoinColumn({ name: 'statusId' })
	status: TaskStatusEntity

	@Column({ type: 'int', default: 0 })
	order: number

	@Column()
	taskListId: number

	@Column({ nullable: true, type: 'text' })
	link: string

	@ManyToOne(() => TaskListEntity, (list) => list.tasks, { onDelete: 'CASCADE' })
	taskList: TaskListEntity

	@Column({ nullable: true })
	parentId: number

	@ManyToOne(() => TaskEntity, (task) => task.children, { nullable: true, onDelete: 'CASCADE' })
	parent: TaskEntity

	@OneToMany(() => TaskEntity, (task) => task.parent)
	children: TaskEntity[]

	@ManyToMany(() => UserEntity, { eager: true })
	@JoinTable({
		name: 'task_assignees',
		joinColumn: { name: 'taskId' },
		inverseJoinColumn: { name: 'userId' }
	})
	assignees: UserEntity[]

	@Column({ nullable: true })
	deletedById: number

	@ManyToOne(() => UserEntity, { nullable: true })
	@JoinColumn({ name: 'deletedById' })
	deletedBy: UserEntity

	@CreateDateColumn()
	createdAt: Date

	@UpdateDateColumn()
	updatedAt: Date

	@DeleteDateColumn()
	deletedAt: Date
}
