# 🚀 راهنمای راه‌اندازی محیط توسعه — یاری‌جو v2
> برای: شهیاد | تهیه‌شده توسط: سینا

---

## پیش‌نیازها

| ابزار | نسخه | لینک |
|-------|------|------|
| Node.js | 20 LTS | https://nodejs.org |
| npm | 10.x | همراه Node |
| PostgreSQL | 16+ | https://www.postgresql.org |
| Redis | 7+ | https://redis.io |
| MinIO | Latest | https://min.io |
| Git | هر نسخه | https://git-scm.com |

> اگه Docker داری، با `docker compose up -d` همه سرویس‌ها یکجا بالا میان (ادامه رو بخون).

---

## روش ۱ — راه‌اندازی با Docker (توصیه‌شده)

### ۱. کلون / کپی پروژه

```bash
cd ~/projects
cp -r /path/to/yarijoo-v2 .
cd yarijoo-v2
```

### ۲. فایل محیطی

```bash
cp .env.example .env
```

فایل `.env` رو باز کن و این مقادیر رو عوض کن:

```env
# پسوردها رو عوض کن
DB_PASSWORD=یه_پسورد_قوی
MINIO_SECRET_KEY=یه_پسورد_قوی_MinIO

# JWT — رشته تصادفی حداقل ۳۲ کاراکتر
JWT_SECRET=حداقل_32_کاراکتر_تصادفی_اینجا
REFRESH_SECRET=یه_رشته_دیگه_کاملاً_متفاوت

# کلیدهای سرویس‌های خارجی (برای dev میشه موک گذاشت)
KAVENEGAR_API_KEY=کلید_واقعی_یا_test
ZARINPAL_MERCHANT_ID=UUID_زرین_پال
OPENAI_API_KEY=sk-...
```

### ۳. بالا آوردن سرویس‌ها

```bash
docker compose up -d
```

این دستور چه چیزی رو بالا میاره:
- **PostgreSQL** روی پورت `5432`
- **Redis** روی پورت `6379`
- **MinIO** روی پورت `9000` (API) و `9001` (Console)
- **Backend** روی پورت `3000`
- **Frontend** روی پورت `3001`

### ۴. اجرای migration دیتابیس

```bash
# بار اول
docker compose exec backend npx prisma migrate deploy

# یا برای restore از بک‌آپ موجود
docker compose exec -T postgres psql -U yarijoo yarijoo_v2 < database_backup.sql
```

### ۵. باز کردن سایت

| سرویس | آدرس |
|-------|------|
| سایت اصلی | http://localhost:3001 |
| API | http://localhost:3000/api/v1 |
| MinIO Console | http://localhost:9001 (admin/minioadmin123) |

---

## روش ۲ — راه‌اندازی بدون Docker (محلی)

### ۱. نصب وابستگی‌ها

```bash
# ریشه پروژه
npm install

# backend
cd backend && npm install && cd ..

# frontend
cd frontend && npm install && cd ..
```

### ۲. ساخت دیتابیس PostgreSQL

```bash
psql -U postgres
```

داخل psql:

```sql
CREATE USER yarijoo WITH PASSWORD 'yarijoo_dev_pass';
CREATE DATABASE yarijoo_v2 OWNER yarijoo;
GRANT ALL PRIVILEGES ON DATABASE yarijoo_v2 TO yarijoo;
\q
```

### ۳. بازیابی بک‌آپ دیتابیس

```bash
# این دستور همه جداول و داده‌ها رو restore می‌کنه
PGPASSWORD=yarijoo_dev_pass psql -U yarijoo -h localhost -d yarijoo_v2 < database_backup.sql
```

> **توجه:** اگه PostgreSQL نسخه 18 داری از دستور زیر استفاده کن:
> ```bash
> /Applications/Postgres.app/Contents/Versions/18/bin/psql -U yarijoo -h localhost -d yarijoo_v2 < database_backup.sql
> ```

### ۴. تنظیم env

```bash
cp .env.example .env
# فایل .env رو با مقادیر بالا ویرایش کن
```

همچنین backend/.env رو بساز:

```bash
cp .env backend/.env
```

### ۵. Generate کردن Prisma Client

```bash
cd backend
npx prisma generate
cd ..
```

### ۶. اجرای backend

```bash
cd backend
npm run start:dev
# اجرا روی http://localhost:3000
```

### ۷. اجرای frontend (در ترمینال جدید)

```bash
cd frontend
npm run dev
# اجرا روی http://localhost:3001
```

---

## دستورات پرکاربرد

### Backend

```bash
# اجرا در حالت dev (با hot reload)
cd backend && npm run start:dev

# build برای production
cd backend && npm run build && npm run start:prod

# اجرای migration جدید (بعد از تغییر schema.prisma)
cd backend && npx prisma migrate dev --name نام_migration

# باز کردن Prisma Studio (مرورگر دیتابیس)
cd backend && npx prisma studio

# ریست کامل دیتابیس (فقط dev!)
cd backend && npx prisma migrate reset
```

### Frontend

```bash
# اجرا در حالت dev
cd frontend && npm run dev

# build
cd frontend && npm run build

# lint
cd frontend && npm run lint
```

### دیتابیس

```bash
# گرفتن بک‌آپ جدید
PGPASSWORD=yarijoo_dev_pass pg_dump -U yarijoo -h localhost yarijoo_v2 > backup_$(date +%Y%m%d).sql

# اتصال مستقیم به دیتابیس
PGPASSWORD=yarijoo_dev_pass psql -U yarijoo -h localhost yarijoo_v2
```

---

## ساختار پروژه

```
yarijoo-v2/
│
├── backend/                     ← NestJS + Fastify (API)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/            ← OTP + JWT
│   │   │   ├── user/            ← پروفایل کاربر
│   │   │   ├── test/            ← تست‌های روانشناسی
│   │   │   ├── blog/            ← مقالات
│   │   │   ├── book/            ← کتاب‌خانه
│   │   │   ├── course/          ← دوره‌های ویدیویی
│   │   │   ├── shop/            ← فروشگاه + سفارشات
│   │   │   ├── appointment/     ← نوبت‌دهی + روانشناسان
│   │   │   ├── chat/            ← چت Real-time (WebSocket)
│   │   │   ├── notification/    ← اعلان‌ها
│   │   │   ├── ticket/          ← پشتیبانی
│   │   │   ├── subscription/    ← اشتراک‌ها
│   │   │   ├── story/           ← داستان‌ها
│   │   │   ├── search/          ← جستجو
│   │   │   ├── admin/           ← پنل ادمین
│   │   │   └── migration/       ← انتقال داده از سیستم قدیمی
│   │   ├── common/              ← Guards, Decorators, Interceptors
│   │   ├── config/              ← ConfigService
│   │   └── main.ts
│   └── prisma/
│       ├── schema.prisma        ← مدل دیتابیس (44 جدول)
│       └── migrations/
│
├── frontend/                    ← Next.js 15 App Router
│   └── src/
│       ├── app/
│       │   ├── (public)/        ← صفحات عمومی (blog, tests, shop ...)
│       │   ├── (auth)/          ← لاگین
│       │   ├── dashboard/       ← داشبورد کاربر
│       │   └── admin/           ← پنل مدیریت
│       ├── components/
│       │   ├── ui/              ← کامپوننت‌های پایه (Button, Badge ...)
│       │   ├── features/        ← کامپوننت‌های feature-specific
│       │   └── layout/          ← Header, Footer, Sidebar
│       ├── stores/              ← Zustand state management
│       ├── hooks/               ← Custom hooks
│       └── lib/                 ← API client, utilities
│
├── shared/                      ← TypeScript types مشترک
├── nginx/                       ← تنظیمات Nginx (production)
│
├── database_backup.sql          ← بک‌آپ دیتابیس (۷.۱ MB)
├── TODO_LIST.md                 ← لیست کارهای باقی‌مانده
├── .env.example                 ← نمونه متغیرهای محیطی
├── docker-compose.yml           ← Stack توسعه
└── docker-compose.prod.yml      ← Override برای production
```

---

## API Endpoints اصلی

```
# Auth
POST   /api/v1/auth/send-otp          ارسال کد OTP
POST   /api/v1/auth/verify-otp        تأیید OTP و دریافت JWT
POST   /api/v1/auth/refresh           تجدید access token
POST   /api/v1/auth/logout            خروج

# User
GET    /api/v1/users/me               پروفایل کاربر
PATCH  /api/v1/users/me               ویرایش پروفایل

# Tests
GET    /api/v1/tests                  لیست تست‌ها
GET    /api/v1/tests/:slug            جزئیات تست
POST   /api/v1/tests/:slug/start      شروع تست
POST   /api/v1/tests/attempts/:id/submit  ارسال جواب‌ها

# Blog
GET    /api/v1/blog                   لیست مقالات
GET    /api/v1/blog/:slug             جزئیات مقاله

# Shop
GET    /api/v1/shop/products          لیست محصولات
POST   /api/v1/shop/orders            ثبت سفارش
POST   /api/v1/shop/payment/init      شروع پرداخت Zarinpal
GET    /api/v1/shop/payment/callback  callback زرین‌پال

# Appointments
GET    /api/v1/psychologists          لیست روانشناسان
GET    /api/v1/psychologists/:id      پروفایل روانشناس
GET    /api/v1/psychologists/:id/availability  زمان‌های خالی
POST   /api/v1/appointments           رزرو نوبت

# Admin (نیاز به role ADMIN)
GET    /api/v1/admin/dashboard        آمار کلی
GET    /api/v1/admin/users            لیست کاربران
PATCH  /api/v1/admin/users/:id        ویرایش کاربر
```

---

## متغیرهای محیطی (کامل)

```env
NODE_ENV=development

# URLs
FRONTEND_URL=http://localhost:3001
BACKEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3001

# Database
DATABASE_URL=postgresql://yarijoo:yarijoo_dev_pass@localhost:5432/yarijoo_v2
POSTGRES_DB=yarijoo_v2
POSTGRES_USER=yarijoo
DB_PASSWORD=yarijoo_dev_pass

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# MinIO
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET=yarijoo-files

# JWT
JWT_SECRET=dev_jwt_secret_must_be_at_least_32_chars_long_ok
REFRESH_SECRET=dev_refresh_secret_must_be_different_from_jwt_ok
JWT_EXPIRES_IN=15m
REFRESH_EXPIRES_IN=7d

# SMS — کلید واقعی از kavenegar.com بگیر
KAVENEGAR_API_KEY=کلید_واقعی_اینجا

# Payment — از dashboard.zarinpal.com بگیر
ZARINPAL_MERCHANT_ID=00000000-0000-0000-0000-000000000000

# AI
OPENAI_API_KEY=sk-...
```

---

## عیب‌یابی رایج

### خطای اتصال دیتابیس
```
PrismaClientInitializationError: User yarijoo was denied access
```
**راه‌حل:**
```bash
psql -U postgres -c "GRANT ALL ON DATABASE yarijoo_v2 TO yarijoo;"
psql -U postgres -d yarijoo_v2 -c "GRANT ALL ON SCHEMA public TO yarijoo;"
```

### خطای پورت اشغال‌شده
```
Error: listen EADDRINUSE: address already in use :::3001
```
**راه‌حل:**
```bash
lsof -ti:3001 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

### Prisma Client قدیمیه
```bash
cd backend && npx prisma generate
```

### خطای pg_dump version mismatch
```bash
# از pg_dump همان نسخه PostgreSQL استفاده کن
/Applications/Postgres.app/Contents/Versions/18/bin/pg_dump ...
```

---

## اطلاعات تماس و سرویس‌ها

| سرویس | آدرس فعلی |
|-------|-----------|
| API قدیمی (legacy) | https://api.yarijoo.ir/api |
| Frontend قدیمی | https://yarijoo.ir |
| MinIO Dev | http://localhost:9001 |

---

> **نکته:** فایل `database_backup.sql` همین پوشه حاوی تمام ساختار جداول و داده‌های موجود است.  
> برای سوال با سینا در ارتباط باش.
