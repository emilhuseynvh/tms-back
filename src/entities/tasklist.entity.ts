import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { FolderEntity } from "./folder.entity";
import { TaskEntity } from "./task.entity";
import { SpaceEntity } from "./space.entity";
import { UserEntity } from "./user.entity";

@Entity('task_list')
export class TaskListEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	name: string

	@Column({ type: 'int', default: 0 })
	order: number

	@Column({ nullable: true })
	folderId: number | null

	@ManyToOne(() => FolderEntity, (folder) => folder.taskLists, { onDelete: 'CASCADE', nullable: true })
	folder: FolderEntity

	@Column({ nullable: true })
	spaceId: number | null

	@ManyToOne(() => SpaceEntity, (space) => space.taskLists, { onDelete: 'CASCADE', nullable: true })
	@JoinColumn({ name: 'spaceId' })
	space: SpaceEntity

	@OneToMany(() => TaskEntity, (task) => task.taskList)
	tasks: TaskEntity[]

	@ManyToMany(() => UserEntity, { eager: true })
	@JoinTable({
		name: 'tasklist_assignees',
		joinColumn: { name: 'taskListId' },
		inverseJoinColumn: { name: 'userId' }
	})
	assignees: UserEntity[]

	@Column({ default: false })
	isArchived: boolean

	@Column({ type: 'timestamptz', nullable: true })
	archivedAt: Date | null

	@Column({ nullable: true })
	archivedById: number | null

	@ManyToOne(() => UserEntity, { nullable: true })
	@JoinColumn({ name: 'archivedById' })
	archivedBy: UserEntity

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

