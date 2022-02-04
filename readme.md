## Setup

Node v16.9.0

Clone the repository and setup **.env** file with following keys:

- *JWTSECRET*
- *DB_DEV_URL* -> Development mongo db
- *TWILIO_ACCOUNT_SID*
- *TWILIO_AUTH_TOKEN*
- *TWILIO_MESSAGE_SERVICE_SID*
- *DB_PROD_URL* -> Production mongo db
- *REDIS_HOST* -> Production redis
- *REDIS_PORT* -> Production redis

**NOTE**: By default in development mode localhost will be used for redis connection.

## Routes

All routes are under `/api/v1`

### Signup

`/api/v1/signup`
```
{
    "firstName": "Abc",
    "lastName": "Def",
    "email": "abcdef@live.com",
    "phone": "911122332211",
    "password": "pass123456"
}
```

### Signin

`/api/v1/signin`

Email & password sign-in
```
{
    "method": "EMAIL_SIGNIN",
    "email": "abc@live.com",
    "password": "pass123456"
}
```

Phone number & OTP based sign-in
```
{
    "method": "OTP_SIGNIN",
    "phone": "+911122332211",
    "otp": 590740
}
```

**Note**: Sign-in will be blocked if a reset password OTP has been requested and new password has not been set.

### Reset password

`/api/v1/request-otp`
Request an OTP on email or phone number. OTP is valid for 10 minutes.
```
{
    "phone": "911122332211",
    "source": "RESET_PASSWORD_OTP"
}
```
```
{
    "phone": "abc@gmail.com",
    "source": "RESET_PASSWORD_OTP"
}
```

`/api/v1/resetpassword`
Reset password using OTP
```
{
    "email": "abc@gmail.com",
    "otp": 798137,
    "newPassword": "pass123"
}
```
