<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Trading Desk Sk (Trading Desk & Assistant)

دستیار و میزکار معامله‌گری پرو سهیل کشتکار - استراتژی‌های کانال، BTB و اسپایک همراه با مدیریت ریسک، ژورنال‌نویسی، محاسبه Win Rate، واترمارک و خروجی اکسل.

## ساخت خودکار نصب‌کننده ویندوز (Windows Installer / `.exe`) با گیت‌هاب (GitHub Actions)

این پروژه مجهز به یک فایل کانفیگ GitHub Actions (`.github/workflows/build-desktop.yml`) است که به صورت خودکار با هر بار پوش کردن کد به مخزن گیت‌هاب شما، فایل نصبی (`.exe`) ویندوز را می‌سازد.

### مراحل اتصال به گیت‌هاب و ساخت فایل `.exe`:

1. **ایجاد مخزن (Repository) در گیت‌هاب:**
   در گیت‌هاب یک ریپازیتوری جدید (مثلاً با نام `Trading-Desk-Sk`) بسازید.

2. **اتصال پروژه محلی به گیت‌هاب:**
   دستورات زیر را در ترمینال پروژه اجرا کنید (به جای URL زیر، آدرس ریپازیتوری خود را قرار دهید):
   ```bash
   git init
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git branch -M main
   git add .
   git commit -m "Initial commit - Trading Desk Sk"
   git push -u origin main
   ```

3. **دریافت فایل نصبی (`.exe`):**
   - پس از پوش کردن کد، وارد ریپازیتوری خود در گیت‌هاب شوید.
   - به تب **Actions** بروید.
   - روی ورک‌فلو در حال اجرا یا تکمیل شده (`Build Desktop App`) کلیک کنید.
   - پس از اتمام ساخت (Build)، در بخش **Artifacts** می‌توانید فایل فشرده حاوی فایل نصبی `.exe` ویندوز را دانلود کنید.

---

## اجرای محلی (Local Development)

1. نصب وابستگی‌ها:
   ```bash
   npm install
   ```
2. اجرای حالت وب (برنامه تحت وب):
   ```bash
   npm run dev
   ```
3. ساخت نسخه دسکتاپ به صورت محلی (روی ویندوز):
   ```bash
   npm run build
   npm run build:desktop
   ```

