FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN npm install -g pm2

COPY . .

ENV PORT=3000

LABEL name=diagnosis

# 暴露必要的服務埠
EXPOSE 3000 3001

# 使用 pm2 同時啟動兩個服務
CMD ["pm2-runtime", "start", "ecosystem.config.js"]