export interface AuthUser {
    userId: number;
    email: string;
    role: string;
    prenom: string;
    nom: string;
    avatar?: string;
}
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
