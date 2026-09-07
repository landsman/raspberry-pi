FROM oven/bun:1.3.14-alpine

# The base image ships whatever Alpine packages it had at its last rebuild, so a
# fixed openssl sits in the repo for days before the tag catches up. Patch here
# instead of waiting for the tag.
RUN apk upgrade --no-cache

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production

COPY src ./src/

EXPOSE 3000

CMD ["bun", "run", "src/server.ts"]
