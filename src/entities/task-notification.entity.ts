import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { TaskEntity } from "./task.entity";
import { UserEntity } from "./user.entity";

@Entity('task_notification')
@Unique(['taskId', 'userId'])
export class TaskNotificationEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	taskId: number

	@Column()
	userId: number

	@Column({ type: 'timestamp', nullable: true })
	notifiedAt: Date | null

	@ManyToOne(() => TaskEntity, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'taskId' })
	task: TaskEntity

	@ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'userId' })
	user: UserEntity

	@CreateDateColumn()
	createdAt: Date
}
