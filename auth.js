//auth.js
const datefns = require('date-fns');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

module.exports = {config, checkToken, generateToken, getJWT, verifyJWT};

//crypto setup
const configuration = {
   cryptoKey: "default_cryptography_key",
   JWTexpiration: '14d'
};

const algorithm = 'aes-192-cbc';
const salt = "determi__nate"; //crypto.randomBytes(16);
var key = crypto.scryptSync(configuration.cryptoKey, salt, 24);

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
 * checks to verify whether all necessary configuration settings have been set
 * @returns {boolean}
 */
function checkConfig(){
   if(configuration.cryptoKey=="default_cryptography_key")
      throw new Error("WARNING: Default cryptography key present. Change with config() in production code.")
   else
      key = crypto.scryptSync(configuration.cryptoKey, salt, 24);
   
   for(let i in configuration)
      if(configuration[i]==null)
         return false;
   return true;
}

/**
 * accepts a token and attempts to decrypt it and 
 * verify that it was issued less than x minutes ago
 * if successful, resolves the username of the user
 * otherwise, rejects with error message
 * @param {string} token 
 * @param {number} minutes
 * @returns {string} decrypted email
 */
function checkToken(token, minutes=5){
   var decrypted = decryptToken(token);
   
   if(decrypted && withinMinutes(decrypted.time, minutes))
      return decrypted.email;
   else
      return false;
}

/**
 * checks if time is within X minutes of the current time 
 * AND is not after the current time
 * @param {string} time time ISOstring
 * @param {number} min number of minutes
 * @returns {boolean} 
 */
function withinMinutes(time, min){
   let now = new Date();
   time = new Date(time);
   let expiration = datefns.addMinutes(time, min); //calculate expiration time

   if( expiration >= now && time <= now) //if expiration is after now, and the time is in the past
      return true;
   else
      return false;
}

/**
 * generates an encrypted JSON with email and current time
 * @param {string} email 
 * @returns {string} encrypted token with the user's email and current time
 */
function generateToken(email){
   if(!(email.includes('@') && email.includes ('.'))) //check if we have an email address
      return false;
   checkConfig();
   
   const iv = crypto.randomBytes(16).toString('base64').slice(0,16);
   const cipher = crypto.createCipheriv(algorithm, key, iv);
   let toEncrypt = JSON.stringify({email: email, time: new Date()});
   let encrypted = cipher.update(toEncrypt, 'utf8', 'base64');
   encrypted += cipher.final('base64');
   encrypted += "_"+iv;
   return encrypted;
}

/**
 * decrypts and parses token
 * @param {string} token 
 */
function decryptToken(data){
   var [token, iv] = data.split("_");
   try{   
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      let decrypted = decipher.update(token, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      return JSON.parse(decrypted);
   }
   catch(e){
      return false;
   }
}


/**
 * signs and returns a jsonwebtoken with user and auth level information
 * @param {string} email email of user
 * @param {string} level authorization level of user
 * @returns {string} jsonwebtoken
 */
function getJWT(email, level="user"){
   return(
      jwt.sign({
         user: email,
         level: level
      }, 
      configuration.cryptoKey, { expiresIn: configuration.JWTexpiration })
   );
}

/**
 * checks validity of token and returns user and auth level
 * @param {string} token jwt to parse and check
 * @returns {promise}
 *    @resolves object with email and auth level information
 *    @rejects on error
 */
async function verifyJWT(token){
	return new Promise((resolve, reject)=>{
      jwt.verify(token, configuration.cryptoKey, (err, result)=>{
         if(err)
            reject(err.message);
         else if(!result) 
            reject("jwt error")
         else
            resolve({user: result.user, level: result.level});
      }).catch((err)=>reject(err.message));
   });
}