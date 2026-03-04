# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM --platform=$BUILDPLATFORM node:25-alpine AS builder

RUN apk add --no-cache make

WORKDIR /app

COPY package.json package-lock.json* Makefile ./
RUN make install

COPY . .
RUN make build

# ── Stage 2: serve ──────────────────────────────────────────────────────────
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
