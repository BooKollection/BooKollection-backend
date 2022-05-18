// import parseBoolean from '@eturino/ts-parse-boolean';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

export = [
  {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [
      join(__dirname, '..', '/modules/**/infra/database/*.entity.{js,ts}'),
    ],
    migrations: [join(__dirname, '..', '/shared/migrations/*.{js,ts}')],
    cli: {
      migrationsDir: 'src/shared/migrations',
    },
    synchronize: process.env.DB_SYNC == 'true',
    ...(process.env.ISLOCALHOST === 'false' && {
      ssl: true,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    }),
  } as TypeOrmModuleOptions,
];