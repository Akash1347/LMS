import crypto from 'crypto';
import { privateKey } from '../config/keys.js';

const privateKeyObj = crypto.createPrivateKey(privateKey);
const publicKeyObj = crypto.createPublicKey(privateKeyObj);
const jwk = publicKeyObj.export({ format: 'jwk' });
jwk.use = 'sig';

console.log('JWK:', jwk);

export { jwk };
