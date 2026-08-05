import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum AdmissionStatus {
  EN_ATTENTE = 'en_attente',
  EN_COURS_ETUDE = 'en_cours_etude',
  ACCEPTE = 'accepte',
  REFUSE = 'refuse',
}

@Entity('admissions')
export class Admission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  prenom: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  telephone: string;

  @Column()
  dateNaissance: string;

  @Column()
  niveau: string;

  @Column()
  formation: string;

  @Column()
  diplomePrecedent: string;

  @Column({ nullable: true })
  cvPath: string;

  @Column({ nullable: true })
  lettreMotivationPath: string;

  @Column({
    type: 'enum',
    enum: AdmissionStatus,
    default: AdmissionStatus.EN_ATTENTE,
  })
  statut: AdmissionStatus;

  @Column({ type: 'text', nullable: true })
  commentaire: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  creeLe: Date;

  @Column({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  misAJourLe: Date;
}
