export declare class Partenaire {
    id: number;
    nom: string;
    slug: string;
    type: 'Entreprise' | 'Institution' | 'Organisation' | 'Autre';
    secteur?: string;
    description: string;
    siteWeb?: string;
    logo?: string;
    contact?: string;
    dateDebut?: Date;
    creeLe: Date;
    misAJourLe: Date;
}
