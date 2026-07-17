export declare class Utilisateur {
    id: number;
    email: string;
    motDePasse: string;
    prenom: string;
    nom: string;
    role: 'admin' | 'editeur' | 'lecteur';
    estActif: boolean;
    avatar?: string;
    creeLe: Date;
    misAJourLe: Date;
}
