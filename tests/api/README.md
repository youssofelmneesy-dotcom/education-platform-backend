# API Testing

This folder documents the Postman/Newman API suite.

## Collection Files

- `postman/Education Platform API.postman_collection.json`
- `postman/Education Platform Local.postman_environment.json`

## Coverage

The collection is generated from the verified OpenAPI document and covers the routed API surface across Auth, Users, Profiles, Roles, Permissions, Categories, Tags, Courses, Lessons, Lesson Attachments, Videos, Student Learning, Question Bank, Assessments, Learning Operations, and Commerce.

## What the collection validates
- Status codes
- Response headers and `Content-Type`
- Response schema and returned fields
- Error responses
- JWT presence and structure
- Cookie absence for the current auth flow
- Response time
- Token extraction and chaining across requests

Run:

```bash
npm run test:api
npm run test:api:html
```
