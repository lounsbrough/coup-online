# Coup Online

## [Play Game](https://coupgame.com)

## Overview

A real-time multiplayer implementation of the card game [Coup](https://grokipedia.com/page/coup_board_game). The frontend is a `React` web application built with `Material UI` and `Vite`. The app communicates with the backend `Express` server via the `WebSocket` protocol (using `Socket.IO`), falling back to the `HTTPS` protocol if the socket connection fails. Game state is stored in a `Redis` database. Authentication is handled via `Firebase` (Google sign-in).

### Features

- Real-time multiplayer gameplay with WebSocket communication
- AI opponents with strategic decision-making
- In-game chat
- User profiles and leaderboard
- Multi-language support
- QR code game invites

## Project Structure

This is a `pnpm` monorepo with three packages:

- **client** — React 19 single-page application
- **server** — Express 5 API and Socket.IO server
- **shared** — TypeScript types, game logic, and helpers used by both client and server

## Internationalization

New languages can be added by doing the following:

1. Define the new language in [shared/i18n/availableLanguages.ts](./shared/i18n/availableLanguages.ts)
2. Add client translations in [client/src/i18n/translations.ts](./client/src/i18n/translations.ts)
3. Add server translations in [server/src/i18n/translations.ts](./server/src/i18n/translations.ts)

## Deployments

Deployments are automated. To deploy a new version of the game, simply create a new [Release](https://github.com/lounsbrough/coup-online/releases).

## Environment Variables

### Server

| Variable                       | Description                         | Default |
| ------------------------------ | ----------------------------------- | ------- |
| `EXPRESS_PORT`                 | Port the server listens on          | `8008`  |
| `REDIS_CONNECTION_STRING`      | Redis connection URL                | —       |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Firebase Admin service account JSON | —       |
| `FIREBASE_PROJECT_ID`          | Firebase project ID                 | —       |

### Client

| Variable                            | Description                  | Default                 |
| ----------------------------------- | ---------------------------- | ----------------------- |
| `VITE_API_BASE_URL`                 | Server API URL               | `http://localhost:8008` |
| `VITE_SOCKET_SERVER_URL`            | WebSocket server URL         | `http://localhost:8008` |
| `VITE_SOCKET_SERVER_PATH`           | WebSocket path               | `""`                    |
| `VITE_FIREBASE_API_KEY`             | Firebase API key             | —                       |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Firebase auth domain         | —                       |
| `VITE_FIREBASE_PROJECT_ID`          | Firebase project ID          | —                       |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Firebase storage bucket      | —                       |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | —                       |
| `VITE_FIREBASE_APP_ID`              | Firebase app ID              | —                       |

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

_Server needs to be running for integration tests_

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
