import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";

import services from "../config/services.js";

export const enrollmentProxy = createProxyMiddleware({
    target: services.enrollment,
    changeOrigin: true,
    on: {
        proxyReq: fixRequestBody,
    },
    pathRewrite: (path) => `/api/enrollment${path}`,
});