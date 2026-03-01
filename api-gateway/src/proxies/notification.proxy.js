import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";
import services from "../config/services.js";

export const notificationProxy = createProxyMiddleware({
    target: services.notification,
    changeOrigin: true,
    on: {
        proxyReq: fixRequestBody,
    },
    pathRewrite: (path) => `/api/notification${path}`,
}); 