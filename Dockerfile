# --- Stage 1: Production ---
FROM nginx:1.27-alpine AS production
RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001 -G appgroup
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --chown=appuser:appgroup src/ .
COPY nginx.conf /etc/nginx/conf.d/default.conf
ENV PORT=3000
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1
USER appuser
CMD ["nginx", "-g", "daemon off;"]

# --- Stage 2: Development ---
FROM nginx:1.27-alpine AS development
WORKDIR /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
ENV PORT=3000
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
