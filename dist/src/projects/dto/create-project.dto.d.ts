export declare class CreateProjetDto {
    titre: string;
    type: 'International' | 'Service public' | 'Recherche' | 'Partenariat';
    statut?: 'En cours' | 'Terminé';
    date: string;
    description: string;
    partenaireIds?: number[];
    partenaires?: string[];
    image?: string;
    galerie?: string[];
    latitude?: number;
    longitude?: number;
    ville?: string;
    pays?: string;
    adresse?: string;
}
declare const UpdateProjetDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateProjetDto>>;
export declare class UpdateProjetDto extends UpdateProjetDto_base {
}
export {};
