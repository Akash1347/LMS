import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";
import services from "../config/services.js";

export const authProxy = createProxyMiddleware({
    target: services.auth,
    changeOrigin: true,
    on: {
        proxyReq: fixRequestBody,
    },
    pathRewrite: (path) => `/api/auth${path}`,
});