import "./env.js"
import {
  createVerifyJwt,
  createRequireAuth,
} from "@akash1347/auth-lib"

const authUrl = process.env.AUTH_SERVICE_URL;
 
const verifyJwt = createVerifyJwt({
  jwksUrl: `${authUrl}/.well-known/jwks.json`,
  issuer: "auth-service"  
});

export const requireAuth = createRequireAuth({ verifyJwt });
