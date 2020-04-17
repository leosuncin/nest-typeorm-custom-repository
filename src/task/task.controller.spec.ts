import {
  bool,
  build,
  fake,
  perBuild,
  sequence,
} from '@jackfranklin/test-data-bot';
import { Test, TestingModule } from '@nestjs/testing';
import { getCustomRepositoryToken } from '@nestjs/typeorm';

import { TaskController } from './task.controller';
import { TaskRepository } from './task.repository';
import { TaskService } from './task.service';

const taskBuilder = build('Task', {
  fields: {
    id: sequence(),
    title: fake(f => f.lorem.words(5)),
    done: bool(),
    createdAt: perBuild(() => new Date()),
    updatedAt: perBuild(() => new Date()),
  },
});

const MockRepository = jest.fn().mockImplementation(() => {
  const tasks = Array.from({ length: 10 }, () => taskBuilder());

  return {
    find() {
      return Promise.resolve(tasks);
    },
    findDone() {
      return Promise.resolve(tasks.filter(t => t.done));
    },
    findPending() {
      return Promise.resolve(tasks.filter(t => !t.done));
    },
    findOne(id) {
      return Promise.resolve(
        id < 1 ? null : taskBuilder({ map: t => ({ ...t, id }) }),
      );
    },
    create(dto) {
      return { ...dto, done: false };
    },
    save(dto) {
      return Promise.resolve(taskBuilder({ map: t => ({ ...t, ...dto }) }));
    },
    delete(id) {
      return Promise.resolve({ raw: [], affected: id < 1 ? 0 : 1 });
    },
  };
});

describe('Task Controller', () => {
  let controller: TaskController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getCustomRepositoryToken(TaskRepository),
          useClass: MockRepository,
        },
        TaskService,
      ],
      controllers: [TaskController],
    }).compile();

    controller = module.get<TaskController>(TaskController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should list all the tasks', async () => {
    expect(Array.isArray(await controller.find())).toBeTruthy();
  });

  it('should list done task', async () => {
    expect(
      (await controller.listDone()).reduce(
        (prev, curr) => prev && curr.done,
        true,
      ),
    ).toBeTruthy();
  });

  it('should list pending task', async () => {
    expect(
      (await controller.listPending()).reduce(
        (prev, curr) => prev || curr.done,
        false,
      ),
    ).toBeFalsy();
  });

  it('should get one task', async () => {
    expect(await controller.get(1)).toMatchObject({
      id: 1,
      title: expect.any(String),
      done: expect.any(Boolean),
    });
  });

  it('fail to get one task', () => {
    expect.assertions(1);
    expect(controller.get(0)).rejects.toThrow();
  });

  it('should create one task', async () => {
    expect(await controller.create({ title: 'Make a sandwich' })).toMatchObject(
      {
        id: expect.any(Number),
        title: 'Make a sandwich',
        done: false,
      },
    );
  });

  it('should update one task', async () => {
    expect(
      await controller.update(1, { title: 'sudo make a sandwich' }),
    ).toMatchObject({
      id: 1,
      title: 'sudo make a sandwich',
      done: expect.any(Boolean),
    });
  });

  it('fail to update one task', () => {
    expect.assertions(1);
    expect(controller.update(0, { title: 'Make a salad' })).rejects.toThrow();
  });

  it('should mark one task as done', async () => {
    expect(await controller.markDone(1)).toMatchObject({
      id: 1,
      title: expect.any(String),
      done: true,
    });
  });

  it('should mark one task as pending', async () => {
    expect(await controller.markPending(1)).toMatchObject({
      id: 1,
      title: expect.any(String),
      done: false,
    });
  });

  it('should remove one task', async () => {
    expect(await controller.remove(1)).toMatchObject({
      raw: [],
      affected: 1,
    });
  });
});
