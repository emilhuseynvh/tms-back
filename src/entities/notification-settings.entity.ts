import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('notification_settings')
export class NotificationSettingsEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	// Neçə saat əvvəl bildiriş göndərilsin (default 2 saat)
	@Column({ type: 'int', default: 2 })
	hoursBeforeDue: number

	// Bildiriş aktiv/deaktiv
	@Column({ default: true })
	isEnabled: boolean

	@UpdateDateColumn()
	updatedAt: Date
}
