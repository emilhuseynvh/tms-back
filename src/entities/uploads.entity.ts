import { BaseEntity, Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity('uploads')
export class UploadsEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    url: string;

    @OneToOne(() => UserEntity, (user) => user.avatar)
    user: string

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

} 