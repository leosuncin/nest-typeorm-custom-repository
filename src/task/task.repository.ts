import { EntityRepository, Repository } from 'typeorm';

import { Task } from './task.entity';

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
  findDone() {
    return this.find({ done: true });
  }

  findPending() {
    return this.find({ done: false });
  }
}
