# Lapa Referral Service

Микросервис реферальной системы для торговой платформы Lapa.

## Описание

Этот микросервис обеспечивает полную функциональность реферальной системы, включая:

- Создание реферальных ссылок
- Обработку событий транзакций через Kafka
- Расчет и начисление реферальных комиссий
- Историю начислений
- Валидацию реферальных кодов

## Архитектура

- **NestJS** - основной фреймворк
- **MongoDB** - база данных для хранения данных
- **Redis** - кеширование (опционально)
- **Kafka** - обработка событий транзакций
- **Docker** - контейнеризация

## API Endpoints

### POST /referral/referral-link

Создание реферальной ссылки

```json
{
  "referrerId": "user123",
  "expirationDays": 30
}
```

### POST /referral/transaction-event

Обработка события транзакции (для внутреннего использования)

```json
{
  "transactionId": "tx123",
  "userId": "user456",
  "amount": 100.5,
  "commission": 5.025,
  "status": "completed",
  "timestamp": "2024-01-01T12:00:00Z",
  "referralBy": "user123"
}
```

### GET /referral/referral-history

Получение истории начислений

Query параметры:

- `referrerId` - ID реферера
- `page` - номер страницы (по умолчанию 1)
- `limit` - количество записей на странице (по умолчанию 10)

### POST /referral/validate-code

Валидация реферального кода

```json
{
  "code": "ABC12345",
  "userId": "user789"
}
```

## Конфигурация

Создайте `.env` файл на основе `.env.example`:

```bash
cp .env.example .env
```

### Основные переменные окружения:

- `PORT` - порт приложения (по умолчанию 3004)
- `MONGODB_URI` - строка подключения к MongoDB
- `KAFKA_BROKERS` - адреса Kafka брокеров
- `REFERRAL_COMMISSION_RATE` - процент реферальной комиссии (по умолчанию 0.015 = 1.5%)
- `BASE_COMMISSION_RATE` - базовая комиссия сервиса (по умолчанию 0.05 = 5%)

## Установка и запуск

### С помощью Docker Compose (рекомендуется)

```bash
# Запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f referral-service

# Остановка
docker-compose down
```

### Локальная разработка

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run start:dev

# Сборка
npm run build

# Запуск в продакшн режиме
npm run start:prod
```

## Тестирование

```bash
# Unit тесты
npm run test

# E2E тесты
npm run test:e2e

# Тесты с покрытием
npm run test:cov
```

## Схема базы данных

### ReferralLink

- `code` - уникальный реферальный код
- `referrerId` - ID пользователя-реферера
- `createdAt` - дата создания
- `expiresAt` - дата истечения
- `isActive` - активность ссылки
- `usageCount` - количество использований
- `usedBy` - ID последнего использовавшего пользователя
- `usedAt` - дата последнего использования

### ReferralRelationship

- `referrerId` - ID реферера
- `referredUserId` - ID приглашенного пользователя
- `referralCode` - использованный реферальный код
- `joinedAt` - дата присоединения
- `isActive` - активность связи
- `totalCommissionEarned` - общая заработанная комиссия
- `transactionCount` - количество транзакций

### CommissionHistory

- `transactionId` - ID транзакции
- `referrerId` - ID реферера
- `referredUserId` - ID приглашенного пользователя
- `commissionAmount` - размер комиссии
- `originalTransactionAmount` - первоначальная сумма транзакции
- `commissionRate` - процент комиссии
- `createdAt` - дата создания
- `status` - статус начисления (pending, completed, failed)
- `processedAt` - дата обработки
- `failureReason` - причина неудачи (если есть)

## Kafka Topics

- `transaction.completed` - события завершенных транзакций

## Swagger Documentation

После запуска приложения документация API доступна по адресу:
http://localhost:3004/api/docs

## Health Check

Проверка здоровья сервиса:
http://localhost:3004/health

## Мониторинг

- **Kafka UI**: http://localhost:8080 (при использовании docker-compose)
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

## Разработка

### Структура проекта

```
src/
├── common/           # Общие компоненты
├── config/           # Конфигурация
├── health/           # Health check
├── referral/         # Основная логика реферальной системы
│   ├── dto/          # Data Transfer Objects
│   ├── repository/   # Репозитории для работы с БД
│   └── schemas/      # Mongoose схемы
├── utils/            # Переносимые утилиты
└── main.ts           # Точка входа приложения
```

### Правила коммитов

- `feat:` - новая функциональность
- `fix:` - исправление бага
- `chore:` - технические изменения
- `docs:` - документация
- `refactor:` - рефакторинг кода

Пример: `feat: add referral commission calculation`

## Производственная среда

### Переменные окружения для продакшн

Убедитесь, что установлены следующие переменные:

- Безопасные строки подключения к БД
- Правильные адреса Kafka брокеров
- Корректные CORS настройки
- Логирование и мониторинг

### Мониторинг и логирование

Сервис использует встроенное логирование NestJS. Рекомендуется настроить:

- Централизованное логирование (ELK Stack)
- Мониторинг производительности (Prometheus + Grafana)
- Алерты для критических ошибок

## Лицензия

MIT
