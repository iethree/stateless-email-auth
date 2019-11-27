//mail.js
const nm = require('nodemailer');
const auth = require('./auth.js');

module.exports = {config, sendToken};

const configuration = {
   users: null,
   mailServerPort: 587,
   mailServer: null,
   mailServerSecurity: false,
   mailUser: null,
   mailPassword: null,
   mailSubject: "Email Verification",
   tokenUrl: null,
   minutes: 5,
};

/**
 * sets configuration options: 
 * @param {Object} options key value pair options
 * @returns {boolean} true if all required options have been set, false otherwise 
 */
function config(options){
   for(let i in options)
      if (configuration.hasOwnProperty(i))
         configuration[i] = options[i];
  
   return checkConfig();
}

/**
 * checks to verify whether all necessary email configuration settings have been set
 */
function checkConfig(){
   for(let i in configuration)
      if(configuration[i]==null)
         return false;
   return true;
}

/**
 * checks authorized user list for the given email
 * if found, returns auth level, otherwise returns false
 * @param {string} email 
 */
function checkUser(email){
   email = uniformEmail(email);
   for(i of configuration.users)
      if(uniformEmail(i.email)===email) 
         return i.level || 'user';
   return false;
}

/**
 * returns given email address converted to lower case and stripped of periods and spaces
 * @param {string} email 
 */
function uniformEmail(email){
   return email.toLowerCase().replace(/[\s\.]/g,'');
}

/**
 * sends an email (that has already been verified as a valid user) with
 * an encrypted token
 * @param {string} email 
 */
async function sendToken(email){
   if(!checkConfig())
      return Promise.reject("Email configuration incomplete");
   
   var level = checkUser(email);
   if(!level)
      return Promise.reject("Invalid user: "+email);

   var token = auth.generateToken(email, level);
   if(token)
      return sendMail(email, token); 
   else
      Promise.reject("Token generation failed");
}

/**
 * sends an email
 * @param {array} recipients 
 * @param {string} subject 
 * @param {string} html 
 * @param {string} text 
 */
async function sendMail(recipients, token){
   let sender = nm.createTransport({
      host: configuration.mailServer,
      port: configuration.mailServerPort,
      secure: configuration.mailServerSecurity,
      auth: {
          user: configuration.mailUser,
          pass: configuration.mailPassword
      }
   });

   let result = await sender.sendMail({
      from: configuration.mailUser, // sender address
      to: recipients.toString(), // list of recipients
      subject: configuration.mailSubject, // Subject line
      html: htmlBody(token), // html body
      text: textBody(token) // plain text body
   }).catch(console.log);
   return Promise.resolve(result);
}

const buttonstyle = "background-color: #0066ff;border:1px solid #0066ff;border-radius:3px;color:#ffffff;display:inline-block;font-family:sans-serif;font-size:16px;line-height:44px;text-align:center;text-decoration:none;width:150px;-webkit-text-size-adjust:none;mso-hide:all;"

function htmlBody(token){
   return `
      <div style="margin: 20px;">
         <p>Use the link below to log in.</p>
         <p>
            <a style="${buttonstyle}" href = "${configuration.tokenUrl+encodeURIComponent(token)}">
               Login
            </a>
         </p>
         <p>(expires in ${configuration.minutes} minutes)</p>
   </div>
   `;
}

function textBody(token){
   return ("Use this link to log in: "+configuration.tokenUrl+token+" (expires in "+configuration.minutes+ " minutes)");
}

