import { faker } from '@faker-js/faker';
import { bool, build, perBuild } from '@jackfranklin/test-data-bot';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { matchers } from 'jest-json-schema';
import * as supertest from 'supertest';

import { AppModule } from '../src/app.module';
import { Task } from '../src/task/task.entity';
import { TaskService } from '../src/task/task.service';

const taskBuilder = build<Pick<Task, 'title' | 'done'>>('Task', {
  fields: {
    title: perBuild(() => faker.lorem.words(5)),
    done: bool(),
  },
});
const taskSchema = {
  title: 'task',
  type: 'object',
  required: ['title', 'done'],
  properties: {
    id: {
      type: 'integer',
    },
    title: {
      type: 'string',
    },
    done: {
      type: 'boolean',
    },
    createdAt: {
      type: 'string',
      // 2019-07-08T17:47:35.000Z
      pattern: '^\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d.\\d{3}Z$',
    },
    updatedAt: {
      type: 'string',
      pattern: '^\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d.\\d{3}Z$',
    },
  },
  additionalProperties: false,
};
const tasksSchema = {
  type: 'array',
  minItems: 0,
  items: taskSchema,
};

expect.extend(matchers);

describe('TaskController (e2e)', () => {
  let app: INestApplication;
  let request: supertest.SuperTest<supertest.Test>;
  let taskService: TaskService;
  const taskIds = [1, 2, 3];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await moduleFixture.createNestApplication();
    await app.init();
    taskService = app.get(TaskService);
    await Promise.all(
      Array.from({ length: 3 }, () => taskService.create(taskBuilder())),
    );
    request = supertest(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  it('list all the tasks', async () => {
    await request
      .get('/task')
      .expect(HttpStatus.OK)
      .expect(({ body }) => {
        expect(body).toMatchSchema(tasksSchema);
      });
  });

  it('list all done tasks', async () => {
    await request
      .get('/task/done')
      .expect(HttpStatus.OK)
      .expect(({ body }) => {
        expect(body).toMatchSchema(tasksSchema);
        expect(body.every((task) => task.done)).toBe(true);
      });
  });

  it('list all pending tasks', async () => {
    await request
      .get('/task/pending')
      .expect(HttpStatus.OK)
      .expect(({ body }) => {
        expect(body).toMatchSchema(tasksSchema);
        expect(body.every((task) => !task.done)).toBe(true);
      });
  });

  it.each(taskIds)('get task with id of %d', async (id) => {
    await request
      .get(`/task/${id}`)
      .expect(HttpStatus.OK)
      .expect(({ body }) => {
        expect(body).toMatchSchema(taskSchema);
      });
  });

  it.each(Array.from({ length: 3 }, () => taskBuilder()))(
    'create a new task with %p',
    async (newTask) => {
      await request
        .post('/task')
        .send(newTask)
        .expect(HttpStatus.CREATED)
        .expect(({ body }) => {
          expect(body).toMatchSchema(taskSchema);
        });
    },
  );

  it.each(taskIds)('update task with id of %d', async (id) => {
    await request
      .put(`/task/${id}`)
      .send(taskBuilder())
      .expect(HttpStatus.OK)
      .expect(({ body }) => {
        expect(body).toMatchSchema(taskSchema);
      });
  });

  it('mark as done a task', async () => {
    const task = await taskService.create(
      taskBuilder({ overrides: { done: false } }),
    );

    await request
      .patch(`/task/${task.id}/done`)
      .expect(HttpStatus.OK)
      .expect(({ body }) => {
        expect(body).toMatchSchema(taskSchema);
        expect(body.done).toBe(true);
      });
  });

  it('mark as pending a task', async () => {
    const task = await taskService.create(
      taskBuilder({ overrides: { done: true } }),
    );

    await request
      .patch(`/task/${task.id}/pending`)
      .expect(HttpStatus.OK)
      .expect(({ body }) => {
        expect(body).toMatchSchema(taskSchema);
        expect(body.done).toBe(false);
      });
  });

  it('remove a task', async () => {
    const task = await taskService.create(taskBuilder());

    await request.delete(`/task/${task.id}`).expect(HttpStatus.NO_CONTENT);
    await request.get(`/task/${task.id}`).expect(HttpStatus.NOT_FOUND);
  });
});
