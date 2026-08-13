export declare class CreateFormationDto {
    slug?: string;
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
    modules?: unknown[];
    responsable?: string;
    email?: string;
    image?: string;
    enVedette?: boolean;
    credits: number;
}
declare const UpdateFormationDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateFormationDto>>;
export declare class UpdateFormationDto extends UpdateFormationDto_base {
}
export {};
