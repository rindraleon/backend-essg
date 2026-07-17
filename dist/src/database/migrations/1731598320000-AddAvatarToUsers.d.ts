import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddAvatarToUsers1731598320000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
