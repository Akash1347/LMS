import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";

import services from "../config/services.js";

export const enrollmentProxy = createProxyMiddleware({
    target: services.enrollment,
    changeOrigin: true,
    on: {
        proxyReq: (proxyReq, req, res) => {
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
    pathRewrite: (path) => `/api/enrollment${path}`,
});