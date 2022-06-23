# 🗄️ Nest.js + TypeORM with a Custom Repository

[![MegaLinter](https://github.com/leosuncin/nest-typeorm-custom-repository/workflows/MegaLinter/badge.svg?branch=master)](https://github.com/leosuncin/nest-typeorm-custom-repository/actions/workflows/mega-linter.yml)
[![Tests](https://github.com/leosuncin/nest-typeorm-custom-repository/workflows/Tests/badge.svg?branch=master)](https://github.com/leosuncin/nest-typeorm-custom-repository/actions/workflows/tests.yml)
![Prettier](https://img.shields.io/badge/Code%20style-prettier-informational?logo=prettier&logoColor=white)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![HitCount](https://hits.dwyl.com/leosuncin/nest-typeorm-custom-repository.svg)](https://hits.dwyl.com/leosuncin/nest-typeorm-custom-repository)

> An example of how to use a custom repository of TypeORM within Nest.js  
> **🚨 NOTICE 🚨** this example works with TypeORM v0.2.x and @nestjs/typeorm <= v8.0.3

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

## Features

- [TypeORM](https://typeorm.io/) with custom repository
- Unit tests and E2E tests
- Check code quality with [MegaLinter](https://megalinter.github.io/latest/)
- Run tests with [github actions](.github/workflows/tests.yml)

## Run Locally

Clone the project

```bash
  git clone https://github.com/leosuncin/nest-typeorm-custom-repository.git
```

Go to the project directory

```bash
  cd nest-typeorm-custom-repository
```

Install dependencies

```bash
  yarn install
```

Start the server

```bash
  yarn start:dev
```

## Running Tests

To run unit tests, run the following command:

```bash
  pnpm test
```

To run e2e tests (the MySQL instance must be available), run the following command:

```bash
  pnpm test:e2e
```

## Tech Stack

**Server:** Typescript, SQLite, Nest.js, TypeORM

**Test:** Jest, SuperTest

## Author

👤 **Jaime Leonardo Suncin Cruz**

- Twitter: [@jl_suncin](https://twitter.com/jl_suncin)
- Github: [@leosuncin](https://github.com/leosuncin)
- LinkedIn: [@jaimesuncin](https://linkedin.com/in/jaimesuncin)<!-- markdown-link-check-disable-line -->

## Show your support

Give a ⭐️ if this project helped you!

## Related

Here are some more example projects with Nest.js

[![Authentication example](https://github-readme-stats.vercel.app/api/pin/?username=leosuncin&repo=nest-auth-example)](https://github.com/leosuncin/nest-auth-example)

[![API example](https://github-readme-stats.vercel.app/api/pin/?username=leosuncin&repo=nest-api-example)](https://github.com/leosuncin/nest-api-example)

[![GraphQL example](https://github-readme-stats.vercel.app/api/pin/?username=leosuncin&repo=nest-graphql-example)](https://github.com/leosuncin/nest-graphql-example)

## License

Release under the terms of [MIT](./LICENSE)
