const auth = require('./auth.js');
const authmail = require('./mail.js');
const mw = require('./middleware.js');

module.exports = {
   config: config,
   sendToken: authmail.sendToken,
   checkToken: auth.checkToken,
   getJWT: auth.getJWT,
   checkJWT: auth.verifyJWT,
   mw: {
      checkJWT: mw.checkJWT,
      checkToken, mw.checkToken,
   }
};

/**
 * set configuration options in both mail and auth modules
 * @param {Object} options 
 */
function config(options){
   var authconfig = auth.config(options);
   var mailconfig = authmail.config(options);

   return authconfig && mailconfig;
}