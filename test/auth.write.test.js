// persistent data write test
const auth = require('../auth.js');
const fs = require('fs');

writePersist();

function writePersist(){
   var t0 = auth.config({cryptoKey: 'this is a very secure! cryptographiC Key'});
   var t = auth.generateToken("persistent_bugger@gmail.com");
   fs.writeFile("./test/test.txt", t, (err)=>{
      if(err) console.log(err);
      else console.log("file written");
   });
}