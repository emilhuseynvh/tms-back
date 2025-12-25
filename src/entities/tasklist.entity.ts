import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { FolderEntity } from "./folder.entity";
import { TaskEntity } from "./task.entity";
import { SpaceEntity } from "./space.entity";

@Entity('task_list')
export class TaskListEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	name: string

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

	@CreateDateColumn()
	createdAt: Date

	@UpdateDateColumn()
	updatedAt: Date

	@DeleteDateColumn()
	deletedAt: Date
}

