## Installation

```bash
npm install
```

## Running the app

# Prerequisite
Spin up resources in `docker-compose.local.yml` file first
```bash
docker compose -f docker-compose.local.yml up -d
```

Note: if this is the first time you run the application, you need to run the following command to create tables
```bash
npm run migration:run
```

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Test

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## How to create a new database migration

Execute the following command
```bash
npx prisma migrate dev --name $migration_name
```

## TODO

[ ]  Detect significant changed volume

## Diagnostic

### PrismaClientKnownRequestError:

This error can be resolved by running the following commands
```bash
npm run migration:run
npm run prisma:generate
```

## TODO

- [ ] Add the module to analyze the ticker data before they break the volume, so that we can buy earlier
- [ ] Check the bad ticker in the market like they can't do the transaction. For example: LUT
