import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";

import services from "../config/services.js";

export const courseProxy = createProxyMiddleware({
    target: services.course,
    changeOrigin: true,
    on: {
        proxyReq: fixRequestBody,
    },
    pathRewrite: (path) => `/api/course${path}`,
});
 