export declare class Projet {
    id: number;
    titre: string;
    slug: string;
    generateSlug(): void;
    type: 'International' | 'Service public' | 'Recherche' | 'Partenariat';
    date: string;
    description: string;
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
