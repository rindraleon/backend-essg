import { AdmissionStatus } from '../entities/admission.entity';
export declare class CreateAdmissionDto {
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    dateNaissance: string;
    niveau: string;
    formation: string;
    diplomePrecedent: string;
    cvPath?: string;
    lettreMotivationPath?: string;
    statut?: AdmissionStatus;
    commentaire?: string;
}
