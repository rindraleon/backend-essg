import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CreateAdmissionsTable1753178400000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
