# Coup Online

[Play Game](https://coup-game-online.vercel.app)

## Overview
The frontend is a `React` web application. The app talks to the backend `Express` server via the `WebSockets` protocol, falling back to the `HTTPS` protocol if the socket connection fails. The game state is stored in a cloud `Redis` database.

## Deployments
Deployments are mostly automated, with the exception of the socket server which needs to be manually restarted as of when this documentation was written.

## Environment Variables
- EXPRESS_PORT
- REDIS_CONNECTION_STRING
- REACT_APP_API_BASE_URL
- REACT_APP_SOCKET_SERVER_URL
- REACT_APP_SOCKET_SERVER_PATH

## Running Locally

### Install packages
```sh
pnpm i
```

### Run Server
```sh
pnpm --prefix server dev
```

### Run Client
```sh
pnpm --prefix client start
```

### Run Server Tests
*Server needs to be running for integration tests*
```sh
pnpm --prefix server test
```

### Run Client Tests
```sh
pnpm --prefix client test
```
