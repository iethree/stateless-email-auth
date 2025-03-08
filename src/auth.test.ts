import { describe, it, expect }  from "vitest";

const auth = require('./auth.js');
const authmail = require('./mail.js');

describe("token encryption", () => {
   it("returns true for a properly configured auth object", () =>{
      const configured = auth.config({
         cryptoKey: "this is a very secure! cryptographiC Key"
      });
      expect(configured).toBe(true);
   });

   it.each(["bob@aol.com", "my.beau@your.gmail.com"])("can encode and decode email address: %s", (email) => {
      const token = auth.generateToken(email);
      expect(token).toBeTypeOf("string");
      const decoded = auth.checkToken(token, 1);
      expect(decoded.email).toBe(email);
   });

   it("returns false for an invalid email address", () => {
      const token = auth.generateToken("fjhaksjdhaksd");
      expect(token).toBe(false);
   });

   it("can pass a custom token duration", () => {
      const token = auth.generateToken("bob@aol.com");
      const decoded = auth.checkToken(token, 100);
      expect(decoded.email).toBe("bob@aol.com");
   });

   it("will return false for an expired token", () => {
      const token = auth.generateToken("bob@aol.com");
      const decoded = auth.checkToken(token, -1);
      expect(decoded).toBe(false);
   });

   it("will not generate identical tokens for the same email address", () => {
      const token1 = auth.generateToken("bob@aol.com");
      const token2 = auth.generateToken("bob@aol.com");

      expect(token1).not.toBe(token2);
   });

   it("can pass an optional token level param", () => {
      const token = auth.generateToken("bob@aol.com", "proletariat");
      const decoded = auth.checkToken(token, 1);
      expect(decoded).toStrictEqual({
         email: "bob@aol.com",
         level: "proletariat"
      });
   });


});

describe("authmail", () => {
   it("returns true for a properly configured mail object", () => {
      const mail = authmail.config({
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
      expect(mail).toBe(true);
   });
});

describe ("JWT", () => {
   it("can generate a JWT", async () => {
      const token = auth.getJWT("bob@aol.com");
      expect(token).toBeTypeOf("string");
      const decoded = await auth.verifyJWT(token);
      expect(decoded.user).toBe("bob@aol.com");
   });

   it("can generate a JWT with a level param", async () => {
      const token = auth.getJWT("bob@aol.com", "admin");
      expect(token).toBeTypeOf("string");
      const decoded = await auth.verifyJWT(token);
      expect(decoded.user).toBe("bob@aol.com");
      expect(decoded.level).toBe("admin");
   });

   it("will throw an error for an invalid JWT", async () => {
      const token = auth.getJWT("bob@aol.com");

      const decoded = await auth.verifyJWT(token + "askjdaksdjw")
         .catch(e => e);

      expect(decoded).toBeTypeOf("string");
      expect(decoded).toBe("invalid signature");
   });
});
