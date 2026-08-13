import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { slugify } from '../../common/utils/text.util';

@Entity('formations')
export class Formation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @BeforeInsert()
  @BeforeUpdate()
  generateSlug(): void {
    if (this.titre && !this.slug) {
      this.slug = slugify(this.titre);
    }
  }

  @Column({ type: 'simple-json', default: '[]' })
  domaine: string[];

  @Column()
  titre: string;

  @Column({ type: 'text', default: 'Licence' })
  niveau: 'Licence' | 'Master' | 'Doctorat';

  @Column()
  duree: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'simple-json', default: '[]' })
  objectifs: string[];

  @Column({ type: 'simple-json', default: '[]' })
  debouches: string[];

  @Column({ type: 'text', nullable: true })
  conditionsAcces: string;

  @Column({ type: 'simple-json', default: '[]' })
  conditions: string[];

  @Column({ type: 'simple-json', default: '[]' })
  competences: string[];

  @Column({ type: 'simple-json', default: '[]' })
  modules: any[];

  @Column({ type: 'int', default: 180 })
  credits: number;

  @Column({ nullable: true })
  responsable: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'simple-json', default: '[]' })
  programme: string[];

  @Column({ default: '/images/hero-campus.jpg' })
  image: string;

  @Column({ type: 'boolean', default: false })
  enVedette: boolean;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  creeLe: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  misAJourLe: Date;
}
