FROM node:22.14.0-bullseye

ENV DEPLOY_ENV=local

WORKDIR /app
COPY package.json package-lock.json tsconfig.build.json tsconfig.json /app/
COPY . /app/
COPY docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh

RUN npm install
RUN npm run build

EXPOSE 33000
RUN npm cache clean -f
ENTRYPOINT ["/app/docker-entrypoint.sh"]