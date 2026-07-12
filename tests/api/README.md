# API Testing

This folder documents the Postman/Newman API suite for the authentication endpoints.

## Coverage
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

## What the collection validates
- Status codes
- Response headers and `Content-Type`
- Response schema and returned fields
- Error responses
- JWT presence and structure
- Cookie absence for the current auth flow
- Response time
- Token extraction and chaining across requests
