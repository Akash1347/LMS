import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";
import services from "../config/services.js";

export const authProxy = createProxyMiddleware({
    target: services.auth,
    changeOrigin: true,
    on: {
        proxyReq: (proxyReq, req, res) => {
            // Set custom headers before fixRequestBody to avoid
            // ERR_HTTP_HEADERS_SENT when request body has already been written.
            if (!proxyReq.headersSent) {
                if (req.user?.sub) {
                    proxyReq.setHeader("x-user-id", String(req.user.sub));
                }
                if (req.user?.role) {
                    proxyReq.setHeader("x-user-role", String(req.user.role));
                }
                if (req.user?.email) {
                    proxyReq.setHeader("x-user-email", String(req.user.email));
                }
            }

            fixRequestBody(proxyReq, req, res);
        },
    },
    pathRewrite: (path) => `/api/auth${path}`,
});