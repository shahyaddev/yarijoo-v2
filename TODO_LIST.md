 # 📋 یاری‌جو v2 — لیست کارهای باقی‌مانده
> تاریخ تهیه: ۱۴۰۵/۰۶/۱۱ | برای: شهیاد

---

## 🔴 اولویت بالا (باید انجام شه)

### ۱. Backend — ماژول‌های ناقص

#### احراز هویت (auth)
- [ ] یکپارچه‌سازی واقعی Kavenegar SMS (فعلاً کلید dev داره، باید کلید production تنظیم بشه)
- [ ] محدودیت rate limiting روی `/auth/send-otp` (جلوگیری از spam)
- [ ] Refresh token rotation (اگه نشده)
- [ ] حذف خودکار OTP منقضی‌شده (cron job)

#### سیستم نوبت‌دهی (appointment)
- [ ] اتصال پرداخت Zarinpal قبل از نهایی شدن نوبت
- [ ] ارسال SMS تأیید نوبت به کاربر
- [ ] ارسال SMS یادآوری ۲۴ ساعت قبل از نوبت
- [ ] لینک جلسه آنلاین (meeting_link) — یکپارچه‌سازی با Jitsi یا Whereby
- [ ] منطق استرداد وجه هنگام لغو نوبت

#### چت (chat)
- [ ] صفحه messages فعلاً با داده موک کار می‌کنه — اتصال به WebSocket gateway واقعی
- [ ] Read receipts (علامت خوانده‌شدن)
- [ ] آپلود فایل/تصویر در چت
- [ ] ذخیره‌سازی پیام‌های آفلاین

#### دوره‌ها (course)
- [ ] آپلود ویدیو دروس به MinIO
- [ ] Generate presigned HLS URL برای پخش ویدیو
- [ ] صدور گواهینامه پس از تکمیل دوره (PDF)
- [ ] سیستم پیشرفت (progress tracking) در بک‌اند — تست بشه

#### تست‌های روانشناسی (test)
- [ ] seed کردن تست‌های واقعی در دیتابیس (MBTI, BDI, GAD-7, PSS و …)
- [ ] سیستم نمره‌دهی هوش مصنوعی (OpenAI) — اتصال کلید واقعی
- [ ] محدودیت تعداد درخواست AI برای کاربران رایگان

#### فروشگاه (shop)
- [ ] Zarinpal callback handler کامل
- [ ] آپدیت stock بعد از پرداخت موفق
- [ ] ارسال فاکتور ایمیلی پس از خرید
- [ ] محصولات دیجیتال — ارسال لینک دانلود پس از پرداخت

#### اشتراک‌ها (subscription)
- [ ] تمدید خودکار اشتراک
- [ ] بررسی اشتراک منقضی‌شده و downgrade به FREE (cron job)
- [ ] محدودیت دسترسی به محتوای premium بر اساس اشتراک

---

### ۲. Frontend — صفحات/بخش‌های ناقص

#### صفحه روانشناس
- [ ] `/psychologists/[id]` — پروفایل کامل روانشناس + تقویم رزرو وقت
- [ ] فرم رزرو نوبت با انتخاب تاریخ/ساعت (مرتبط به availability API)
- [ ] صفحه پرداخت نوبت

#### چت
- [ ] `dashboard/messages` — جایگزینی MOCK_ROOMS با داده واقعی از API
- [ ] WebSocket connection در ChatWindow (اتصال به backend gateway)
- [ ] نمایش تاریخچه مکالمات واقعی

#### داشبورد کاربر
- [ ] `dashboard/planner` — تقویم برنامه‌ریزی (Planner) کامل نیاز داره
- [ ] `dashboard/sms-packages` — خرید پکیج پیامکی — اتصال به API
- [ ] صفحه نمایش نتیجه کامل تست با تفسیر و پیشنهادات AI

#### صفحات عمومی
- [ ] `/courses/[slug]/learn` — player ویدیو (باید کار کنه بعد از آپلود فایل‌ها)
- [ ] `/courses/[slug]/certificate` — نمایش/دانلود گواهینامه
- [ ] `/pricing` — بررسی و تکمیل منطق خرید اشتراک

#### پنل ادمین
- [ ] `/admin/tests` — CRUD کامل برای تست‌ها و سوالات
- [ ] `/admin/packages` — مدیریت پکیج‌های ترکیبی
- [ ] `/admin/sms-packages` — مدیریت پکیج پیامکی
- [ ] `/admin/reports` — گزارش‌های مالی و کاربری با نمودار
- [ ] `/admin/settings` — تنظیمات سایت
- [ ] صفحه مدیریت دوره‌ها در ادمین (اضافه نشده)
- [ ] مدیریت روانشناسان (تأیید/رد) در ادمین

---

## 🟡 اولویت متوسط

### ۳. SEO و Performance
- [ ] sitemap.xml داینامیک (بر اساس blog posts, tests, courses واقعی)
- [ ] robots.txt تکمیل‌شده
- [ ] Open Graph image اختصاصی برای هر صفحه بلاگ/محصول
- [ ] Next.js Image optimization — تبدیل img tag ها به `<Image />` کامپوننت
- [ ] Lazy loading بهتر برای صفحه اصلی

### ۴. تجربه کاربری (UX)
- [ ] Toast notifications برای عملیات‌های موفق/ناموفق (بعضی جاها نیست)
- [ ] Skeleton loading state در همه صفحات
- [ ] Error boundary در کل app
- [ ] صفحه 404 فارسی (/not-found.tsx موجوده ولی باید بهتر بشه)
- [ ] پیاده‌سازی dark mode (ساختار داره ولی تکمیل نشده)

### ۵. MinIO / فایل‌ها
- [ ] آپلود تصویر پروفایل کاربر
- [ ] آپلود کاور کتاب/مقاله از ادمین پنل
- [ ] CDN یا پروکسی URL برای MinIO در production
- [ ] Presigned URL با تایم‌اوت برای فایل‌های premium

---

## 🟢 اولویت پایین (بهبودها)

### ۶. تست و کیفیت کد
- [ ] تست‌های unit برای سرویس‌های backend (auth, test, shop)
- [ ] Integration tests برای payment flow
- [ ] E2E tests با Playwright برای frontend
- [ ] Lint rules برای frontend (eslint config کامل‌تر)

### ۷. Infra و DevOps
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] SSL certificate تنظیم برای nginx در production
- [ ] Backup خودکار دیتابیس (cron + S3)
- [ ] Health check endpoint بهبود
- [ ] Monitoring (Sentry یا مشابه)
- [ ] Log aggregation

### ۸. محتوا
- [ ] seed کردن دسته‌بندی‌های واقعی (category table)
- [ ] import مقالات از سیستم قدیمی (migration module آماده‌ست)
- [ ] import کتاب‌ها از سیستم قدیمی
- [ ] import تاریخچه کاربران از MySQL قدیمی

---

## ⚙️ تنظیمات محیطی که باید عوض بشه برای Production

```env
# این‌ها باید با مقادیر واقعی جایگزین بشن:
KAVENEGAR_API_KEY=          # کلید واقعی از kavenegar.com
ZARINPAL_MERCHANT_ID=       # merchant ID واقعی
OPENAI_API_KEY=             # کلید واقعی OpenAI
JWT_SECRET=                 # رشته تصادفی قوی (min 64 chars)
REFRESH_SECRET=             # رشته تصادفی دیگه
DB_PASSWORD=                # پسورد قوی
MINIO_SECRET_KEY=           # پسورد قوی MinIO
DOMAIN=yarijoo.ir           # دامین واقعی
```

---

## 📊 وضعیت کلی پروژه

| بخش | وضعیت | درصد |
|-----|-------|------|
| Backend API | ✅ پایه پیاده‌شده | ~75% |
| Frontend UI | ✅ اکثر صفحات ساخته شده | ~70% |
| Database Schema | ✅ کامل | ~95% |
| Payment | ⚠️ ناقص | ~40% |
| Chat/WebSocket | ⚠️ ناقص | ~50% |
| SMS Integration | ⚠️ نیاز به کلید واقعی | ~60% |
| AI Features | ⚠️ نیاز به کلید واقعی | ~50% |
| Testing | ❌ خیلی کم | ~10% |
| DevOps/Deploy | ❌ آماده نیست | ~20% |

---

## 🗂️ ساختار پروژه (خلاصه)

```
yarijoo-v2/
├── backend/           NestJS + Fastify — پورت 3000
│   ├── src/modules/   auth, blog, book, chat, course, shop, test, ticket ...
│   └── prisma/        schema.prisma + migrations
├── frontend/          Next.js 15 App Router — پورت 3001
│   └── src/app/       (public), (auth), dashboard, admin
├── database_backup.sql  ← بک‌آپ دیتابیس
└── SETUP_GUIDE.md       ← راهنمای راه‌اندازی
```
