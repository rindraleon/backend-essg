import { AuthService } from './auth.service';
declare class LoginDto {
    email: string;
    password: string;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<import("./auth.service").AuthPayload>;
    verify(req: {
        user: {
            userId: number;
            email: string;
        };
    }): {
        valid: boolean;
        user: {
            userId: number;
            email: string;
        };
    };
    me(req: {
        user: {
            userId: number;
            email: string;
        };
    }): {
        userId: number;
        email: string;
    };
}
export {};
