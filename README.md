# clean-arq-auth-api

This is a study Authentication NodeJS API project developed using some aspects of the Clean Code, Test Driven Development, Hexagonal Architecture, Clean Architecture, SOLID principles, and Domain-Driven Design. It is not a production-ready project, but it is one way of practice these concepts in a real-world project.

## How to run

In order to run this project you can check all the available commands at the `package.json` file running the following command:

```bash
yarn run
```

### Running tests

The tests were created using the [Vitest](https://vitest.dev/) and by now it cannot differentiate glob files so, when running tests it will run the Unit Tests and End-to-end tests at the same batch. For doing that it's being used the [Docker Compose](https://docs.docker.com/compose/) to start the database and `run all tests`. You can run the tests using the following command:

```bash
yarn dtw # `dt` stands for Docker Test and `w` stands for Watch
```

You can also run the `coverage tests` using the following command:

```bash
yarn dtc # `dt` stands for Docker Test and `c` stands for Coverage
```

### Running the project locally

You can run this project using the [Docker Composer](https://docs.docker.com/compose/) or running the commands available at the . Just run the following command:

```bash
docker-compose up # or yarn dev
```

**Hint**: when you stop to work on the project you can run the following command to stop the containers:

```bash
yarn dsa # `d` stands for Docker and `sa` stands for Stop All
```

## Technologies

- [NodeJS](https://nodejs.org/en/)
- [ExpressJS](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Docker](https://www.docker.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [KnexJS](http://knexjs.org/)
- [Vitest](https://vitest.dev/)
- [Cypress](https://www.cypress.io/) (coming soon)

## Features Available

Some features will become available as the project evolves. The following list shows the features that are already available:

- [x] Sign Up
- [x] Sign In
- [x] Sign Out
- [x] Verify Token
- [x] Refresh Token
- [x] Reset Password
- [x] Change Password
- [ ] Update User
- [ ] Delete User (soft)
- [x] Get Me
- [x] List Users
- [x] Detail User

Disclaimer: This is not a production ready project so use it to study and get some ideas. Also, there are good ways to implement authentication and authorization in your project using the well know services as [Auth0](https://auth0.com), [AWS Cognito](https://aws.amazon.com/cognito/), [Okta](https://www.okta.com/products/authentication/) and other SASS services that have their business dedicated to manage users

I hope you enjoy it and feel free to contribute to this project

---

Have a good one :wink:
