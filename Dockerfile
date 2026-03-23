FROM php:8.4-cli

RUN apt-get update && apt-get install -y \
    git unzip curl libpq-dev libzip-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo_pgsql pgsql mbstring zip xml \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

WORKDIR /app/backend
RUN composer install --no-interaction --prefer-dist --no-progress --optimize-autoloader

ARG NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NODE_ENV=production

WORKDIR /app
RUN pnpm build

RUN chmod +x /app/docker/webapp/start.sh
CMD ["/app/docker/webapp/start.sh"]
