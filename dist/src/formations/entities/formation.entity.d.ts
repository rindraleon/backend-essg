export declare class Formation {
    id: number;
    slug: string;
    mention: string;
    domaine: string[];
    titre: string;
    niveau: 'Licence' | 'Master' | 'Doctorat';
    duree: string;
    description: string;
    objectifs: string[];
    debouches: string[];
    conditionsAcces: string;
    conditions: string[];
    competences: string[];
    modules: any[];
    credits: number;
    responsable: string;
    responsableId: number | null;
    email: string;
    programme: string[];
    image: string;
    enVedette: boolean;
    creeLe: Date;
    misAJourLe: Date;
}
