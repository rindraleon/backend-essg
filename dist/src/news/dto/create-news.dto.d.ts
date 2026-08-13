export declare class CreateActualiteDto {
    slug?: string;
    titre: string;
    categorie: string;
    date: string;
    resume?: string;
    contenu: string;
    auteur: string;
    statut?: boolean;
    image?: string;
    galerie?: string[];
    enVedette?: boolean;
}
export declare class UpdateActualiteDto extends CreateActualiteDto {
}
