# stateless-email-auth

Stateless, passwordless email authentication in nodejs. Optionally uses json web tokens for stateless persistence. 
Designed to provide maximum security with minimal configuration.

## Installation

```shell
npm install stateless-email-auth
```

## Authorization Flow

- check if a user's email is on an authorization list
- email that user an encrypted token in an email link
- user clicks the link, which puts the token in a get request
- website checks the token, if valid, issues a JWT and stores in a cookie
- redirects to defined authentication success or failure pages

## Usage

### Configuration

```javascript
const auth = require('stateless-email-auth');

auth.config({
   users: [//array of authorized users
      {email:'user1@gmail.com', level: 'admin'}, 
      {email: 'user2@gmail.com', level: 'user'}
   ],
   mailServer: 'mailserver.mail.com',  //required
   mailUser: 'user@mail.com',  //required
   mailPassword: 'jenny8675309password',  //required
   tokenUrl: 'http://localhost:3000/auth',  //required, full url to insert into email with generated token
   successPage: "/success", //required, path to redirect successful authentication
   failPage: "/fail", //required, path to redirect failed authentication
   cryptoKey: "crypt00_key", //required, will throw an error if you leave default key,
   mailServerPort: 587, //optional, defaults to 587
   mailServerSecurity: false, //optional, defaults to false
   mailSubject: "Email Verification", //optional
   minutes: 5, //optional, defaults to 5
   JWTexpiration: '14d', //optional
});
```

### Send an authentication email

```javascript
auth.sendToken('user@email.com');

// will send an authentication email with an encrypted authorization token link
// the mail server options must be properly configured
```

### Check an authentication token

```javascript
var user = auth.checkToken(token);

// user will be the email to which token was issued
```

### Issue a json web token

```javascript
var jwt = auth.getJWT('user@email.com', 'admin');

//second argument (auth level) is optional, defaults to 'user'
```

### Check a json web token

```javascript
var userinfo = await auth.checkJWT(jwt);

//returns email and authorization level stored in JWT
```

## Express Middleware

### Check Auth Token

```javascript
app.use('/authRoute', auth.mw.checkToken);

//token needs to be in the Authorization header
```

### Check JWT

```javascript
app.use('/protectedRoute', auth.mw.checkJWT);

//jwt needs to be in the Authorization header
```
