FROM node:18

# 安裝 Chromium 所需依賴
RUN apt-get update && apt-get install -y \
  chromium \
  fonts-liberation \
  fonts-noto-cjk \
  fonts-wqy-zenhei \
  fonts-arphic-uming \
  fonts-noto-color-emoji \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils \
  curl \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# 安裝 pnpm
RUN npm install -g pnpm

WORKDIR /app

COPY . .

# 使用 pnpm 安裝相依套件
RUN pnpm install

CMD ["node", "index.js"]
