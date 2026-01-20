import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./user.entity";
import { FolderEntity } from "./folder.entity";
import { TaskListEntity } from "./tasklist.entity";

@Entity('space')
export class SpaceEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	name: string

	@Column({ nullable: true })
	description: string

	@Column({ type: 'int', default: 0 })
	order: number

	@Column()
	ownerId: number

	@ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'ownerId' })
	owner: UserEntity

	@OneToMany(() => FolderEntity, (folder) => folder.space)
	folders: FolderEntity[]

	@OneToMany(() => TaskListEntity, (list) => list.space)
	taskLists: TaskListEntity[]

	@ManyToMany(() => UserEntity, { eager: true })
	@JoinTable({
		name: 'space_assignees',
		joinColumn: { name: 'spaceId' },
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

	@CreateDateColumn()
	createdAt: Date

	@UpdateDateColumn()
	updatedAt: Date

	@DeleteDateColumn()
	deletedAt: Date
}
