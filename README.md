# TZR — Fachportal für frühkindliche Bildung

A full-stack CMS blog platform for early childhood educators aligned with the **Berliner Bildungsprogramm für Kitas und Kindertagespflege (BBP)**.

## Tech Stack

- **Backend:** Spring Boot 3 (Java 21), Spring Data JPA, Spring Security (JWT), H2/PostgreSQL
- **Frontend:** Angular 19 (standalone components), SCSS, ngx-quill
- **Build:** Maven 3.8+, Node 22, npm 11+

## Project Structure

```
tzr/
├── backend/          # Spring Boot REST API
├── frontend/         # Angular SPA
├── .github/          # CI/CD workflows
└── README.md
```

## Development Setup

### Prerequisites

- Java 21+
- Maven 3.8+
- Node 22+
- npm 11+
- Angular CLI (`npm install -g @angular/cli`)

### Backend

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

- API: http://localhost:8080
- H2 Console: http://localhost:8080/h2-console (JDBC URL: `jdbc:h2:mem:tzr`)

### Frontend

```bash
cd frontend
npm install
ng serve --proxy-config proxy.conf.json
```

- App: http://localhost:4200
- Admin: http://localhost:4200/admin

### Default Admin Credentials

- Username: `admin`
- Password: `tzr2026`

## API Overview

### Public Endpoints (no auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/articles` | Paginated published articles |
| GET | `/api/public/articles/{slug}` | Article by slug |
| GET | `/api/public/articles/featured` | Featured article |
| GET | `/api/public/articles/search?q=` | Full-text search |
| GET | `/api/public/categories` | All categories |
| GET | `/api/public/categories/{slug}` | Category details |
| GET | `/api/public/authors/{slug}` | Author details |
| GET | `/api/public/tags/{slug}` | Articles by tag |
| POST | `/api/public/newsletter` | Subscribe to newsletter |

### Auth Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login → JWT token |
| POST | `/api/auth/refresh` | Refresh token |
| GET | `/api/auth/me` | Current user info |

### Admin Endpoints (JWT required)

All endpoints under `/api/admin/**` require `Authorization: Bearer <token>`.

- `/api/admin/articles` — Full article CRUD
- `/api/admin/categories` — Category management
- `/api/admin/authors` — Author management
- `/api/admin/tags` — Tag management
- `/api/admin/dashboard/stats` — Dashboard statistics

## Seed Data

On first run with dev profile, the application seeds:
- 1 admin user (admin/tzr2026)
- 12 categories (6 Bildungsbereiche + 6 Querschnittsaufgaben)
- 3 authors
- 22 articles (10 practice + 12 academic)
- 26 tags

## Production Deployment

**Production URL:** https://tzr.zuacaldeira.com
**Contact:** tzr@zuacaldeira.com

### Automated Deployment (CI/CD)

Pushing a version tag triggers the full pipeline:

```bash
git tag v1.1.0 && git push origin v1.1.0
```

1. GitHub Actions builds the Docker image and pushes to GHCR
2. SSHs into the VPS and deploys the new version
3. Sets up / renews the Let's Encrypt SSL certificate via certbot
4. Verifies container health

**Required GitHub Actions secrets:**
- `SSH_PRIVATE_KEY` — SSH key for VPS access

### Docker (recommended)

```bash
# Build and run with Docker Compose (includes PostgreSQL)
docker compose up -d

# App available at http://localhost:8080
```

### Docker image only

```bash
# Build the image
docker build -t tzr-blog .

# Run with external PostgreSQL
docker run -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DB_HOST=your-db-host \
  -e DB_USER=tzr \
  -e DB_PASSWORD=your-password \
  -e JWT_SECRET=your-256-bit-secret \
  tzr-blog
```

### GitHub Container Registry

A Docker image is automatically built and pushed to GHCR on version tags:

```bash
docker pull ghcr.io/zuacaldeira/tzr:latest
```

### Manual build

```bash
# Build Angular
cd frontend && ng build --configuration production

# Copy to Spring Boot static resources
cp -r dist/frontend/browser/* ../backend/src/main/resources/static/

# Build fat JAR
cd ../backend && ./mvnw clean package -DskipTests

# Run
DB_HOST=db DB_USER=tzr DB_PASSWORD=secret JWT_SECRET=<256-bit-key> \
  java -jar target/tzr-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SPRING_PROFILES_ACTIVE` | Yes | — | Set to `prod` for production |
| `DB_HOST` | Yes (prod) | `localhost` | PostgreSQL host |
| `DB_PORT` | No | `5432` | PostgreSQL port |
| `DB_NAME` | No | `tzr` | Database name |
| `DB_USER` | Yes (prod) | — | Database username |
| `DB_PASSWORD` | Yes (prod) | — | Database password |
| `JWT_SECRET` | Yes (prod) | — | JWT signing key (min 256 bits) |
| `PORT` | No | `8080` | Server port |

## Branch Protection (Recommended)

- Require CI to pass before merging to main
- Require PR reviews

## License

Private — All rights reserved.
