import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateUserSessionsTable1782900000000 implements MigrationInterface {
  name = 'CreateUserSessionsTable1782900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('user_sessions'))) {
      await queryRunner.createTable(
        new Table({
          name: 'user_sessions',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              default: 'gen_random_uuid()',
            },
            { name: 'userId', type: 'int', isNullable: false },
            { name: 'sessionTokenHash', type: 'varchar', length: '64', isNullable: false },
            {
              name: 'status',
              type: 'varchar',
              length: '20',
              default: `'active'`,
              isNullable: false,
            },
            {
              name: 'createdAt',
              type: 'timestamptz',
              default: 'CURRENT_TIMESTAMP',
              isNullable: false,
            },
            {
              name: 'lastActivityAt',
              type: 'timestamptz',
              default: 'CURRENT_TIMESTAMP',
              isNullable: false,
            },
            { name: 'expiresAt', type: 'timestamptz', isNullable: false },
            { name: 'lastSeenAt', type: 'timestamptz', isNullable: true },
            { name: 'revokedAt', type: 'timestamptz', isNullable: true },
            { name: 'revokedBy', type: 'int', isNullable: true },
            { name: 'ipAddress', type: 'varchar', length: '45', isNullable: true },
            { name: 'userAgent', type: 'text', isNullable: true },
            { name: 'deviceName', type: 'varchar', length: '120', isNullable: true },
            { name: 'browserName', type: 'varchar', length: '80', isNullable: true },
            { name: 'osName', type: 'varchar', length: '80', isNullable: true },
          ],
        }),
        true,
      );

      await queryRunner.createIndex(
        'user_sessions',
        new TableIndex({ name: 'idx_user_sessions_user', columnNames: ['userId'] }),
      );
      await queryRunner.createIndex(
        'user_sessions',
        new TableIndex({
          name: 'idx_user_sessions_token',
          columnNames: ['sessionTokenHash'],
          isUnique: true,
        }),
      );
      await queryRunner.createIndex(
        'user_sessions',
        new TableIndex({ name: 'idx_user_sessions_expires', columnNames: ['expiresAt'] }),
      );
      await queryRunner.createIndex(
        'user_sessions',
        new TableIndex({ name: 'idx_user_sessions_activity', columnNames: ['lastActivityAt'] }),
      );

      await queryRunner.createForeignKey(
        'user_sessions',
        new TableForeignKey({
          name: 'fk_user_sessions_user',
          columnNames: ['userId'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );
    }

    if (!(await queryRunner.hasColumn('activity_logs', 'sessionId'))) {
      await queryRunner.addColumn(
        'activity_logs',
        new TableColumn({
          name: 'sessionId',
          type: 'varchar',
          length: '64',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('user_sessions')) {
      await queryRunner.dropTable('user_sessions');
    }
    if (await queryRunner.hasColumn('activity_logs', 'sessionId')) {
      await queryRunner.dropColumn('activity_logs', 'sessionId');
    }
  }
}
