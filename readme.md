# stateless-email-auth

Stateless, passwordless email authentication in nodejs. Optionally uses json web tokens for stateless persistence. 
Designed to provide maximum security with minimal configuration.

## Installation

```shell
npm install stateless-email-auth
```

## Successful Authorization Flow

- check if a user's email is on an authorization list
- email that user an encrypted token in an email link
- user clicks the link, which puts the token in a get request
- website checks the token, if valid, issues a JWT and stores in a cookie
- redirects to defined authentication success page

## Basic Usage

### Configuration

```javascript
const auth = require('stateless-email-auth');

auth.config({
   users: [//array of authorized users for a static list, required unless checkUser is defined
      {email:'user1@gmail.com', level: 'admin'}, 
      {email:'user2@gmail.com', level: 'user'}
   ],
   checkUser: database.findEmail, //optional user-defined function to check email validity
   mailServer: 'mailserver.mail.com',  //required
   mailUser: 'user@mail.com',  //required
   mailSender: 'sendername@mail.com', //optional, defaults to mailUser
   mailPassword: 'jenny8675309password',  //required
   tokenUrl: 'http://localhost:3000/auth',  //required, full url to insert into email with generated token
   successPage: "/success", //required, path to redirect successful authentication
   failPage: "/fail", //required, path to redirect failed authentication
   cryptoKey: "crypt00_key", //required, will throw an error if you leave default key,
   mailServerPort: 587, //optional, defaults to 587
   mailServerSecurity: false, //optional, defaults to false
   mailSubject: "Email Verification", //optional
   tokenExpiration: 5, //optional, token expiration time in minutes, defaults to 5
   JWTexpiration: '14d', //optional
});
```

### Send an authentication email

```javascript
// will send an authentication email with an encrypted authorization token link if the email is valid
auth.sendToken('user@email.com');
```

### Express Middleware to Check Auth Token

```javascript
//sets JWT in cookie if valid
app.use('/authRoute/:token', auth.mw.checkToken);
```

### Express Middleware to Check JWT

```javascript
//checks JWT and sets req.user to the email and req.level to the user's auth level
app.use('/protectedRoute', auth.mw.checkJWT);
```

## API

### Check an authentication token

```javascript
// user will be the email to which token was issued
var user = auth.checkToken(token);
```

### Issue a json web token

```javascript
//second argument (auth level) is optional, defaults to 'user'
var jwt = auth.getJWT('user@email.com', 'admin');
```

### Check a json web token

```javascript
//returns email and authorization level stored in JWT
var userinfo = await auth.checkJWT(jwt);
```

### User-defined email checker

```javascript
//this is a sample to adapt to your database schema

// must return or resolve an authorization level of some sort if valid
// must return or resolve false if invalid

function checkEmail(email){
   return new Promise(async (resolve,reject)=>{
      var user = await db.find({userEmail: email});
      if(user)
         resolve(user.authLevel);
      else
         resolve(false);
   });
}
```
