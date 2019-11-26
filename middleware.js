//express middleware

const auth = require('./auth.js');

module.exports = {config, checkJWT, checkToken};

const configuration = {
   failPage: null,
   successPage: null,
   minutes: 5
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
 * checks to verify whether all necessary configuration settings have been set
 */
function checkConfig(){
   for(let i in configuration)
      if(configuration[i]==null)
         return false;
   return true;
}

/**
 * checks JWT in req.headers.auhorization for validity. If valid, calls next()
 * otherwise, returns 401 unauthorized
 * @param {object} req 
 * @param {object} res 
 * @param {function} next 
 */
function checkJWT(req, res, next){

   if(!req.cookies.jwt){
      res.sendStatus(401);
      return;
   }

   auth.verifyJWT(req.cookies.jwt)
   .then(r=>{
      req.user = r.user;
      req.level = r.level;
      next();
   })
   .catch(e=>res.sendStatus(401));
}

/**
 * checks verification token in for validity, if valid, calls next()
 * @param {string} token
 * @param {object} req 
 * @param {object} res 
 * @param {function} next 
 */
function checkToken(req, res, next){
   try{
      var result = auth.checkToken(decodeURIComponent(req.params.token), configuration.minutes);
      if(result){
         var jwt = auth.getJWT(result.email, result.level);

         let options = {
            httpOnly: true, // The cookie only accessible by the web server
         };
         res.cookie('jwt', jwt, options);
         res.redirect(configuration.successPage);
      }
         
      else
         res.redirect(configuration.failPage);
   }
   catch(e){
      console.log(e);
      res.redirect(configuration.failPage);
   }
}