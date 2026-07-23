"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAdmissionsTable1753178400000 = void 0;
const typeorm_1 = require("typeorm");
class CreateAdmissionsTable1753178400000 {
    name = 'CreateAdmissionsTable1753178400000';
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'admissions',
            columns: [
                {
                    name: 'id',
                    type: 'serial',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },
                {
                    name: 'nom',
                    type: 'varchar',
                    length: '255',
                },
                {
                    name: 'prenom',
                    type: 'varchar',
                    length: '255',
                },
                {
                    name: 'email',
                    type: 'varchar',
                    length: '255',
                },
                {
                    name: 'telephone',
                    type: 'varchar',
                    length: '50',
                    isNullable: true,
                },
                {
                    name: 'dateNaissance',
                    type: 'date',
                },
                {
                    name: 'niveau',
                    type: 'varchar',
                    length: '50',
                },
                {
                    name: 'formation',
                    type: 'varchar',
                    length: '255',
                },
                {
                    name: 'diplomePrecedent',
                    type: 'varchar',
                    length: '255',
                },
                {
                    name: 'cvPath',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
                },
                {
                    name: 'lettreMotivationPath',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
                },
                {
                    name: 'statut',
                    type: 'enum',
                    enum: ['en_attente', 'en_cours_etude', 'accepte', 'refuse'],
                    default: "'en_attente'",
                },
                {
                    name: 'commentaire',
                    type: 'text',
                    isNullable: true,
                },
                {
                    name: 'creeLe',
                    type: 'timestamptz',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'misAJourLe',
                    type: 'timestamptz',
                    default: 'CURRENT_TIMESTAMP',
                    onUpdate: 'CURRENT_TIMESTAMP',
                },
            ],
        }), true);
        await queryRunner.createIndex('admissions', new typeorm_1.TableIndex({
            name: 'IDX_ADMISSIONS_EMAIL',
            columnNames: ['email'],
        }));
        await queryRunner.createIndex('admissions', new typeorm_1.TableIndex({
            name: 'IDX_ADMISSIONS_STATUT',
            columnNames: ['statut'],
        }));
        await queryRunner.createIndex('admissions', new typeorm_1.TableIndex({
            name: 'IDX_ADMISSIONS_CREE_LE',
            columnNames: ['creeLe'],
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropIndex('admissions', 'IDX_ADMISSIONS_CREE_LE');
        await queryRunner.dropIndex('admissions', 'IDX_ADMISSIONS_STATUT');
        await queryRunner.dropIndex('admissions', 'IDX_ADMISSIONS_EMAIL');
        await queryRunner.dropTable('admissions');
    }
}
exports.CreateAdmissionsTable1753178400000 = CreateAdmissionsTable1753178400000;
//# sourceMappingURL=1753178400000-CreateAdmissionsTable.js.map