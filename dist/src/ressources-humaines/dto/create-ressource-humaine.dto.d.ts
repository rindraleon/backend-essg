export declare class ExperienceProfessionnelleDto {
    poste: string;
    organisation?: string;
    periode?: string;
}
export declare class CreateRessourceHumaineDto {
    nom: string;
    prenom: string;
    poste: string;
    description?: string;
    email?: string;
    telephone?: string;
    adresse?: string;
    experiences?: ExperienceProfessionnelleDto[];
    formations?: string[];
    diplomes?: string[];
    competences?: string[];
    langues?: string[];
    photo?: string;
    actif?: boolean;
    ordre?: number;
}
export declare class UpdateRessourceHumaineDto {
    nom?: string;
    prenom?: string;
    poste?: string;
    description?: string;
    email?: string;
    telephone?: string;
    adresse?: string;
    experiences?: ExperienceProfessionnelleDto[];
    formations?: string[];
    diplomes?: string[];
    competences?: string[];
    langues?: string[];
    photo?: string;
    actif?: boolean;
    ordre?: number;
}
