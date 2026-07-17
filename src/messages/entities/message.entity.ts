import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  prenom: string;

  @Column()
  nom: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  telephone: string;

  @Column()
  sujet: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'boolean', default: false })
  lu: boolean;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  creeLe: Date;

  @Column({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  misAJourLe: Date;
}
