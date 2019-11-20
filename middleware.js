//express middleware

const auth = require('./auth.js');

module.exports = {checkJWT, checkToken};

/**
 * checks JWT in req.headers.auhorization for validity. If valid, calls next()
 * otherwise, returns 401 unauthorized
 * @param {object} req 
 * @param {object} res 
 * @param {function} next 
 */
function checkJWT(req, res, next){
   if(!req.headers.authorization)
      res.sendStatus(401);

   auth.verifyJWT(req.headers.authorization)
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
function checkToken(token, req, res, next){
   
}