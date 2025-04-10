FROM node:18

# 安裝 Chromium 所需依賴
RUN apt-get update && apt-get install -y \
  chromium \
  fonts-liberation \
  fonts-noto-cjk \
  fonts-wqy-zenhei \
  libasound2 \
  libcups2 \
  libgdk-pixbuf2.0-0 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# 安裝 pnpm
RUN npm install -g pnpm

WORKDIR /app

COPY . .

# 使用 pnpm 安裝相依套件
RUN pnpm install --force

CMD ["node", "index.js"]
