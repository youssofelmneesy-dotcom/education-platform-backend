# Authentication APIs

## Module Overview

Responsible for user authentication, authorization, sessions, and account security.

Base Route

```
/api/v1/auth
```

---

# Register

POST

```
/auth/register
```

Body

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

Response

201 Created

---

# Login

POST

```
/auth/login
```

Body

```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

Response

```json
{
  "accessToken": "",
  "refreshToken": ""
}
```

---

# Refresh Token

POST

```
/auth/refresh
```

---

# Logout

POST

```
/auth/logout
```

---

# Forgot Password

POST

```
/auth/forgot-password
```

---

# Reset Password

POST

```
/auth/reset-password
```

---

# Verify Email

POST

```
/auth/verify-email
```

---

# Send OTP

POST

```
/auth/send-otp
```

---

# Verify OTP

POST

```
/auth/verify-otp
```

---

# Change Password

POST

```
/auth/change-password
```

Requires Login

---

# Enable 2FA

POST

```
/auth/2fa/enable
```

---

# Disable 2FA

POST

```
/auth/2fa/disable
```

---

# Get Active Sessions

GET

```
/auth/sessions
```

---

# Logout Specific Session

DELETE

```
/auth/sessions/:id
```

---

# Logout All Devices

DELETE

```
/auth/logout-all
```

---

# Trusted Devices

GET

```
/auth/devices
```

---

# Remove Trusted Device

DELETE

```
/auth/devices/:id
```

---

# Login History

GET

```
/auth/login-history
```

---

# Authentication Flow

Register

↓

Verify Email

↓

Login

↓

Receive JWT

↓

Access Protected APIs

↓

Refresh Token

↓

Logout

---