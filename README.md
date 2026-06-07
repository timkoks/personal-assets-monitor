📊 Моніторинг персональних активів
Дипломний проєкт — мікросервісна архітектура на Node.js
📋 Анотація

Цей проєкт реалізує програмне забезпечення для моніторингу персональних активів на основі мікросервісної архітектури. Система дозволяє користувачам відстежувати фінансові транзакції, зокрема доходи та витрати, керувати персональними активами, зберігати інформацію про їхню вартість і категорії, а також отримувати зведену фінансову статистику.

Основна увага в проєкті приділена серверній частині: побудові REST API, організації API Gateway, розділенню функцій між мікросервісами, роботі з MongoDB, JWT-авторизації та запуску системи через Docker Compose.

🏗️ Архітектура системи

Система побудована за принципами мікросервісної архітектури. Кожен сервіс є окремим Node.js/Express.js-застосунком, має власну зону відповідальності та працює зі своєю MongoDB-базою даних.

Компоненти системи
Компонент	Технологія	Порт	Призначення
API Gateway	Node.js + Express	3000	Єдина точка входу, проксування запитів, rate limiting
Auth Service	Node.js + Express + MongoDB	3001	Реєстрація, логін, формування JWT
Transaction Service	Node.js + Express + MongoDB	3002	Управління доходами, витратами та балансом
Asset Service	Node.js + Express + MongoDB	3003	Управління персональними активами
mongo-auth	MongoDB 6	27017	База даних сервісу авторизації
mongo-transactions	MongoDB 6	27018	База даних сервісу транзакцій
mongo-assets	MongoDB 6	27019	База даних сервісу активів
🔀 Особливість маршрутизації через API Gateway

У системі використано поділ маршрутів на зовнішні та внутрішні.

Зовнішній префікс використовується API Gateway для визначення цільового мікросервісу:

/api/auth — запити до Auth Service;
/api/transactions — запити до Transaction Service;
/api/assets — запити до Asset Service.

Внутрішній префікс належить маршрутизатору самого мікросервісу:

/auth — внутрішні маршрути Auth Service;
/transactions — внутрішні маршрути Transaction Service;
/assets — внутрішні маршрути Asset Service.

Через це повні маршрути під час звернення через API Gateway мають вигляд:

/api/auth/auth/register
/api/auth/auth/login
/api/transactions/transactions
/api/transactions/transactions/balance
/api/assets/assets
/api/assets/assets/summary

Такий підхід дозволяє сервісам зберігати власну структуру маршрутів і потенційно працювати як через API Gateway, так і окремо під час локального налагодження.

🧩 Схема взаємодії компонентів
graph TD
    Client["👤 Клієнт\nPostman / Web / Mobile"]

    Client -->|"HTTP запити"| GW["🌐 API Gateway\nlocalhost:3000"]

    GW -->|"/api/auth/*"| AS["🔐 Auth Service\n:3001"]
    GW -->|"/api/transactions/*"| TS["💸 Transaction Service\n:3002"]
    GW -->|"/api/assets/*"| ATS["🏠 Asset Service\n:3003"]

    AS --> MA["🗄️ mongo-auth\nauth_db :27017"]
    TS --> MT["🗄️ mongo-transactions\ntransactions_db :27018"]
    ATS --> MAT["🗄️ mongo-assets\nassets_db :27019"]

    style Client fill:#4A90D9,color:#fff
    style GW fill:#F5A623,color:#fff
    style AS fill:#7ED321,color:#fff
    style TS fill:#7ED321,color:#fff
    style ATS fill:#7ED321,color:#fff
    style MA fill:#9B59B6,color:#fff
    style MT fill:#9B59B6,color:#fff
    style MAT fill:#9B59B6,color:#fff
🔐 Сценарій авторизації та захищеного запиту
sequenceDiagram
    participant C as 👤 Клієнт
    participant G as 🌐 API Gateway
    participant A as 🔐 Auth Service
    participant T as 💸 Transaction Service
    participant DB1 as 🗄️ Auth MongoDB
    participant DB2 as 🗄️ Transactions MongoDB

    rect rgb(40, 60, 40)
        Note over C,DB1: Крок 1 — логін та отримання JWT-токена
        C->>G: POST /api/auth/auth/login\n{ email, password }
        G->>A: POST /auth/login
        A->>DB1: findOne({ email })
        DB1-->>A: User document
        A->>A: bcrypt.compare(password, hash)
        A->>A: jwt.sign({ id }, SECRET)
        A-->>G: { token: "eyJ..." }
        G-->>C: { token: "eyJ..." }
    end

    rect rgb(40, 40, 60)
        Note over C,DB2: Крок 2 — захищений запит з JWT-токеном
        C->>G: GET /api/transactions/transactions\nAuthorization: Bearer eyJ...
        G->>T: GET /transactions\nAuthorization: Bearer eyJ...
        T->>T: jwt.verify(token, SECRET)\nу middleware сервісу
        T->>DB2: find({ userId })
        DB2-->>T: transactions
        T-->>G: { transactions: [...] }
        G-->>C: { transactions: [...] }
    end

У цій схемі API Gateway не виконує бізнес-логіку та не перевіряє JWT самостійно. Він приймає зовнішній запит і передає його до відповідного сервісу. Перевірка JWT-токена виконується на рівні захищених мікросервісів, зокрема Transaction Service та Asset Service.

🧱 Структура CRUD-операцій
graph LR
    subgraph "Auth Service"
        A1["POST /auth/register"]
        A2["POST /auth/login"]
        A3["GET /auth/verify"]
    end

    subgraph "Transaction Service"
        T1["POST /transactions — створити"]
        T2["GET /transactions — всі транзакції"]
        T3["GET /transactions/balance — баланс"]
        T4["GET /transactions/:id — одна"]
        T5["PUT /transactions/:id — оновити"]
        T6["DELETE /transactions/:id — видалити"]
    end

    subgraph "Asset Service"
        AS1["POST /assets — створити"]
        AS2["GET /assets — всі активи"]
        AS3["GET /assets/summary — зведення"]
        AS4["GET /assets/:id — один"]
        AS5["PUT /assets/:id — оновити"]
        AS6["DELETE /assets/:id — видалити"]
    end

    GW["🌐 API Gateway\n:3000"] --> A1 & A2 & A3
    GW --> T1 & T2 & T3 & T4 & T5 & T6
    GW --> AS1 & AS2 & AS3 & AS4 & AS5 & AS6
🛠️ Технічний стек
Backend
Node.js 20 — середовище виконання JavaScript на сервері;
Express.js 4 — веб-фреймворк для побудови REST API;
Mongoose 7 — ODM-бібліотека для роботи з MongoDB;
JSON Web Token (JWT) — механізм авторизації без зберігання сесій;
bcryptjs — хешування паролів користувачів;
http-proxy-middleware — проксування запитів в API Gateway;
express-rate-limit — обмеження частоти запитів до API.
База даних
MongoDB 6 — документоорієнтована NoSQL база даних;
кожен мікросервіс має власну ізольовану базу даних.
DevOps
Docker — контейнеризація сервісів;
Docker Compose — запуск кількох контейнерів як єдиного середовища.
📁 Структура проєкту
personal-assets-monitor/
│
├── docker-compose.yml              # Оркестрація всіх контейнерів
├── .env.example                    # Загальний приклад змінних середовища
├── README.md                       # Документація проєкту
│
├── api-gateway/                    # API Gateway — єдина точка входу
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js                   # Проксі-маршрути до сервісів
│   └── .env
│
├── auth-service/                   # Сервіс авторизації
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   ├── models/
│   │   └── User.js                 # Модель користувача
│   ├── controllers/
│   │   └── authController.js       # Логіка реєстрації та логіну
│   ├── routes/
│   │   └── authRoutes.js           # Маршрути авторизації
│   └── .env
│
├── transaction-service/            # Сервіс транзакцій
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   ├── models/
│   │   └── Transaction.js          # Модель транзакції
│   ├── controllers/
│   │   └── transactionController.js
│   ├── middleware/
│   │   └── authMiddleware.js       # JWT-перевірка
│   ├── routes/
│   │   └── transactionRoutes.js
│   └── .env
│
└── asset-service/                  # Сервіс активів
    ├── Dockerfile
    ├── package.json
    ├── server.js
    ├── models/
    │   └── Asset.js                # Модель активу
    ├── controllers/
    │   └── assetController.js
    ├── middleware/
    │   └── authMiddleware.js       # JWT-перевірка
    ├── routes/
    │   └── assetRoutes.js
    └── .env
⚙️ Встановлення та запуск
Вимоги
Docker Desktop з Docker Compose.
Налаштування змінних середовища

У проєкті використовується окремий .env файл для кожного сервісу. Загальний .env.example можна використовувати як довідковий приклад, але перед запуском потрібно створити окремі .env файли в папках сервісів.

api-gateway/.env
PORT=3000
AUTH_SERVICE_URL=http://auth-service:3001
TRANSACTION_SERVICE_URL=http://transaction-service:3002
ASSET_SERVICE_URL=http://asset-service:3003
auth-service/.env
PORT=3001
MONGO_URI=mongodb://mongo-auth:27017/auth_db
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
transaction-service/.env
PORT=3002
MONGO_URI=mongodb://mongo-transactions:27017/transactions_db
JWT_SECRET=your_super_secret_jwt_key_here
asset-service/.env
PORT=3003
MONGO_URI=mongodb://mongo-assets:27017/assets_db
JWT_SECRET=your_super_secret_jwt_key_here

Для коректної роботи JWT-авторизації значення JWT_SECRET у auth-service, transaction-service та asset-service має бути однаковим.

Запуск

1. Перейдіть у папку проєкту:

cd personal-assets-monitor

2. Запустіть всі сервіси:

docker compose up --build

3. Дочекайтесь повідомлень у консолі:

✅ MongoDB підключено
🚀 Auth Service запущено на порті 3001
🚀 Transaction Service запущено на порті 3002
🚀 Asset Service запущено на порті 3003
🚀 API Gateway запущено на порті 3000

4. Перевірте роботу API Gateway:

curl http://localhost:3000/health
Зупинка
docker compose down
Зупинка з видаленням даних
docker compose down -v
📡 API-документація

Базовий URL: http://localhost:3000

Для захищених запитів потрібно передавати JWT-токен у заголовку:

Authorization: Bearer <JWT_TOKEN>

🔐 Auth Service

Базовий маршрут через API Gateway:

/api/auth/auth
Метод	Endpoint	Захист	Опис
POST	/api/auth/auth/register	ні	Реєстрація нового користувача
POST	/api/auth/auth/login	ні	Вхід у систему та отримання JWT
GET	/api/auth/auth/verify	JWT	Перевірка валідності токена
Приклад реєстрації

Request

POST /api/auth/auth/register
Content-Type: application/json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepass123"
}

Response 201

{
  "message": "Реєстрація успішна",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "64f8a2b3c9d1e2f3a4b5c6d7",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
💸 Transaction Service

Базовий маршрут через API Gateway:

/api/transactions/transactions
Метод	Endpoint	Захист	Опис
POST	/api/transactions/transactions	JWT	Створити транзакцію
GET	/api/transactions/transactions	JWT	Отримати всі транзакції користувача
GET	/api/transactions/transactions?type=income	JWT	Фільтр транзакцій за типом
GET	/api/transactions/transactions/balance	JWT	Отримати баланс користувача
GET	/api/transactions/transactions/:id	JWT	Отримати одну транзакцію
PUT	/api/transactions/transactions/:id	JWT	Оновити транзакцію
DELETE	/api/transactions/transactions/:id	JWT	Видалити транзакцію
Приклад створення доходу

Request

POST /api/transactions/transactions
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
{
  "type": "income",
  "amount": 25000,
  "category": "Зарплата",
  "description": "Перша зарплата"
}

Response 201

{
  "message": "Транзакцію створено",
  "transaction": {
    "type": "income",
    "amount": 25000,
    "category": "Зарплата",
    "description": "Перша зарплата"
  }
}
Приклад відповіді балансу

Request

GET /api/transactions/transactions/balance
Authorization: Bearer <JWT_TOKEN>

Response 200

{
  "totalIncome": 25000,
  "totalExpense": 3500,
  "balance": 21500
}
🏠 Asset Service

Базовий маршрут через API Gateway:

/api/assets/assets
Метод	Endpoint	Захист	Опис
POST	/api/assets/assets	JWT	Додати актив
GET	/api/assets/assets	JWT	Отримати всі активи користувача
GET	/api/assets/assets?category=vehicle	JWT	Фільтр активів за категорією
GET	/api/assets/assets/summary	JWT	Отримати зведення за категоріями
GET	/api/assets/assets/:id	JWT	Отримати один актив
PUT	/api/assets/assets/:id	JWT	Оновити актив
DELETE	/api/assets/assets/:id	JWT	Видалити актив
Категорії активів
Код	Назва
real_estate	Нерухомість
vehicle	Транспортний засіб
electronics	Електроніка
jewelry	Ювелірні вироби
investment	Інвестиції
other	Інше
Приклад створення активу

Request

POST /api/assets/assets
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
{
  "name": "Toyota Camry 2020",
  "category": "vehicle",
  "value": 850000,
  "currency": "UAH",
  "description": "Особистий автомобіль",
  "purchaseDate": "2020-06-15"
}

Response 201

{
  "message": "Актив додано",
  "asset": {
    "name": "Toyota Camry 2020",
    "category": "vehicle",
    "value": 850000,
    "currency": "UAH",
    "description": "Особистий автомобіль",
    "isActive": true
  }
}
🔐 Безпека
graph LR
    P["🔑 Пароль\nвідкритий текст"]
    P -->|"bcrypt\nsalt=10"| H["#️⃣ Хеш\nу MongoDB"]

    T["👤 Успішний логін"]
    T -->|"jwt.sign\nexpires: 7d"| JWT["🎫 JWT-токен"]
    JWT -->|"Authorization:\nBearer ..."| G["🌐 API Gateway"]
    G -->|"Проксування запиту"| S["🧩 Захищений сервіс"]
    S -->|"jwt.verify\nу middleware"| OK["✅ Доступ надано"]
Паролі користувачів зберігаються у вигляді bcrypt-хешу.
JWT-токени використовуються для захисту маршрутів Transaction Service та Asset Service.
Кожен користувач має доступ тільки до власних транзакцій та активів.
API Gateway використовує rate limiting для обмеження кількості запитів.
Сервіси взаємодіють через ізольовану внутрішню Docker-мережу.
Значення JWT_SECRET має бути однаковим у сервісах, які створюють і перевіряють токени.
🧱 Принципи мікросервісної архітектури в проєкті
Принцип	Реалізація
Єдина відповідальність	Кожен сервіс відповідає за окрему бізнес-функцію
Ізоляція даних	Кожен сервіс має власну MongoDB-базу
Незалежне розгортання	Кожен сервіс має власний Dockerfile
API Gateway	Єдина точка входу для клієнтів
Stateless-авторизація	JWT не потребує зберігання серверних сесій
Контейнеризація	Усі сервіси запускаються через Docker Compose
🧪 Приклади тестування

Працездатність системи можна перевірити через Postman або curl.

Основні сценарії тестування:

Реєстрація користувача.
Вхід користувача та отримання JWT-токена.
Створення доходу.
Створення витрати.
Отримання балансу.
Додавання персонального активу.
Отримання зведення активів за категоріями.

Приклад перевірки API Gateway:

curl http://localhost:3000/health
👨‍💻 Автор
Студент: Ковалишин Тимофій Едуардович
Група: СП-42
Науковий керівник: [ПІБ керівника]
Рік: 2026Нн