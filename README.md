# Coup Online

## [Play Game](https://coupgame.com)

## Overview
The frontend is a `React` web application. The app talks to the backend `Express` server via the `WebSockets` protocol, falling back to the `HTTPS` protocol if the socket connection fails. The game state is stored in a cloud `Redis` database.

## Internationalization
New languages can be defined by doing the following:
  - Define the new language here: [availableLanguages.ts](./client/src/i18n/availableLanguages.ts)
  - Add translations for the new language here: [translations.ts](./client/src/i18n/translations.ts)


## Deployments
Deployments are automated. To deploy a new version of the game, simply create a new [Release](https://github.com/lounsbrough/coup-online/releases).

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
pnpm cypress open
```
