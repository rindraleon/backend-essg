import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partenaire } from '../entities/partner.entity';

// Fonction pour générer un slug à partir d'une chaîne
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9]/g, '-') // Remplacer chaque caractère non alphanumérique par un tiret
    .replace(/-+/g, '-') // Remplacer les tirets multiples par un seul tiret
    .replace(/^-+|-+$/g, ''); // Supprimer les tirets en début et fin
};

@Injectable()
export class PopulateSlugsService {
  private readonly logger = new Logger(PopulateSlugsService.name);

  constructor(
    @InjectRepository(Partenaire)
    private readonly partenaireRepository: Repository<Partenaire>,
  ) {}

  async populate() {
    this.logger.log('Début du peuplement des slugs...');

    const partenaires = await this.partenaireRepository.find();
    let updatedCount = 0;

    for (const partenaire of partenaires) {
      if (!partenaire.slug) {
        const slug = generateSlug(partenaire.nom);
        
        // Vérifier si le slug existe déjà
        const existing = await this.partenaireRepository.findOne({ where: { slug } });
        if (existing) {
          // Ajouter un suffixe numérique si le slug existe déjà
          let uniqueSlug = slug;
          let counter = 1;
          while (existing && existing.id !== partenaire.id) {
            uniqueSlug = `${slug}-${counter}`;
            const duplicate = await this.partenaireRepository.findOne({ where: { slug: uniqueSlug } });
            if (!duplicate || duplicate.id === partenaire.id) {
              break;
            }
            counter++;
          }
          partenaire.slug = uniqueSlug;
        } else {
          partenaire.slug = slug;
        }

        await this.partenaireRepository.save(partenaire);
        updatedCount++;
        this.logger.log(`Slug généré pour "${partenaire.nom}": ${partenaire.slug}`);
      }
    }

    this.logger.log(`Peuplement terminé. ${updatedCount} slug(s) généré(s) sur ${partenaires.length} partenaire(s).`);
    return { total: partenaires.length, updated: updatedCount };
  }
}