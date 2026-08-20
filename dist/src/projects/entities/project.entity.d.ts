export declare class Projet {
    id: number;
    titre: string;
    slug: string;
    type: 'International' | 'Service public' | 'Recherche' | 'Partenariat';
    statut: 'En cours' | 'Terminé';
    date: string;
    description: string;
    partenaireIds: number[];
    partenaires: string[];
    image: string;
    galerie: string[];
    latitude?: number;
    longitude?: number;
    ville?: string;
    pays?: string;
    adresse?: string;
    creeLe: Date;
    misAJourLe: Date;
}
