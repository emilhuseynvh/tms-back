import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TaskEntity } from "./task.entity";

@Entity('task_activity')
export class TaskActivityEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	taskId: number

	@ManyToOne(() => TaskEntity, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'taskId' })
	task: TaskEntity

	@Column({ nullable: true })
	userId: number | null

	@Column({ nullable: true })
	username: string | null

	@Column({ type: 'jsonb' })
	changes: Record<string, unknown>

	@CreateDateColumn()
	createdAt: Date
}
