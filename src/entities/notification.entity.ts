import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TaskEntity } from "./task.entity";
import { UserEntity } from "./user.entity";

export enum NotificationType {
	TASK_ASSIGNED = 'task_assigned',
	TASK_DEADLINE = 'task_deadline',
	TASK_UPDATED = 'task_updated',
	TASK_UNASSIGNED = 'task_unassigned'
}

@Entity('notifications')
export class NotificationEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	userId: number

	@Column({ type: 'enum', enum: NotificationType })
	type: NotificationType

	@Column()
	title: string

	@Column()
	message: string

	@Column({ nullable: true })
	taskId: number | null

	@Column({ default: false })
	isRead: boolean

	@ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'userId' })
	user: UserEntity

	@ManyToOne(() => TaskEntity, { onDelete: 'CASCADE', nullable: true })
	@JoinColumn({ name: 'taskId' })
	task: TaskEntity | null

	@CreateDateColumn()
	createdAt: Date
}
