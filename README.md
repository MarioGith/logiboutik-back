# Logiboutik — API

REST API of Logiboutik (Express + MongoDB). The front-end lives in
[logiboutik-front](https://github.com/MarioGith/logiboutik-front).

## Run locally

```bash
cp .env.example .env          # then adjust MONGO_URL if needed
docker compose up -d          # local MongoDB 3.6 on port 27017
pnpm install
pnpm dev                      # compiles and restarts on change
```

## Scripts

| Command                | What it does                                                |
| ---------------------- | ----------------------------------------------------------- |
| `pnpm dev`             | Watch mode (tsc + nodemon)                                  |
| `pnpm build`           | Compiles `src/` to `dist/`                                  |
| `pnpm start`           | Runs the compiled API                                       |
| `pnpm lint`            | Type-check + ESLint                                         |
| `pnpm test`            | Unit tests; API tests too when `MONGO_URL_TEST` is set      |
| `pnpm migrate`         | Checks the database for old data problems (changes nothing) |
| `pnpm migrate --apply` | Also fixes the problems that can be fixed safely            |
| `pnpm restore <file>`  | Loads a backup file into an **empty** database              |

API tests need a throwaway MongoDB (it is wiped on every test):

```bash
docker run -d --rm --name logiboutik-test-mongo -p 27018:27017 --tmpfs /data/db mongo:3.6
MONGO_URL_TEST=mongodb://localhost:27018/logiboutik-test pnpm test
docker stop logiboutik-test-mongo
```

## Configuration

| Variable      | Default                     | Meaning                                  |
| ------------- | --------------------------- | ---------------------------------------- |
| `API_PORT`    | `3020`                      | Port the API listens on                  |
| `MONGO_URL`   | `mongodb://mongo/boutikdac` | MongoDB connection string                |
| `CORS_ORIGIN` | `http://localhost:3000`     | Allowed browser origins, comma-separated |

## Code layout

A request goes through four layers, one folder each:

```
router.ts        URL -> handler
handler/         reads the request, validates it, writes the response
validator/       turns request input into clean values or a 400 error
model/           business rules and database queries (throws HttpError)
schema/          Mongoose schemas = the shape of the data in MongoDB
```

`errors.ts` defines `HttpError`; any one thrown reaches the error middleware
in `app.ts` and becomes a `{ code, message }` JSON response. The front-end
translates `code` into a French message.

## Data model

Three collections:

| Collection     | Fields                                                             |
| -------------- | ------------------------------------------------------------------ |
| `shops`        | `name`                                                             |
| `articles`     | `name`, `price` (TTC, €), `shop` → shops                           |
| `transactions` | `article` → articles, `date`, `quantity` (> 0), `transaction_type` |

`transaction_type` is one of `deposite` (stock in — historical spelling, kept
on purpose), `sell` and `retrieve` (stock out). Stock is never stored: it is
always computed from the transactions (`model/calculations.ts`).

Deleting an article also deletes its transactions. A shop that still has
articles cannot be deleted.

## Endpoints

| Method | Path                                | Notes                                       |
| ------ | ----------------------------------- | ------------------------------------------- |
| GET    | `/article`, `/shop`, `/transaction` | Lists                                       |
| GET    | `/article/:id`                      | `{ details, historic, stock }`              |
| GET    | `/shop/:id`                         | `{ details, articles }`                     |
| GET    | `/transaction/:id`                  | `[transaction]` (one-element array, legacy) |
| POST   | `/article`, `/shop`, `/transaction` | Create                                      |
| POST   | `/article/:id`, ...                 | Update                                      |
| DELETE | `/article/:id`, ...                 | Delete                                      |
| GET    | `/stock`                            | Current stock per article                   |
| GET    | `/income?startDate&endDate`         | Sales per article in `[startDate, endDate)` |
| GET    | `/dashboard/sell`                   | Total quantity sold                         |
| GET    | `/dashboard/income`                 | Total sales amount                          |
| GET    | `/backup`                           | JSON dump of the whole database             |

> The API has no authentication: never expose it directly on the internet.

## Deployment

Pushing to `main` builds and publishes the `logiboutik-back:latest` Docker
image. Pull requests and `dev` only build it.
