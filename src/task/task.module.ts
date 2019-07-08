import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Task } from './task.entity';
import { TaskRepository } from './task.repository';
import { TaskService } from './task.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TaskRepository])],
  providers: [TaskService],
})
export class TaskModule {}
