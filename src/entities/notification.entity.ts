import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TaskEntity } from "./task.entity";
import { UserEntity } from "./user.entity";
import { SpaceEntity } from "./space.entity";
import { FolderEntity } from "./folder.entity";
import { TaskListEntity } from "./tasklist.entity";

export enum NotificationType {
	TASK_ASSIGNED = 'task_assigned',
	TASK_DEADLINE = 'task_deadline',
	TASK_UPDATED = 'task_updated',
	TASK_UNASSIGNED = 'task_unassigned',
	SPACE_ASSIGNED = 'space_assigned',
	SPACE_UNASSIGNED = 'space_unassigned',
	FOLDER_ASSIGNED = 'folder_assigned',
	FOLDER_UNASSIGNED = 'folder_unassigned',
	LIST_ASSIGNED = 'list_assigned',
	LIST_UNASSIGNED = 'list_unassigned'
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

	@Column({ nullable: true })
	spaceId: number | null

	@ManyToOne(() => SpaceEntity, { onDelete: 'CASCADE', nullable: true })
	@JoinColumn({ name: 'spaceId' })
	space: SpaceEntity | null

	@Column({ nullable: true })
	folderId: number | null

	@ManyToOne(() => FolderEntity, { onDelete: 'CASCADE', nullable: true })
	@JoinColumn({ name: 'folderId' })
	folder: FolderEntity | null

	@Column({ nullable: true })
	listId: number | null

	@ManyToOne(() => TaskListEntity, { onDelete: 'CASCADE', nullable: true })
	@JoinColumn({ name: 'listId' })
	list: TaskListEntity | null

	@CreateDateColumn()
	createdAt: Date
}
