import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UploadsEntity } from "./uploads.entity";
import { RoleEnum } from "../shared/enums/role.enum";

@Entity('user')
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    username: string

    // Qısa ad (maks. 3 böyük hərf)
    @Column({ type: 'varchar', length: 3, nullable: true })
    shortName: string | null

    // Brauzer bildirişləri aktivdirmi
    @Column({ type: 'boolean', default: false })
    browserNotificationsEnabled: boolean

    @Column({ nullable: true })
    avatarId: number | null

    @Column()
    phone: string

    @Column()
    email: string

    @Column()
    password: string

    @Column({ type: 'enum', enum: RoleEnum, nullable: true })
    role: RoleEnum

    @OneToOne(() => UploadsEntity, (image) => image.user)
    @JoinColumn({ name: 'avatarId' })
    avatar: string


    @CreateDateColumn()
    createdAt: Date
}