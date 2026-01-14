import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./user.entity";
import { TaskListEntity } from "./tasklist.entity";
import { SpaceEntity } from "./space.entity";

@Entity('folder')
export class FolderEntity extends BaseEntity {
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

	@ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
	owner: UserEntity

	@Column()
	spaceId: number

	@ManyToOne(() => SpaceEntity, (space) => space.folders, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'spaceId' })
	space: SpaceEntity

	@OneToMany(() => TaskListEntity, (list) => list.folder)
	taskLists: TaskListEntity[]

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

