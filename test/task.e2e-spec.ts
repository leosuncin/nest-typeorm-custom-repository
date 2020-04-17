import {
  HttpStatus,
  INestApplication,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { matchers } from 'jest-json-schema';
import * as supertest from 'supertest';
import { bool, build, fake } from 'test-data-bot';

import { AppModule } from '../src/app.module';
import { TaskService } from '../src/task/task.service';

const taskBuilder = build('task').fields({
  title: fake(f => f.lorem.words(5)),
  done: bool(),
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

  beforeEach(async () => {
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

  afterEach(async () => await app.close());

  it('list all the tasks', () =>
    expect(
      request
        .get('/task')
        .expect(HttpStatus.OK)
        .then(resp => resp.body),
    ).resolves.toMatchSchema(tasksSchema));

  it('list all done tasks', async () => {
    const { body: tasks } = await request
      .get('/task/done')
      .expect(HttpStatus.OK);

    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.reduce((prev, curr) => prev && curr.done, true)).toBeTruthy();
  });

  it('list all pending tasks', async () => {
    const { body: tasks } = await request
      .get('/task/pending')
      .expect(HttpStatus.OK);

    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.reduce((prev, curr) => prev || curr.done, false)).toBeFalsy();
  });

  it.each(taskIds)('get task with id of %d', id =>
    expect(
      request
        .get(`/task/${id}`)
        .expect(HttpStatus.OK)
        .then(resp => resp.body),
    ).resolves.toMatchSchema(taskSchema),
  );

  it.each(Array.from({ length: 3 }, () => taskBuilder()))(
    'create a new task with %p',
    newTask =>
      expect(
        request
          .post('/task')
          .send(newTask)
          .expect(HttpStatus.CREATED)
          .then(resp => resp.body),
      ).resolves.toMatchSchema(taskSchema),
  );

  it.each(taskIds)('update task with id of %d', async id =>
    expect(
      request
        .put(`/task/${id}`)
        .send(taskBuilder())
        .expect(HttpStatus.OK)
        .then(resp => resp.body),
    ).resolves.toMatchSchema(taskSchema),
  );

  it('mark as done a task', async () => {
    const task = await taskService.create(taskBuilder({ done: false }));

    const { body } = await request
      .patch(`/task/${task.id}/done`)
      .expect(HttpStatus.OK);

    expect(body).toMatchSchema(taskSchema);
    expect(body.done).toBe(true);
  });

  it('mark as pending a task', async () => {
    const task = await taskService.create(taskBuilder({ done: true }));

    const { body } = await request
      .patch(`/task/${task.id}/pending`)
      .expect(HttpStatus.OK);

    expect(body).toMatchSchema(taskSchema);
    expect(body.done).toBe(false);
  });

  it('remove a task', async () => {
    const task = await taskService.create(taskBuilder());

    await request.delete(`/task/${task.id}`).expect(HttpStatus.NO_CONTENT);
    await expect(taskService.get(task.id)).rejects.toThrow(NotFoundException);
  });
});
