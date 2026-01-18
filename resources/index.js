const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;
const {
  createVerifyJwt,
  createRequireAuth,
  requireRole
} = require('@akash1347/auth-lib');
app.get('/', (req, res) => {
    res.send('Hello World!');
});
const requireAuth = createRequireAuth({
    verifyJwt: createVerifyJwt({
        jwksUrl: 'http://localhost:3000/.well-known/jwks.json',
        issuer: "auth-service"
    })
});



app.get('/protected', requireAuth(), (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});
    
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});