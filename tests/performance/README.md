# Performance Tests

This folder contains the k6 scripts used to exercise the auth endpoints under smoke, load, stress, and spike conditions.

## Scripts
- `auth.register.k6.js`
- `auth.login.k6.js`
- `auth.refresh.k6.js`
- `auth.logout.k6.js`
- `shared.js`

## Notes
- The scripts target the local API server from `env.test`.
- Thresholds enforce `p(95) < 500ms` and error rate below `1%`.
- Login, refresh, and logout scripts bootstrap valid credentials before calling the endpoint under test.
