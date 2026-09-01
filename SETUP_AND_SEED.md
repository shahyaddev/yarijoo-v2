# راهنمای راه‌اندازی و Seed دیتابیس یاری‌جو v2

## پیش‌نیازها

- PostgreSQL 16+ در حال اجرا
- Node.js 20+
- Redis (اختیاری برای queue)

---

## ۱. تنظیم متغیرهای محیطی

فایل `backend/.env` را با مقادیر واقعی ویرایش کنید:

```env
DATABASE_URL="postgresql://yarijoo:YOUR_PASSWORD@localhost:5432/yarijoo_v2?schema=public"
JWT_SECRET=a_very_long_random_string_min_64_chars_here
REFRESH_SECRET=another_very_long_random_string_here
```

---

## ۲. ساخت دیتابیس در PostgreSQL

```sql
CREATE USER yarijoo WITH PASSWORD 'yarijoo_dev_pass';
CREATE DATABASE yarijoo_v2 OWNER yarijoo;
GRANT ALL PRIVILEGES ON DATABASE yarijoo_v2 TO yarijoo;
```

---

## ۳. اجرای Migrations

```bash
cd backend
npx prisma migrate deploy
# یا برای محیط dev:
npx prisma migrate dev
```

---

## ۴. اجرای Seed — ثبت داده‌های اولیه

```bash
cd backend
npm run seed
```

این دستور موارد زیر را در دیتابیس ثبت می‌کند:

| دسته | تعداد | توضیح |
|------|-------|-------|
| Categories | ۱۲ | دسته‌بندی blog, book, course |
| Admin User | ۱ | شماره: +989100000000 |
| Tests | ۸ | GAD-7, BDI, PSS, MBTI, EQ, OCD, Social Anxiety, Relationship |
| Test Questions | ~۸۰ | سوالات استاندارد با گزینه‌های نمره‌دار |
| Test Interpretations | ~۲۵ | بازه‌های نمره با تفسیر فارسی |
| Courses | ۴ | با ۶-۱۰ درس هر کدام |
| Books | ۴ | با صفحات محتوا |
| Blog Posts | ۶ | منتشرشده |
| Stories | ۸ | داستان‌های روانشناختی |
| Psychologists | ۶ | با پروفایل کامل و availability |
| Products | ۶ | محصولات دیجیتال و فیزیکی |
| Settings | ۲۰ | تنظیمات سیستم |
| Discount Codes | ۳ | WELCOME20, HEALTH50, MINDFUL10 |

---

## ۵. ورود به پنل ادمین

برای ورود به پنل ادمین، ابتدا یک OTP با شماره ادمین بگیرید:

```bash
curl -X POST http://localhost:3333/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+989100000000"}'
```

در محیط dev (بدون کلید کاوه‌نگار)، کد OTP در لاگ سرور چاپ می‌شود:
```
[OTP] SMS to +989100000000: 123456
```

---

## ۶. راه‌اندازی سرویس‌ها

```bash
# Backend (پورت 3333)
cd backend
npm run start:dev

# Frontend (پورت 3001)  
cd frontend
npm run dev
```

---

## ۷. نکات مهم Schema

فیلدهای جدید اضافه‌شده به جدول `appointments`:
- `zarinpal_authority` — کد اتوریتی زرین‌پال
- `zarinpal_ref_id` — کد پیگیری پرداخت
- `reminder_sent` — آیا یادآور ۲۴ ساعته ارسال شده

این migration به صورت خودکار با `prisma migrate deploy` اعمال می‌شود.

---

## ۸. Reset کامل دیتابیس (در صورت نیاز)

```bash
cd backend
npm run db:reset
```

⚠️ این دستور تمام داده‌ها را پاک و دوباره seed می‌کند.
