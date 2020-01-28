//auth test

const mw = require('../middleware.js');
const auth = require('../auth.js');
const authmail = require('../mail.js');
const fs = require('fs');
const log = require('logchalk');

test();

function test(){
   var t0 = auth.config({cryptoKey: "this is a very secure! cryptographiC Key"});
   check(t0, true, "set crypto key");

   var t = auth.generateToken('bob@aol.com');
   t = auth.checkToken(t, 1);
   check(t.email, "bob@aol.com", "email passback");

   var t2 = auth.generateToken('beau@aol.com');
   t2 = auth.checkToken(t2, 1); 
   check(t2.email, "beau@aol.com", "email passback");

   var t3=auth.generateToken('fjhaksjdhaksd');
   check(t3, false, "invalid token")

   var t4 = auth.checkToken('askdjadiwja', 1);
   check(t4, false, "invalid email");
   checkType(t4, "boolean", "invalid token");

   var t5 = auth.generateToken('johnsonandjohnson@juberduberduberduber.business');
   checkType(t5, "string", "token type check");

   var t6=auth.generateToken('email@email.email');
   t6 = auth.checkToken('email@email.email', -1);
   check(t6, false, "expired token");

   var t8 = auth.generateToken("tester@gmail.com");
   var t9 = auth.generateToken("tester@gmail.com");

   checkNot(t8, t9, "iv randomization");
   check(auth.checkToken(t8).email, "tester@gmail.com", "same email different ciphers");
   check(auth.checkToken(t9).email, "tester@gmail.com", "same email different ciphers");

   fs.readFile("./test/test.txt", (err, data)=>{
      if(err) console.log(err);
      let r = auth.checkToken(data.toString());
      check(r.email, "persistent_bugger@gmail.com", "stored data check");
   });

   var t10 = authmail.config({
      users: [{email: 'tester@domain.com', level:'admin'},{email: 'y@z.gov'}],
      mailServerPort: 465,
      mailServer: "smtp.mailserver.com",
      mailServerSecurity: true,
      mailUser: "admin@testing.test",
      mailSender: "admin@testing.test",
      mailPassword: "password-placeholder",
      mailSubject: "Email Verification",
      tokenUrl: "http://localhost:3000/verify/",
      tokenExpiration: 7
   });

   check(t10, true, 'setup mailer');

   /* have to configure real mail server to test
   authmail.sendToken('tester@domain.com')
   .then((r)=>{
      if(r.accepted)
         log.success("Pass send email to "+'tester@domain.com');
      else
         log.err("FAIL send email to "+'tester@domain.com');
   })
   .catch(log.err);
   */

   var t12 =auth.getJWT("user@email.email", "administrator");
   checkType(t12, "string", "check jwt type");

   auth.verifyJWT(t12).then(r=>{
      check(r.user, "user@email.email", "jwt user check");
      check(r.level, "administrator", "jwt auth level check");
   })
   .catch(log.err);

   var t13 = t12+"askjdaksdjw";

   auth.verifyJWT(t13).then(r=>{
      console.log(r);
      check(r, "ffff", "SHOULD NOT PASS");
   })
   .catch(e=> {
      checkType(e, "string", "bad token should error");
   });

   //middleware tests
   var t14 = auth.generateToken('tester@testdomain.gov', "administrator");

   mw.config({
      successPage: "http://localhost:3000/success",
      failPage: "http://localhost:3000/fail"
   });

   var req={params:{}, cookies:{}}, res={}, next;

   next = ()=>{
      log.success('PASS jwt middleware checks out');
   }

   res.cookie=(name, val, options) =>{
      check(name, 'jwt', "check mw jwt name");
      checkType(val, 'string', "check mw JWT type");
      req.cookies.jwt = val;
      auth.verifyJWT(val).then((r)=>{
         check(r.user, 'tester@testdomain.gov', 'jwt email check');
         check(r.level, 'administrator', 'jwt level check');
      })
      .catch(log.err); 
   };
   res.redirect = (page)=>{
      check(page, "http://localhost:3000/success", 'check success redirect');    
      mw.checkJWT(req, res, next);
   }
   req.params.token = t14;
   mw.checkToken(req, res, next);
}

function check(val, expected, description = ""){
   if(val===expected)
      log.success("Pass", description);
   else
      throw new Error(val+" should be "+expected);
}

function checkType(val, type, description=""){
   if(typeof(val)===type)
      log.success("Pass", description);
   else
      throw new Error(val+ "should be"+ type);
}

function checkNot(val, expected, description){
   if(val!==expected)
      log.success("Pass", description)
   else
      throw new Error(val+"should not be"+ expected);
}