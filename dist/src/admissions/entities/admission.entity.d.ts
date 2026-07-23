export declare enum AdmissionStatus {
    EN_ATTENTE = "en_attente",
    EN_COURS_ETUDE = "en_cours_etude",
    ACCEPTE = "accepte",
    REFUSE = "refuse"
}
export declare class Admission {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    dateNaissance: string;
    niveau: string;
    formation: string;
    diplomePrecedent: string;
    cvPath: string;
    lettreMotivationPath: string;
    statut: AdmissionStatus;
    commentaire: string;
    creeLe: Date;
    misAJourLe: Date;
}
