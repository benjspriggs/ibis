# ibis

[![Build Status](https://travis-ci.com/benjspriggs/ibis.svg?branch=master)](https://travis-ci.com/benjspriggs/ibis) [![Greenkeeper badge](https://badges.greenkeeper.io/benjspriggs/ibis.svg)](https://greenkeeper.io/)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![Maintainability](https://api.codeclimate.com/v1/badges/5038dc9614b67db2b27f/maintainability)](https://codeclimate.com/github/benjspriggs/ibis/maintainability)

Serves an old app via node: <http://ouribis.com>.

## get started

Install all packages (examples assume `npm`):

```bash
npm i
```

Build:

```bash
npm run build
```

Start the app:

```bash
npm start
```

This project assumes that you have a copy of the old IBIS app, which you can drop in `packages` to have `ibis-api` pick up all the sources, and cache them in our own format.

The app starts on <http://localhost:8080> by default, and the api starts on <http://localhost:3000>. Both of these are respectively configurable via:

| environment variable | what it configures | default |
|-|-|-|
| `APP_HOSTNAME` | The hostname for `ibis-app` | `'localhost'` |
| `APP_PORT` | The port for `ibis-app` | `8080` |
| `API_HOSTNAME` | The hostname for `ibis-api` | `'localhost'` |
| `API_PORT` | The port for `ibis-api` | `3000` |

These are both initially configured in `config.ts` for both packages.

## architecture

Each project in [`packages`](packages/) is a component of this app. `ibis-lib` holds common code between `ibis-api` and `ibis-app`, the frontend and backend respectively.

Each project uses `gulp` to automate build processes, and `dist/` is generally the folder where built artefacts go.

## packaging

This project uses `pkg` to create an executable that anyone can run, without installing `node`:

```bash
npm run pkg
```

Make sure that you've built everything (`npm run build`) before running this.
