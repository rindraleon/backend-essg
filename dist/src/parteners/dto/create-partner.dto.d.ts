export declare class CreatePartenaireDto {
    nom: string;
    slug?: string;
    type: 'Entreprise' | 'Institution' | 'Organisation' | 'Autre';
    secteur: string;
    description: string;
    siteWeb?: string;
    logo?: string;
    contact?: string;
    dateDebut: string;
}
export declare class UpdatePartenaireDto extends CreatePartenaireDto {
}
