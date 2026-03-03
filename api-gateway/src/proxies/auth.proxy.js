import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";
import services from "../config/services.js";

export const authProxy = createProxyMiddleware({
    target: services.auth,
    changeOrigin: true,
    on: {
        proxyReq: (proxyReq, req, res) => {
            fixRequestBody(proxyReq, req, res);

            if (req.user?.sub) {
                proxyReq.setHeader("x-user-id", String(req.user.sub));
            }
            if (req.user?.role) {
                proxyReq.setHeader("x-user-role", String(req.user.role));
            }
            if(req.user?.email) {
                proxyReq.setHeader("x-user-email", String(req.user.email));
            }
        },
    },
    pathRewrite: (path) => `/api/auth${path}`,
});