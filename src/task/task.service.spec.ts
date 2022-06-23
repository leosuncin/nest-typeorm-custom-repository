import { faker } from '@faker-js/faker';
import { bool, build, perBuild, sequence } from '@jackfranklin/test-data-bot';
import { Test, TestingModule } from '@nestjs/testing';

import type { TaskCreate } from './dto/task-create.dto';
import { Task } from './task.entity';
import { TaskRepository } from './task.repository';
import { TaskService } from './task.service';

const taskBuilder = build<Task>({
  fields: {
    id: sequence(),
    title: perBuild(() => faker.lorem.words(5)),
    done: bool(),
    createdAt: perBuild(() => new Date()),
    updatedAt: perBuild(() => new Date()),
  },
  postBuild(task) {
    return Object.assign(new Task(), task);
  },
});
const MockRepository = jest.fn().mockImplementation(() => {
  const tasks = Array.from({ length: 10 }, () => taskBuilder());

  return {
    find: jest.fn().mockResolvedValue(tasks),
    findDone: jest.fn().mockResolvedValue(tasks.filter((t) => t.done)),
    findPending: jest.fn().mockResolvedValue(tasks.filter((t) => !t.done)),
    findOne: jest
      .fn()
      .mockImplementation((id: number) =>
        Promise.resolve(id < 1 ? null : taskBuilder({ overrides: { id } })),
      ),
    create: jest
      .fn()
      .mockImplementation(({ title }: TaskCreate) =>
        taskBuilder({ overrides: { title, done: false } }),
      ),
    merge: jest.fn(Object.assign),
    save: jest
      .fn()
      .mockImplementation((dto) =>
        Promise.resolve(taskBuilder({ overrides: dto })),
      ),
    delete: jest.fn().mockResolvedValue({ raw: [], affected: 1 }),
  };
});

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TaskRepository,
          useClass: MockRepository,
        },
        TaskService,
      ],
    }).compile();
    service = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should list all', async () => {
    const tasks = await service.findAll();

    expect(Array.isArray(tasks)).toBe(true);
  });

  it('should list all done', async () => {
    const allDone = await service.findAllDone();

    expect(allDone.every((task) => task.done)).toBe(true);
  });

  it('should list all pending', async () => {
    const allPending = await service.findAllPending();

    expect(allPending.every((task) => !task.done)).toBe(true);
  });

  it('should get one task', async () => {
    await expect(service.get(1)).resolves.toMatchObject({
      id: 1,
      title: expect.any(String),
      done: expect.any(Boolean),
    });
  });

  it('fail to get one task', async () => {
    await expect(service.get(0)).rejects.toThrow();
  });

  it('should create one task', async () => {
    await expect(
      service.create({ title: 'Make a sandwich' }),
    ).resolves.toMatchObject({
      id: expect.any(Number),
      title: 'Make a sandwich',
      done: false,
    });
  });

  it('should update one task', async () => {
    await expect(
      service.update(1, { title: 'sudo make a sandwich' }),
    ).resolves.toMatchObject({
      id: 1,
      title: 'sudo make a sandwich',
      done: expect.any(Boolean),
    });
  });

  it('fail to update one task', async () => {
    await expect(
      service.update(0, { title: 'sudo make a sandwich' }),
    ).rejects.toThrow();
  });

  it('should remove one task', async () => {
    await expect(service.remove(1)).resolves.toMatchObject({
      raw: [],
      affected: 1,
    });
  });
});
