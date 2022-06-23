import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'node:path';

import { Task } from './task/task.entity';

const isTest = process.env.NODE_ENV === 'test';

export const options: DataSourceOptions = {
  type: 'sqlite',
  database: isTest ? ':memory:' : join(process.cwd(), 'db.sqlite3'),
  entities: [Task],
  synchronize: true,
};

// Use with TypeORM CLI
export const AppDataSource = new DataSource(options);
