import { Injectable, NotFoundException } from '@nestjs/common';

import { TaskRepository } from './task.repository';
import { TaskCreate } from './dto/task-create.dto';
import { TaskUpdate } from './dto/task-update.dto';

@Injectable()
export class TaskService {
  constructor(private readonly taskRepository: TaskRepository) {}

  findAll() {
    return this.taskRepository.find();
  }

  findAllDone() {
    return this.taskRepository.findDone();
  }

  findAllPending() {
    return this.taskRepository.findPending();
  }

  async get(id: number) {
    const task = await this.taskRepository.findOne(id);

    if (!task) {
      throw new NotFoundException(`There isn't any task with id: ${id}`);
    }

    return task;
  }

  create(newTask: TaskCreate) {
    const task = this.taskRepository.create(newTask);

    return this.taskRepository.save(task);
  }

  async update(id: number, updates: TaskUpdate) {
    const task = await this.taskRepository.findOne(id);

    if (!task) {
      throw new NotFoundException(`There isn't any task with id: ${id}`);
    }

    Object.assign(task, updates);

    return this.taskRepository.save(task);
  }

  remove(id: number) {
    return this.taskRepository.delete(id);
  }
}
