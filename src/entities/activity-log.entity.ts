import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";

export enum ActivityType {
	SPACE_CREATE = 'space_create',
	SPACE_UPDATE = 'space_update',
	SPACE_DELETE = 'space_delete',
	SPACE_RESTORE = 'space_restore',
	FOLDER_CREATE = 'folder_create',
	FOLDER_UPDATE = 'folder_update',
	FOLDER_DELETE = 'folder_delete',
	FOLDER_RESTORE = 'folder_restore',
	LIST_CREATE = 'list_create',
	LIST_UPDATE = 'list_update',
	LIST_DELETE = 'list_delete',
	LIST_RESTORE = 'list_restore',
	TASK_CREATE = 'task_create',
	TASK_UPDATE = 'task_update',
	TASK_DELETE = 'task_delete',
	TASK_RESTORE = 'task_restore',
}

@Entity('activity_log')
export class ActivityLogEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ type: 'enum', enum: ActivityType })
	type: ActivityType

	@Column({ nullable: true })
	userId: number

	@ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
	@JoinColumn({ name: 'userId' })
	user: UserEntity

	@Column({ nullable: true })
	entityId: number

	@Column({ nullable: true })
	entityName: string

	@Column({ type: 'jsonb', nullable: true })
	changes: Record<string, unknown>

	@Column({ type: 'text', nullable: true })
	description: string

	@CreateDateColumn({ type: 'timestamptz' })
	createdAt: Date
}
