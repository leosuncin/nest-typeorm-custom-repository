import { Module } from '@nestjs/common';
import {
  getDataSourceToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { TaskController } from './task.controller';
import { Task } from './task.entity';
import { customTaskRepositoryMethods } from './task.repository';
import { TaskService } from './task.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task])],
  providers: [
    {
      provide: getRepositoryToken(Task),
      inject: [getDataSourceToken()],
      useFactory(dataSource: DataSource) {
        // Override default repository for Task with a custom one
        return dataSource
          .getRepository(Task)
          .extend(customTaskRepositoryMethods);
      },
    },
    TaskService,
  ],
  controllers: [TaskController],
})
export class TaskModule {}
