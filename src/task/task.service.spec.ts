import { faker } from '@faker-js/faker';
import { bool, build, perBuild, sequence } from '@jackfranklin/test-data-bot';
import { Test, TestingModule } from '@nestjs/testing';

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
});
const MockRepository = jest.fn().mockImplementation(() => {
  const tasks = Array.from({ length: 10 }, () => taskBuilder());

  return {
    find() {
      return Promise.resolve(tasks);
    },
    findDone() {
      return Promise.resolve(tasks.filter((t) => t.done));
    },
    findPending() {
      return Promise.resolve(tasks.filter((t) => !t.done));
    },
    findOne(id) {
      return Promise.resolve(
        id < 1 ? null : taskBuilder({ map: (t) => ({ ...t, id }) }),
      );
    },
    create(dto) {
      return { ...dto, done: false };
    },
    save(dto) {
      return Promise.resolve(taskBuilder({ map: (t) => ({ ...t, ...dto }) }));
    },
    delete(id) {
      return Promise.resolve({ raw: [], affected: id < 1 ? 0 : 1 });
    },
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
    expect(Array.isArray(await service.findAll())).toBeTruthy();
  });

  it('should list all done', async () => {
    expect(
      (await service.findAllDone()).reduce(
        (prev, curr) => prev && curr.done,
        true,
      ),
    ).toBeTruthy();
  });

  it('should list all pending', async () => {
    expect(
      (await service.findAllPending()).reduce(
        (prev, curr) => prev || curr.done,
        false,
      ),
    ).toBeFalsy();
  });

  it('should get one task', async () => {
    expect(await service.get(1)).toMatchObject({
      id: 1,
      title: expect.any(String),
      done: expect.any(Boolean),
    });
  });

  it('fail to get one task', () => {
    expect.assertions(1);
    expect(service.get(0)).rejects.toThrow();
  });

  it('should create one task', async () => {
    expect(await service.create({ title: 'Make a sandwich' })).toMatchObject({
      id: expect.any(Number),
      title: 'Make a sandwich',
      done: false,
    });
  });

  it('should update one task', async () => {
    expect(
      await service.update(1, { title: 'sudo make a sandwich' }),
    ).toMatchObject({
      id: 1,
      title: 'sudo make a sandwich',
      done: expect.any(Boolean),
    });
  });

  it('fail to update one task', () => {
    expect.assertions(1);
    expect(
      service.update(0, { title: 'sudo make a sandwich' }),
    ).rejects.toThrow();
  });

  it('should remove one task', async () => {
    expect(await service.remove(1)).toMatchObject({
      raw: [],
      affected: 1,
    });
  });
});
