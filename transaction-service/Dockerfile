FROM node:20-alpine

# Робоча директорія всередині контейнера
WORKDIR /app

# Спочатку копіюємо package.json і встановлюємо залежності
# (окремий шар — Docker кешує цей крок якщо package.json не змінився)
COPY package*.json ./
RUN npm install --production

# Копіюємо весь код
COPY . .

# Запускаємо сервіс
CMD ["node", "server.js"]