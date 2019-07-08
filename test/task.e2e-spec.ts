import { INestApplication, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { build, fake, bool } from 'test-data-bot';
import * as supertest from 'supertest';
import { matchers } from 'jest-json-schema';

import { AppModule } from '../src/app.module';

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
  const tasks = [taskBuilder(), taskBuilder(), taskBuilder()];

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await moduleFixture.createNestApplication();
    await app.init();
    request = supertest(app.getHttpServer());
  });

  afterEach(async () => await app.close());

  it('list all the tasks', done => {
    request
      .get('/task')
      .expect(HttpStatus.OK)
      .end((err, resp) => {
        if (err) {
          return done(err);
        }
        expect(resp.body).toMatchSchema(tasksSchema);
        done();
      });
  });

  it('list all done tasks', done => {
    request
      .get('/task/done')
      .expect(HttpStatus.OK)
      .end((err, resp) => {
        if (err) {
          return done(err);
        }

        expect(
          resp.body.reduce((prev, curr) => prev && curr.done, true),
        ).toBeTruthy();
        done();
      });
  });

  it('list all pending tasks', done => {
    request
      .get('/task/pending')
      .expect(HttpStatus.OK)
      .end((err, resp) => {
        if (err) {
          return done(err);
        }

        expect(
          resp.body.reduce((prev, curr) => prev || curr.done, false),
        ).toBeFalsy();
        done();
      });
  });

  it('get one task', done => {
    request
      .get('/task/1')
      .expect(HttpStatus.OK)
      .end((err, resp) => {
        if (err) {
          return done(err);
        }

        expect(resp.body).toMatchSchema(taskSchema);
        done();
      });
  });

  it('create a new task', done => {
    request
      .post('/task')
      .send(taskBuilder())
      .expect(HttpStatus.CREATED)
      .end((err, resp) => {
        if (err) {
          return done(err);
        }

        expect(resp.body).toMatchSchema(taskSchema);
        done();
      });
  });

  it('update an existing task', done => {
    request
      .post('/task')
      .send(taskBuilder())
      .expect(HttpStatus.CREATED)
      .end((err, { body: task }) => {
        if (err) {
          return done(err);
        }

        request
          .put(`/task/${task.id}`)
          .send(taskBuilder())
          .expect(HttpStatus.OK)
          .end((error, resp) => {
            if (error) {
              return done(error);
            }

            expect(resp.body).toMatchSchema(taskSchema);
            expect(resp.body.title).not.toBe(task.title);
            done();
          });
      });
  });

  it('mark as done a task', done => {
    request
      .post('/task')
      .send(taskBuilder({ done: false }))
      .expect(HttpStatus.CREATED)
      .end((err, { body: task }) => {
        if (err) {
          return done(err);
        }

        request
          .patch(`/task/${task.id}/done`)
          .expect(HttpStatus.OK)
          .end((error, resp) => {
            if (error) {
              return done(error);
            }

            expect(resp.body).toMatchSchema(taskSchema);
            expect(resp.body.done).toBeTruthy();
            done();
          });
      });
  });

  it('mark as pending a task', done => {
    request
      .post('/task')
      .send(taskBuilder({ done: true }))
      .expect(HttpStatus.CREATED)
      .end((err, { body: task }) => {
        if (err) {
          return done(err);
        }

        request
          .patch(`/task/${task.id}/pending`)
          .expect(HttpStatus.OK)
          .end((error, resp) => {
            if (error) {
              return done(error);
            }

            expect(resp.body).toMatchSchema(taskSchema);
            expect(resp.body.done).toBeFalsy();
            done();
          });
      });
  });

  it('remove a task', done => {
    request
      .post('/task')
      .send(taskBuilder())
      .expect(HttpStatus.CREATED)
      .end((err, { body: task }) => {
        if (err) {
          return done(err);
        }

        request
          .delete(`/task/${task.id}`)
          .expect(HttpStatus.NO_CONTENT)
          .end(done);
      });
  });
});
