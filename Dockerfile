FROM node:8 AS base
RUN apt-get update -qq && \
    apt-get upgrade -qqy && \
    apt-get install -qqy \
        ca-certificates \
        libappindicator1 libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 \
        gconf-service lsb-release wget xdg-utils \
        fonts-liberation
WORKDIR /usr/app
COPY . .

FROM base as dependencies
RUN npm set progress=false && \
    npm config set depth 0 && \
    npm install --only=production

FROM base AS release
COPY --from=dependencies /usr/app .
EXPOSE 8082
CMD npm run start
