const auth = require('./src/auth.js');
const authmail = require('./src/mail.js');
const mw = require('./src/middleware.js');

module.exports = {
   config: config,
   sendToken: authmail.sendToken,
   checkToken: auth.checkToken,
   getJWT: auth.getJWT,
   checkJWT: auth.verifyJWT,
   mw: {
      checkJWT: mw.checkJWT,
      checkToken: mw.checkToken,
      logout: mw.logout
   }
};

/**
 * set configuration options in both mail and auth modules
 * @param {Object} options
 */
function config(options){
   const authconfig = auth.config(options);
   const mailconfig = authmail.config(options);
   const mwconfig = mw.config(options);

   return authconfig && mailconfig && mwconfig;
}