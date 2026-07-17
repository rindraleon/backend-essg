import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate } from 'typeorm';

@Entity('projects')
export class Projet {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  titre!: string;

  @Column({ nullable: true })
  slug!: string;

  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    if (this.titre && !this.slug) {
      this.slug = this.titre
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
  }

  @Column({ type: 'text', default: 'Recherche' })
  type!: 'International' | 'Service public' | 'Recherche' | 'Partenariat';

  @Column()
  date!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'simple-json', default: '[]' })
  partenaires!: string[];

  @Column({ default: '/images/hero-campus.jpg' })
  image!: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number;

  @Column({ nullable: true })
  ville?: string;

  @Column({ nullable: true })
  pays?: string;

  @Column({ type: 'text', nullable: true })
  adresse?: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  creeLe!: Date;

  @Column({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  misAJourLe!: Date;
}
