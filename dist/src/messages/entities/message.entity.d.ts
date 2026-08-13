export declare class Message {
    id: number;
    prenom: string;
    nom: string;
    email: string;
    telephone: string;
    sujet: string;
    message: string;
    lu: boolean;
    luLe: Date | null;
    luPar: string | null;
    reponse: string | null;
    reponseSujet: string | null;
    reponduLe: Date | null;
    reponduPar: string | null;
    creeLe: Date;
    misAJourLe: Date;
}
