import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('settings')
export class SettingsEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true })
    key: string

    @Column({ type: 'text', nullable: true })
    value: string | null

    @UpdateDateColumn()
    updatedAt: Date
}
