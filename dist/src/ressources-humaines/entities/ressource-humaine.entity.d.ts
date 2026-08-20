export interface ExperienceProfessionnelle {
    poste: string;
    organisation?: string;
    periode?: string;
}
export declare class RessourceHumaine {
    id: number;
    slug: string;
    nom: string;
    prenom: string;
    poste: string;
    description?: string;
    email?: string;
    telephone?: string;
    adresse?: string;
    experiences: ExperienceProfessionnelle[];
    formations: string[];
    diplomes: string[];
    competences: string[];
    langues: string[];
    photo?: string;
    actif: boolean;
    ordre: number;
    creeLe: Date;
    misAJourLe: Date;
}
