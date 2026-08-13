export declare class CreateProjetDto {
    titre: string;
    slug?: string;
    type: 'International' | 'Service public' | 'Recherche' | 'Partenariat';
    date: string;
    description: string;
    partenaires: string[];
    image?: string;
    galerie?: string[];
    latitude?: number;
    longitude?: number;
    ville?: string;
    pays?: string;
    adresse?: string;
}
export declare class UpdateProjetDto extends CreateProjetDto {
}
