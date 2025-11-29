import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { FolderEntity } from "./folder.entity";
import { TaskEntity } from "./task.entity";

@Entity('task_list')
export class TaskListEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	name: string

	@Column()
	folderId: number

	@ManyToOne(() => FolderEntity, (folder) => folder.taskLists, { onDelete: 'CASCADE' })
	folder: FolderEntity

	@OneToMany(() => TaskEntity, (task) => task.taskList)
	tasks: TaskEntity[]

	@CreateDateColumn()
	createdAt: Date

	@UpdateDateColumn()
	updatedAt: Date
}

