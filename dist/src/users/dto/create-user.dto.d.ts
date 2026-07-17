export declare class CreateUtilisateurDto {
    email: string;
    motDePasse: string;
    prenom: string;
    nom: string;
    role?: 'admin' | 'editeur' | 'lecteur';
    estActif?: boolean;
    avatar?: string;
}
