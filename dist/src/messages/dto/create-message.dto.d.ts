export declare class CreateMessageDto {
    prenom: string;
    nom: string;
    email: string;
    telephone?: string;
    sujet: string;
    message: string;
    lu?: boolean;
}
export declare class UpdateMessageDto {
    lu: boolean;
}
