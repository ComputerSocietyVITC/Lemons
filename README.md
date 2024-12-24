# Hono API Template

The all in one hono api template with prisma, postgresql and minio s3 bucket setup. Includes a CI/CD pipeline to deploy to a VPS via a docker compose.

## Tech stack

- [Hono](https://hono.dev/) -> api framework
- [Prisma](https://www.prisma.io/) -> orm
- [Postgresql](https://www.postgresql.org/) -> database
- [Minio](https://min.io/) -> object storage bucket
- [Prettier](https://prettier.io/) -> code formatting
- [ESLint](https://eslint.org/) -> linter and code integrity checker
- [Zod](https://zod.dev/) -> typescript form validation
- [Husky](https://typicode.github.io/husky/) -> pre commit hooks

## Project Structure

```
.
├── docker-compose.yml
├── Dockerfile
├── eslint.config.js
├── init.sh
├── lint-staged.config.js
├── package.json
├── pnpm-lock.yaml
├── prisma
│   ├── migrations
│   │   └── migration_lock.toml
│   └── schema.prisma
├── README.md
├── src
│   ├── index.ts
│   ├── lib
│   │   ├── prisma-client.ts
│   │   └── s3-client.ts
│   ├── routes
│   │   └── auth
│   └── utils
│       └── passwords.ts
└── tsconfig.json
```

## Whats included

### Prisma Role Base Auth

The project includes a pre-configured Prisma schema for role-based authentication and user management. The schema defines two main models:

1. **Auth**: Handles authentication details.

- **id**: Unique identifier (UUID).
- **email**: Unique email for login.
- **password**: Encrypted password.
- **createdAt**: Timestamp when the record is created.
- **updatedAt**: Auto-updated timestamp when the record is modified.
- **user**: Relation to the User model (optional).

2. **User**: Represents user information and roles.

- **id**: Unique identifier (UUID).
- **authId**: Relation to the Auth model (UUID).
- **name**: User's name.
- **role**: Enum field representing the user role (ADMIN or USER).

example auth record

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "password": "encrypted-password",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T00:00:00.000Z",
  "user": {
    "id": "uuid",
    "authId": "uuid",
    "name": "John Doe",
    "role": "USER"
  }
}
```

### S3 Object Storage

**Functions**

1. `createDocument(file: File): Promise<string>`

Uploads a document to the MinIO server and returns a unique document ID.

- Parameters:
  - `file (File)`: The document to upload.
- Returns:
  - `Promise<string>`: A unique document ID (UUID) associated with the uploaded file.

```ts
const file = new File(["Hello, world!"], "example.txt", { type: "text/plain" });
const docId = await createDocument(file);
console.log("Uploaded document ID:", docId);
```

1. `readDocument(docId: string): Promise<{ data: Buffer; contentType: string; }>`

Retrieves a document from the MinIO server using its unique document ID.

- Parameters:
  `docId (string)`: The unique ID of the document.

- Returns:
  - `Promise<{ data: Buffer; contentType: string; }>`: An object containing:
    - `data (Buffer)`: The document's content.
    - `contentType (string)`: The MIME type of the document.

```ts
const doc = await readDocument(docId);
console.log("Document content type:", doc.contentType);
console.log("Document data:", doc.data.toString());
```

3. `deleteDocument(docId: string): Promise<void>`

Deletes a document from the MinIO server using its unique document ID.

- Parameters:

  - `docId (string)`: The unique ID of the document to delete.

- Returns:
  - `Promise<void>`: Resolves once the document is successfully deleted.

```ts
await deleteDocument(docId);
console.log("Document deleted successfully");
```

### Auth Routes

The authentication module provides routes for user login and registration, utilizing JWT for secure token generation and Prisma for database interactions.

**POST `/login`**

Authenticates a user and returns a JWT for accessing protected resources.

- **Request Body (JSON)**
  - `email (string)`: The user's email. Must be a valid email address.
  - `password (string)`: The user's password. Must be at least 8 characters.

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

- **Responses**
  - 200 OK
    - `token`: JWT for authenticated access.
    - `userId`: Unique identifier of the authenticated user.
  - 404 Not Found: User with the provided email does not exist.
  - 403 Forbidden: Password is incorrect.
  - 500 Internal Server Error: JWT secret is not set.

**POST `/register`**

Registers a new user by creating entries in the `Auth` and `User` models.

- **Request Body (JSON)**
  - `email (string)`: The user's email. Must be a valid email address.
  - `password (string)`: The user's password. Must be at least 8 characters.
  - `name (string)`: Full name of the user.
  - `role (string)`: Role of the user (ADMIN or USER).

```json
{
  "name": "John Doe",
  "role": "USER",
  "email": "user@example.com",
  "password": "securepassword"
}
```

- **Responses**
  - 201 Created
    - `message`: Confirmation of successful registration.
    - `user`: Basic user details (id and email).
  - 409 Conflict: User with the provided email already exists.

## Local Development

1. Create the .env file

```
JWT_SECRET=

POSTGRES_DB=
DATABASE_URL=postgres://postgres:postgres@localhost:5432/${POSTGRES_DB}?schema=public

MINIO_USE_SSL=false
MINIO_ROOT_USER=
MINIO_ROOT_PASSWORD=
MINIO_ACCESS_KEY= # openssl rand -base64 20
MINIO_SECRET_KEY= # openssl rand -base64 40
MINIO_BUCKET=
```

2. run `pnpm install`
3. run `pnpm run dev`

## Deployment

1. Create the `.env` file

```
JWT_SECRET=

POSTGRES_DB=
POSTGRES_USER=
POSTGRES_PASSWORD=
DATABASE_URL=postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public

MINIO_USE_SSL=false
MINIO_ROOT_USER=
MINIO_ROOT_PASSWORD=
MINIO_ACCESS_KEY= # openssl rand -base64 20
MINIO_SECRET_KEY= # openssl rand -base64 40
MINIO_BUCKET=

HONO_PORT=
MINIO_API_PORT=
MINIO_WEB_PORT=
POSTGRES_PORT=
```

The project comes with a docker compose file that can be put up on any [container management](https://www.portainer.io/) provider or just straight `docker compose up -d`

### For auto deployment via CI/CD

1. Set up a [self hosted github runner](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/adding-self-hosted-runners) and follow the instructions
2. Set up repository environment variables
   - copy the entire contents of `.env` into a single `ENV` titled repo environment variable, **not individual variables**
     (referenced here `echo "${{ secrets.ENV }}" > .env` which creates the env file on VPS for docker compose)

Now it should auto deploy every time something is pushed
