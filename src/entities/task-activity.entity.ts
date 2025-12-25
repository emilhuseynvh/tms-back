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

	@Column({ type: 'int', nullable: true })
	userId: number

	@Column({ type: 'varchar', nullable: true })
	username: string

	@Column({ type: 'jsonb' })
	changes: Record<string, unknown>

	@CreateDateColumn()
	createdAt: Date
}
