<div align="center" dir="rtl">
  🌐 <a href="README.md" dir="ltr">Read in English</a> | <strong>خواندن به زبان فارسی</strong>
</div>

<div align="center" dir="rtl">

<img src="icons/icon.png" alt="ALAD Logo" width="120" />

<h1>🎙️ ALAD — دوبله زنده صوتی با هوش مصنوعی</h1>

<p><strong>دوبله زنده و بلادرنگ با هوش مصنوعی برای تمام تب‌های کروم، با قدرت گوگل Gemini 3.5 Live.</strong></p>

<p dir="ltr">
  <a href="https://github.com/navidseyedain/ALAD/stargazers"><img src="https://img.shields.io/github/stars/navidseyedain/ALAD?style=for-the-badge&color=FFD700" alt="Stars"></a>
  <img src="https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Manifest V3">
  <img src="https://img.shields.io/badge/Powered%20By-Gemini%203.5%20Live-00C896?style=for-the-badge&logo=google&logoColor=white" alt="Gemini">
  <img src="https://img.shields.io/badge/Languages-78-blueviolet?style=for-the-badge" alt="78 Languages">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License">
</p>

<p>
  <b>هر ویدیویی را تماشا کنید. آن را فوراً به زبان خودتان بشنوید.</b><br/>
  بدون نیاز به اشتراک. بدون نیاز به ساخت اکانت. ۱۰۰٪ رایگان و اوپن‌سورس.
</p>

<br/>

<img src="docs/screenshot-youtube-dubbing.png" alt="ALAD dubbing a YouTube video live" width="800"/>

<br/><br/>

</div>

---

<div dir="rtl">

## 🎬 عملکرد افزونه را ببینید

</div>

https://github.com/user-attachments/assets/fa4c6e32-fb13-43d2-afd1-a2240ba212f4

---

<div dir="rtl">

## 🌍 ALAD چیست؟

**ALAD (AI Live Audio Dubbing)** یک افزونه کروم رایگان و اوپن‌سورس است که سد زبانی را برای هر محتوایی که آنلاین تماشا می‌کنید، می‌شکند. این افزونه در پس‌زمینه بی‌صدا کار می‌کند — صدای تب فعال شما را ضبط می‌کند، آن را از طریق یک اتصال پایدار WebSocket به پیشرفته‌ترین مدل گوگل یعنی **Gemini 3.5 Live Translate** می‌فرستد و صدای ترجمه‌شده را به صورت بلادرنگ پخش می‌کند.

برخلاف ابزارهای سنتی تولید زیرنویس، ALAD **دوبله صوتی و گفتاری زنده** تولید می‌کند — شما ترجمه را *می‌شنوید*، نه اینکه فقط آن را بخوانید.

**مثال‌هایی از کاربردها:**
- 🎬 تماشای یک سریال کره‌ای بدون زیرنویس و شنیدن آن به زبان انگلیسی یا فارسی
- 📰 گوش دادن به یک پادکست خبری آلمانی که زنده به عربی دوبله می‌شود
- 🎓 دنبال کردن یک سخنرانی ژاپنی به زبان فارسی به صورت بلادرنگ
- 🎮 تماشای استریمرهای خارجی در توییچ و فهمیدن تمام حرف‌هایشان

---

## ✨ امکانات

### 🎙️ هسته اصلی: دوبله زنده با هوش مصنوعی
- **استریم دوطرفه بلادرنگ (Real-time)** از طریق WebSocket به Gemini API — با کمترین تأخیر ممکن
- **بی‌صدا کردن خودکار** صدای اصلی تب هنگام شروع دوبله و بازگرداندن آن هنگام توقف
- **بافر هوشمند صدا** — صف‌بندی تکه‌های صوتی دریافت‌شده قبل از تکمیل هندشیک WebSocket، بنابراین هرگز کلمات اول را از دست نمی‌دهید
- **بازیابی نشست (Session resumption)** که در پروتکل تعبیه شده است برای اتصال مجدد بدون قطعی
- روی **یوتیوب، توییچ، ویمیو، نتفلیکس، پادکست‌ها، وبینارها** و دقیقاً هر تبی که صدا پخش کند کار می‌کند

### 🌐 سازگاری جهانی با تمام تب‌ها
محدود به یوتیوب نیست. اگر تب مرورگر صدا پخش کند — **ALAD می‌تواند آن را دوبله کند**.

### 🗺️ پشتیبانی از ۷۸ زبان
(شامل فارسی، انگلیسی، اسپانیایی، فرانسوی، آلمانی، ترکی، عربی، کره‌ای، ژاپنی و...)

### 📊 داشبورد پیشرفته آمار استفاده
یک صفحه کامل آنالیز — که **۱۰۰٪ به صورت لوکال (محلی)** روی دستگاه خودتان ذخیره می‌شود.

</div>

<div align="center">
<img src="docs/screenshot-stats-dashboard.png" alt="ALAD Usage Stats Dashboard" width="800"/>
</div>

<div dir="rtl">

- **هیت‌مپ (Heatmap) فعالیت مشابه گیت‌هاب** — مشاهده تاریخچه ۳۶۴ روزه دوبله‌های شما در یک نگاه
- **نمودار الگوی شنیداری ۲۴ ساعته** — کشف ساعات اوج استفاده شما از افزونه
- **برترین زبان‌ها و دامنه‌ها** — ببینید چه محتوایی را بیشتر دوبله کرده‌اید
- **فیلترهای زمانی هوشمند** — ۷ روز، ۳۰ روز، ۹۰ روز یا کل تاریخچه
- ذخیره تا **۲۰۰۰ نشست (Session)** به صورت لوکال و بدون انقضا

### 🎨 رابط کاربری تیره و زیبا

</div>

<div align="center">
<img src="docs/screenshot-popup-idle.png" alt="ALAD Popup — Idle state" width="340"/>
&nbsp;&nbsp;&nbsp;
<img src="docs/screenshot-popup-languages.png" alt="ALAD Popup — Language selector" width="340"/>
</div>

<br/>

<div dir="rtl">

- پاپ‌آپ **تم تاریک (Dark-themed)** و جذاب که حس یک برنامه نیتیو را در کروم می‌دهد
- **انتخاب‌گر زبان اختصاصی** با اسکرول نرم و اسکرول‌بار طراحی‌شده
- **تایمر زنده نشست** هنگام فعال بودن دوبله

</div>

<div align="center">
<img src="docs/screenshot-popup-connecting.png" alt="ALAD Popup — Connecting state" width="340"/>
</div>

<div dir="rtl">

### 🔒 حریم خصوصی اولویت ماست
- **بدون ردیابی، بدون تله‌متری** — تمام داده‌های نشست‌ها روی سیستم شما باقی می‌ماند
- **مدل BYOK (کلید خودتان را بیاورید)** — شما از کلید رایگان Gemini API خودتان استفاده می‌کنید
- **بدون نیاز به حساب کاربری** — نه ثبت‌نامی، نه لاگینی و نه اشتراکی در کار است

---

## 🛠️ آموزش نصب (حالت Developer)

⚠️ افزونه ALAD هنوز در Chrome Web Store منتشر نشده است. برای نصب دستی مراحل زیر را دنبال کنید:

۱. **این ریپازیتوری را دانلود یا کلون کنید:**

</div>

```bash
git clone https://github.com/navidseyedain/ALAD.git
```

<div dir="rtl">

۲. مرورگر کروم را باز کرده و به آدرس <code dir="ltr">chrome://extensions/</code> بروید.
<br>۳. گزینه **Developer mode** را (در گوشه بالا سمت راست) فعال کنید.
<br>۴. روی دکمه **Load unpacked** کلیک کنید.
<br>۵. پوشه پروژه <code dir="ltr">ALAD</code> را انتخاب کنید.
<br>۶. ✅ آیکون ALAD در نوار ابزار شما ظاهر می‌شود — برای دسترسی راحت‌تر آن را **پین (Pin)** کنید.

---

## ⚡ شروع سریع

### مرحله ۱ — دریافت کلید API رایگان
افزونه ALAD از Gemini API استفاده می‌کند. برای دریافت کلید رایگان خود:

۱. به **[Google AI Studio](https://aistudio.google.com/app/apikey)** بروید.
<br>۲. با اکانت گوگل خود وارد شوید.
<br>۳. روی **"Create API Key"** کلیک کرده و کلید تولید شده را کپی کنید.

💡 محدودیت طرح رایگان گوگل بسیار سخاوتمندانه است و برای استفاده روزمره شخصی کاملاً کافی است.

### مرحله ۲ — پیکربندی ALAD
۱. روی آیکون ALAD در نوار ابزار کروم کلیک کنید.
<br>۲. در پایین پاپ‌آپ، کنار عبارت <em>Gemini API key</em> روی **"Show"** کلیک کنید.
<br>۳. کلید خود را جای‌گذاری (Paste) کرده و روی **Save** کلیک کنید.

### مرحله ۳ — شروع دوبله
۱. به هر تبی که در حال پخش صداست بروید (مثل یوتیوب، پادکست و...).
<br>۲. زبان مقصد خود را از لیست انتخاب کنید (مثلاً Persian).
<br>۳. روی **"Start dubbing"** کلیک کنید.
<br>۴. صدای اصلی بی‌صدا می‌شود — و هوش مصنوعی کنترل را به دست می‌گیرد! 🎙️

### مرحله ۴ — توقف
روی **"Stop dubbing"** کلیک کنید تا صدای اصلی ویدیو بازگردد. اطلاعات این نشست به طور خودکار در بخش آمارهای شما ذخیره می‌شود.

---

## 🧠 این افزونه چگونه کار می‌کند؟

</div>

```mermaid
flowchart TD
    subgraph Browser
        Tab[Active Tab]
        Worker[Background Service Worker]
        Storage[(chrome.storage.local)]
        
        subgraph Audio Pipeline
            Offscreen[Offscreen Document]
            AudioCtx[AudioContext]
        end
    end

    subgraph Cloud
        Gemini((Gemini 3.5 Live API))
    end

    Tab -- "tabCapture (MediaStream)" --> Offscreen
    Worker -. "Manages lifecycle" .-> Offscreen
    Worker -. "Saves sessions" .-> Storage
    
    Offscreen -- "Audio in (PCM 16kHz)" --> Gemini
    Gemini -- "Translated audio (PCM 24kHz)" --> Offscreen
    
    Offscreen -- "Play dubbed audio" --> AudioCtx
```

<div dir="rtl">

<br>

| بخش | تکنولوژی | هدف |
|:---:|:---:|:---|
| **ضبط صدا** | <code dir="ltr">chrome.tabCapture</code> | ضبط استریم صوتی هر تب مرورگر |
| **مدل هوش مصنوعی** | <code dir="ltr">gemini-3.5-live</code> | ترجمه و تبدیل گفتار دوطرفه به صورت بلادرنگ |
| **پروتکل ارتباطی** | <code dir="ltr">WebSocket</code> | استریم بی‌وقفه با کمترین تأخیر |
| **پخش صدا** | <code dir="ltr">AudioContext</code> | پخش صدای دوبله‌شده برای کاربر |
| **ردیابی نشست‌ها** | <code dir="ltr">chrome.storage.local</code> | ذخیره تا ۲۰۰۰ نشست به صورت محلی |
| **تنظیمات** | <code dir="ltr">chrome.storage.sync</code> | ذخیره کلید API در اکانت مرورگر |

---

## 📁 ساختار پروژه

</div>

```text
ALAD/
├── manifest.json          # مانیفست افزونه کروم (نسخه ۳)
├── icons/
│   ├── icon.png           # آیکون افزونه (رنگی)
│   └── iconw.png          # آیکون افزونه (پس‌زمینه شفاف/سفید)
├── popup/
│   ├── popup.html         # رابط کاربری پاپ‌آپ افزونه
│   ├── popup.css          # استایل‌های تم تاریک پاپ‌آپ
│   └── popup.js           # منطق پاپ‌آپ، لیست ۷۸ زبان، تایمر نشست
├── scripts/
│   ├── background.js      # سرویس ورکر: چرخه حیات دوبله و ذخیره نشست‌ها
│   ├── offscreen.html     # فایل میزبان (Host) داکیومنت آف‌اسکرین
│   ├── offscreen.js       # ضبط صدا + پل ارتباطی وب‌سوکت با جمنای
│   └── content.js         # اسکریپت محتوا: بی‌صدا و صدادار کردن پلیر تب
├── services/
│   └── gemini.js          # کلاینت وب‌سوکت جمنای
├── stats/
│   ├── index.html         # داشبورد آمار استفاده
│   ├── style.css          # استایل‌های داشبورد (هیت‌مپ، نمودارها، تم تاریک)
│   └── script.js          # منطق داشبورد (رندر نمودارها، فیلترها)
└── docs/                  # اسکرین‌شات‌ها برای فایل README
```

<div dir="rtl">

---

## 🔧 عیب‌یابی (Troubleshooting)

| مشکل | راه‌حل |
|:---|:---|
| **صدا بعد از شروع پخش نمی‌شود** | مطمئن شوید که تب در حال پخش صداست. بررسی کنید کلید API شما معتبر باشد و سهمیه آن تمام نشده باشد. |
| **خطای WebSocket** | ممکن است کلید API شما اشتباه باشد. سعی کنید یک کلید جدید در <a href="https://aistudio.google.com/app/apikey">AI Studio</a> بسازید. |
| **داشبورد آمار خالی است** | نشست‌ها تنها زمانی ثبت می‌شوند که دوبله را متوقف (Stop) کنید. یک نشست انجام دهید و صفحه آمار را رفرش کنید. |
| **صدای اصلی ویدیو قطع نمی‌شود** | برخی از پلیرهای وب اجازه بی‌صدا کردن با جاوا اسکریپت را نمی‌دهند. صفحه را رفرش کنید و دوباره امتحان کنید. |
| **آیکون افزونه نمایش داده نمی‌شود** | افزونه را در تب <code dir="ltr">chrome://extensions/</code> ری‌لود (Reload) کنید تا کش آیکون پاک شود. |

---

## 🗺️ نقشه راه (Roadmap)

- [ ] انتشار در Chrome Web Store
- [ ] تشخیص خودکار زبان (شناسایی زبان مبدأ به صورت اتوماتیک)
- [ ] کلیدهای میانبر شخصی‌سازی شده برای شروع/توقف دوبله
- [ ] اکسپورت (خروجی گرفتن) آمارها به فرمت CSV
- [ ] پشتیبانی از انتخاب صدای طبیعی برای هر زبان به صورت مجزا

---

## 🤝 مشارکت

از هرگونه مشارکت، گزارش باگ یا پیشنهاد قابلیت جدید استقبال می‌شود!

۱. ریپازیتوری را فورک (Fork) کنید.
<br>۲. برنچ فیچر خود را بسازید: <code dir="ltr">git checkout -b feature/AmazingFeature</code>
<br>۳. تغییرات را کامیت کنید: <code dir="ltr">git commit -m 'feat: add AmazingFeature'</code>
<br>۴. تغییرات را روی گیت‌هاب خود پوش کنید: <code dir="ltr">git push origin feature/AmazingFeature</code>
<br>۵. یک Pull Request باز کنید.

---

## 📜 لایسنس

این پروژه تحت لایسنس **MIT** منتشر شده است. برای اطلاعات بیشتر فایل <code dir="ltr">LICENSE</code> را ببینید.

---

## 🙏 تشکر و قدردانی

- از **[Google DeepMind](https://deepmind.google/)** برای توسعه مدل فوق‌العاده Gemini 3.5 Live Translate.
- از **[Google AI Studio](https://aistudio.google.com/)** برای ارائه دسترسی رایگان به API.

---

</div>

<div align="center" dir="rtl">
  <p>اگر ALAD شما را حتی برای یک ویدیو از خواندن زیرنویس‌ها نجات داد — با دادن یک ⭐ از ما حمایت کنید!</p>
  <strong>ساخته شده با ❤️ برای تمام زبان‌آموزان، جهانگردان و ذهن‌های کنجکاو در سراسر دنیا.</strong>
</div>
