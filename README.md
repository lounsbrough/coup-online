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

### Run Server
```sh
cd server
pnpm i
pnpm dev
```

### Run Client
```sh
cd client
pnpm i
pnpm start
```

### Run Server Tests
*Server needs to be running for integration tests*
```sh
cd server
pnpm test
```

### Run Client Tests
```sh
cd client
pnpm test
```
