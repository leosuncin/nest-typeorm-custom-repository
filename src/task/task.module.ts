import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TaskRepository } from './task.repository';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TaskRepository])],
  providers: [TaskService],
  controllers: [TaskController],
})
export class TaskModule {}
