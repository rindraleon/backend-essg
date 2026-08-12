declare class EnvironmentVariables {
    NODE_ENV: string;
    POSTGRES_HOST: string;
    POSTGRES_PORT: number;
    POSTGRES_USER: string;
    POSTGRES_PASSWORD: string;
    POSTGRES_DB: string;
    APP_PORT: number;
    APP_URL: string;
    UPLOAD_PATH: string;
    JWT_SECRET: string;
    JWT_EXPIRATION: string;
    SMTP_HOST: string;
    SMTP_PORT: number;
    SMTP_SECURE: boolean;
    SMTP_USER: string;
    SMTP_PASS: string;
    SMTP_FROM: string;
    MINIO_ENDPOINT: string;
    MINIO_PORT: number;
    MINIO_USE_SSL: boolean;
    MINIO_ACCESS_KEY: string;
    MINIO_SECRET_KEY: string;
    MINIO_BUCKET: string;
    MINIO_PUBLIC_URL: string;
}
export declare function validate(config: Record<string, unknown>): EnvironmentVariables;
export {};
