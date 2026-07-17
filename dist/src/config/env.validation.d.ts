declare class EnvironmentVariables {
    DB_HOST: string;
    DB_PORT: number;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    JWT_SECRET: string;
    JWT_EXPIRATION: string;
    PORT: number;
    UPLOAD_DIR: string;
}
export declare function validate(config: Record<string, unknown>): EnvironmentVariables;
export {};
