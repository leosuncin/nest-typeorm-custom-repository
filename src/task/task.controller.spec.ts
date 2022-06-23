import { faker } from '@faker-js/faker';
import { build, perBuild, sequence } from '@jackfranklin/test-data-bot';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import type { TaskCreate } from './dto/task-create.dto';
import type { TaskUpdate } from './dto/task-update.dto';
import { TaskController } from './task.controller';
import { Task } from './task.entity';
import { TaskService } from './task.service';

const taskBuilder = build<Task>({
  fields: {
    id: sequence(),
    title: perBuild(() => faker.hacker.phrase()),
    done: perBuild(() => faker.datatype.boolean()),
    createdAt: perBuild(() => faker.date.recent()),
    updatedAt: perBuild(() => faker.date.recent()),
  },
  postBuild(task) {
    return Object.assign(new Task(), task);
  },
});

const TaskServiceMock = jest.fn().mockImplementation(() => {
  const tasks = Array.from({ length: 10 }, () => taskBuilder());

  return {
    findAll: jest.fn().mockResolvedValue(tasks),
    findAllDone: jest.fn().mockResolvedValue(tasks.filter((t) => t.done)),
    findAllPending: jest.fn().mockResolvedValue(tasks.filter((t) => !t.done)),
    get: jest.fn().mockImplementation(
      (id: number) =>
        new Promise((resolve, reject) => {
          if (id < 1) {
            reject(
              new NotFoundException(`There isn't any task with id: ${id}`),
            );
          } else {
            resolve(taskBuilder({ overrides: { id } }));
          }
        }),
    ),
    create: jest
      .fn()
      .mockImplementation(({ title }: TaskCreate) =>
        Promise.resolve(taskBuilder({ overrides: { title, done: false } })),
      ),
    update: jest.fn().mockImplementation(
      (id: number, updates: TaskUpdate) =>
        new Promise((resolve, reject) => {
          if (id < 1) {
            reject(
              new NotFoundException(`There isn't any task with id: ${id}`),
            );
          } else {
            resolve(taskBuilder({ overrides: { id, ...updates } }));
          }
        }),
    ),
    remove: jest.fn().mockResolvedValue({
      raw: [],
      affected: 1,
    }),
  };
});

describe('Task Controller', () => {
  let controller: TaskController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TaskService,
          useClass: TaskServiceMock,
        },
      ],
      controllers: [TaskController],
    }).compile();

    controller = module.get<TaskController>(TaskController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should list all the tasks', async () => {
    const all = await controller.find();

    expect(Array.isArray(all)).toBe(true);
  });

  it('should list done task', async () => {
    const allDone = await controller.listDone();

    expect(allDone.every((task) => task.done)).toBe(true);
  });

  it('should list pending task', async () => {
    const allPending = await controller.listPending();

    expect(allPending.every((task) => !task.done)).toBe(true);
  });

  it('should get one task', async () => {
    await expect(controller.get(1)).resolves.toMatchObject({
      id: 1,
      title: expect.any(String),
      done: expect.any(Boolean),
    });
  });

  it('fail to get one task', async () => {
    await expect(controller.get(0)).rejects.toThrow();
  });

  it('should create one task', async () => {
    await expect(
      controller.create({ title: 'Make a sandwich' }),
    ).resolves.toMatchObject({
      id: expect.any(Number),
      title: 'Make a sandwich',
      done: false,
    });
  });

  it('should update one task', async () => {
    await expect(
      controller.update(1, { title: 'sudo make a sandwich' }),
    ).resolves.toMatchObject({
      id: 1,
      title: 'sudo make a sandwich',
      done: expect.any(Boolean),
    });
  });

  it('fail to update one task', async () => {
    await expect(
      controller.update(0, { title: 'Make a salad' }),
    ).rejects.toThrow();
  });

  it('should mark one task as done', async () => {
    await expect(controller.markDone(1)).resolves.toMatchObject({
      id: 1,
      title: expect.any(String),
      done: true,
    });
  });

  it('should mark one task as pending', async () => {
    await expect(controller.markPending(1)).resolves.toMatchObject({
      id: 1,
      title: expect.any(String),
      done: false,
    });
  });

  it('should remove one task', async () => {
    await expect(controller.remove(1)).resolves.toMatchObject({
      raw: [],
      affected: 1,
    });
  });
});
