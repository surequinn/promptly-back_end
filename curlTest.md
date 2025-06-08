# API Curl Test Commands

Below are example curl commands for testing the API endpoints. Most endpoints require Clerk authentication. Replace `YOUR_CLERK_JWT` with a valid session token.

---

## Health Route

### GET /api/health

```sh
curl -X GET http://localhost:3001/api/health
```

---

## Users Routes

### GET /api/users/profile

(Requires Clerk authentication)

```sh
curl -X GET http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer YOUR_CLERK_JWT"
```

### PUT /api/users/profile

(Requires Clerk authentication)

```sh
curl -X PUT http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer YOUR_CLERK_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "age": 30,
    "gender": "male",
    "orientation": "straight",
    "selectedVibes": ["funny", "adventurous"],
    "interests": ["reading", "hiking"],
    "uniqueInterest": "skydiving",
    "profileCompleted": true
  }'
```

---

## Prompts Routes

### POST /api/prompts/generate

(Requires Clerk authentication)

```sh
curl -X POST http://localhost:3001/api/prompts/generate \
  -H "Authorization: Bearer YOUR_CLERK_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "fun",
    "responseText": "Tell me a joke.",
    "promptType": "GENERATED"
  }'
```

### GET /api/prompts/user

(Requires Clerk authentication)

```sh
curl -X GET http://localhost:3001/api/prompts/user \
  -H "Authorization: Bearer YOUR_CLERK_JWT"
```

### PUT /api/prompts/:promptId

(Requires Clerk authentication, replace `:promptId` with a real prompt ID)

```sh
curl -X PUT http://localhost:3001/api/prompts/<promptId> \
  -H "Authorization: Bearer YOUR_CLERK_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "responseText": "This is my edited prompt."
  }'
```

---

**Note:**

- Replace `YOUR_CLERK_JWT` with a valid Clerk JWT token.
- Replace `<promptId>` with the actual prompt ID you want to update.
- The server is assumed to be running locally on port 3001.
