import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UploadsEntity } from "./uploads.entity";
import { RoleEnum } from "../shared/enums/role.enum";

@Entity('user')
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    username: string

    @Column({ nullable: true })
    avatarId: number | null

    @Column()
    phone: string

    @Column()
    email: string

    @Column()
    password: string

    @Column({ enum: RoleEnum })
    role: RoleEnum

    @OneToOne(() => UploadsEntity, (image) => image.user)
    @JoinColumn({ name: 'avatarId' })
    avatar: string


    @CreateDateColumn()
    createdAt: Date
}