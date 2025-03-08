import { describe, it, expect, vi, beforeAll }  from "vitest";

const mw = require('./middleware.js');
const auth = require('./auth.js');

describe("middleware", () => {
   beforeAll(() => {
      auth.config({ cryptoKey: "my-secure-crytpo-key" });
   });

   it("returns false for an invalid success page", () =>{
      const result = mw.config({
         successPage: null,
         failPage: "http://localhost:3000/fail",
         minutes: 90,
         JWTexpiration: '14d',
      });
      expect(result).toBe(false);
   });

   it("returns false for an invalid JWT duration", () =>{
      const result = mw.config({
         successPage: "http://localhost:3000/success",
         failPage: "http://localhost:3000/fail",
         minutes: 90,
         JWTexpiration: null,
      });
      expect(result).toBe(false);
   });

   it("returns false for an invalid duration", () =>{
      const result = mw.config({
         successPage: "http://localhost:3000/success",
         failPage: "http://localhost:3000/fail",
         minutes: null,
         JWTexpiration: '14d',
      });
      expect(result).toBe(false);
   });

   it("returns true for a valid config", () =>{
      const result = mw.config({
         successPage: "http://localhost:3000/success",
         failPage: "http://localhost:3000/fail",
         minutes: 90,
         JWTexpiration: '14d',
      });
      expect(result).toBe(true);
   });

   it("calls next on a valid JWT", async () =>{
      const jwt = auth.getJWT('bob@aol.com');

      const req = {
         cookies: { jwt },
      };

      const status = vi.fn();
      const redirect = vi.fn();
      const next = vi.fn();

      const res = {
         status,
         sendStatus: status,
         redirect,
      };

      mw.checkJWT(req, res, next);

      await vi.waitFor(() => (
         expect(next).toHaveBeenCalled()
      ));

      expect(redirect).not.toHaveBeenCalled();
   });

   it("returns 403 on invalid JWT", async () =>{
      const jwt = auth.getJWT('bob@aol.com') + 'xyz';

      const req = {
         cookies: { jwt },
      };

      const status = vi.fn();
      const redirect = vi.fn();
      const next = vi.fn();

      const res = {
         status,
         redirect,
         sendStatus: status,
      };

      mw.checkJWT(req, res, next);

      await vi.waitFor(() => (
         expect(status).toHaveBeenCalledWith(403)
      ));

      expect(next).not.toHaveBeenCalled();
   });

   it("redirects to success page on valid login token", () => {
      const token = auth.generateToken('bob@aol.com');

      const req = {
         params: { token },
      };

      const status = vi.fn();
      const redirect = vi.fn();

      const res = {
         cookie: vi.fn(),
         status: () => ({ redirect }),
         sendStatus: status,
         redirect,
      };

      mw.checkToken(req, res);

      expect(redirect).toHaveBeenCalledWith(
         'http://localhost:3000/success'
      );
   });

   it("returns 403 on invalid login token", () =>{
      const token = auth.generateToken('bob@aol.com') + 'xyz';

      const req = {
         params: { token },
      };

      const status = vi.fn();
      const redirect = vi.fn();

      const res = {
         cookie: vi.fn(),
         status: () => ({ redirect }),
         sendStatus: status,
         redirect,
      };

      mw.checkToken(req, res);

      expect(status).toHaveBeenCalledWith(
         403
      );
   });
});
