import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
interface AuthUser {
    userId: number;
    email: string;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<import("./auth.service").AuthPayload>;
    verify(req: {
        user: AuthUser;
    }): {
        valid: boolean;
        user: AuthUser;
    };
    me(req: {
        user: AuthUser;
    }): AuthUser;
}
export {};
