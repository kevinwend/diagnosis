FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN npm install -g pm2

ENV NODE_NO_WARNINGS=1

COPY . .

ENV PORT=3000

LABEL name=diagnosis

EXPOSE 3000

CMD ["pm2-runtime", "start", "npm", "--", "start"]