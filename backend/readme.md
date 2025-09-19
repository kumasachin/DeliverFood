# Toptal Test Food Delivery BE

### Requirements

**Node.js Version:** This project requires Node.js version 18-20 (minimum: Node.js 18.x, maximum: Node.js 20.x)

### API Docs

Swagger API docs have been provided in `openapi.yaml` file.

### Running the server

Before first run, set up the database:

```
npm run db:reset
```

If necessary, you can use the command above to delete all data and reset the DB to pristine state as well.

Once DB has been set up, server can be booted up:

```
npm run start:dev
```

The API server will be running on port 3000

API docs are available on: http://localhost:3000/api-docs
