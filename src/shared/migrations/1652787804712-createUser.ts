import { Role } from '@modules/auth/jwt/role.enum';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createUser1652787804712 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'decimal',
            isPrimary: true,
            precision: 30,
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamptz',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamptz',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'role',
            type: 'enum',
            enum: [Role.User, Role.Admin],
            enumName: 'userRole',
            isNullable: false,
            default: `'${Role.User}'`,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
