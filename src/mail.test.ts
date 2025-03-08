import { describe, it, expect }  from "vitest";
import 'dotenv/config';
const mail = require('./mail.js');
const auth = require('./auth.js');

describe("mail", () => {
   it("returns true for a properly configured mail object", () => {
      auth.config({
         cryptoKey: "this is a very secure! cryptographic key"
      });
      const emailconfig = mail.config({
         users: ['test@example.com', process.env.TEST_RECIPIENT],
         mailServerPort: 587,
         mailServer: process.env.MAIL_SERVER,
         mailServerSecurity: false,
         mailServerAuthMethod: 'PLAIN',
         mailUser: process.env.MAIL_USER,
         mailSender: process.env.MAIL_SENDER,
         mailPassword: process.env.MAIL_PASSWORD,
         mailSubject: "Email Verification",
         tokenUrl: process.env.TOKEN_URL,
         tokenExpiration: 5,
      });
      expect(emailconfig).toBe(true);
   });

   it("can send an email", async () => {
      const email = await mail.sendToken(process.env.TEST_RECIPIENT).catch((err) => {
         console.log(err);
      });

      console.log({ email })
   });
});
