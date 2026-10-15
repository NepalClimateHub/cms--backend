# NCH CMS Backend


## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS (TypeScript) |
| ORM | Prisma 6 |
| Database | PostgreSQL 16 |
| Auth | JWT (RS256) |
| Storage | ImageKit |
| Package manager | npm |

## Prerequisites

- Node.js ≥ 18
- npm
- PostgreSQL 16 (or Docker + Docker Compose)

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/NepalClimateHub/cms--backend.git
cd cms--backend
npm install
```

### 2. Configure environment

```bash
cp .env.template .env
```

Edit `.env` with your values:

| Variable | Description |
|---|---|
| `APP_ENV` | `development` or `production` |
| `APP_PORT` | Server port (default `8080`) |
| `DB_URL` | PostgreSQL connection string (`postgresql://user:pass@localhost:5432/nch_cms_db`) |
| `JWT_PUBLIC_KEY_BASE64` | RS256 public key (base64 encoded) |
| `JWT_PRIVATE_KEY_BASE64` | RS256 private key (base64 encoded) |
| `IMAGEKIT_PUB_KEY` | ImageKit public key |
| `IMAGEKIT_PVT_KEY` | ImageKit private key |
| `IMAGEKIT_ENDPOINT` | ImageKit URL endpoint |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Email (SMTP) credentials |
| `RAG_SERVICE_URL` | NCH Climate Assistant URL (default: `http://127.0.0.1:8000`) |
| `FRONTEND_BASE_URL` | CMS Frontend URL (default: `http://localhost:5173`) |
| `WEBSITE_BASE_URL` | Public website URL |

### 3. Run database migrations

```bash
npm run migrate:dev
```

### 4. (Optional) Seed the database

```bash
npm run migrate:seed
```

### 5. Start the development server

```bash
npm run dev
```

The API will be available at `http://localhost:8080` and Swagger docs at `http://localhost:8080/api`.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with watch mode |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run migrate:dev` | Run Prisma migrations (development) |
| `npm run migrate:seed` | Seed the database |
| `npm test` | Run unit tests |
| `npm run doc:serve` | Browse API docs locally |

## Running with Docker

```bash
docker-compose up -d
```

This starts the NestJS API on port `3111` (maps to internal `8080`) alongside PostgreSQL 16. Watchtower is included for automatic image updates in production.

## Related Services

| Service | Port | Repository |
|---|---|---|
| CMS Frontend | 5173 | [cms--frontend](https://github.com/NepalClimateHub/cms--frontend) |
| NCH Climate Assistant | 8000 | [NCH-Climate-Assistant](https://github.com/NepalClimateHub/NCH-Climate-Assistant) |

## Contributing

Contributions are welcome. Please open an issue first to discuss what you would like to change.

## License

MIT License — see [LICENSE](./LICENSE) for details.
