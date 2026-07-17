export declare class CreateFormationDto {
    slug: string;
    domaine: string[];
    titre: string;
    niveau: 'Licence' | 'Master' | 'Doctorat';
    duree: string;
    description: string;
    objectifs: string[];
    debouches: string[];
    conditionsAcces: string;
    programme: string[];
    conditions?: string[];
    competences?: string[];
    modules?: any[];
    responsable?: string;
    email?: string;
    image?: string;
    enVedette?: boolean;
    credits: number;
}
export declare class UpdateFormationDto extends CreateFormationDto {
}
