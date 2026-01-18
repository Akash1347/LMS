import { jwk } from '../config/convertPemToJWK.js';

export const getJwks = (req, res) => {
    res.json({ keys: [jwk] });
};
