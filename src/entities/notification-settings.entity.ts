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

	// Bildiriş səsi tipi
	@Column({ default: 'default' })
	soundType: string

	// Custom səs URL
	@Column({ type: 'text', nullable: true })
	customSoundUrl: string | null

	@UpdateDateColumn()
	updatedAt: Date
}
