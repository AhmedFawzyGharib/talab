# 📚 التوثيق الشامل لتطبيق Talab (طلب) - منصة التوصيل

> منصة توصيل متكاملة تشمل: تطبيق العميل، تطبيق السائق، لوحة تحكم الإدارة، والـ Backend.

---

## 📖 جدول المحتويات

1. [نظرة عامة على المشروع](#نظرة-عامة-على-المشروع)
2. [البنية المعمارية العامة](#البنية-المعمارية-العامة)
3. [المشروع الأول: Backend (الخادم الخلفي)](#1-المشروع-الأول-backend)
4. [المشروع الثاني: Customer App (تطبيق العميل)](#2-المشروع-الثاني-customer-app)
5. [المشروع الثالث: Driver App (تطبيق السائق)](#3-المشروع-الثالث-driver-app)
6. [المشروع الرابع: Admin Dashboard (لوحة تحكم الإدارة)](#4-المشروع-الرابع-admin-dashboard)
7. [التكامل بين المشاريع](#التكامل-بين-المشاريع)
8. [دورة حياة الطلب](#دورة-حياة-الطلب)
9. [النظام المالي](#النظام-المالي)
10. [دليل التشغيل](#دليل-التشغيل)

---

## نظرة عامة على المشروع

**Talab** هي منصة توصيل (Delivery Platform) متكاملة تربط بين:
- **العملاء** (Customers) — يطلبون منتجات أو خدمات توصيل مخصصة
- **التجار** (Merchants) — مطاعم، أسواق، صيدليات، متاجر
- **السائقين** (Drivers) — يوصّلون الطلبات
- **الإدارة** (Admins) — يديرون المنصة بأكملها

### المكونات الأربعة للمشروع:

| المشروع | الوصف | التقنية |
|---------|--------|---------|
| `delivery-app-backend` | الخادم الخلفي (REST API + WebSocket) | Node.js + Express + MongoDB |
| `customer-app` | تطبيق الجوال للعملاء | React Native (Expo) |
| `driver-app` | تطبيق الجوال للسائقين | React Native (Expo) |
| `admin-dashboard` | لوحة تحكم الويب للإدارة | React + Vite |

---

## البنية المعمارية العامة

```
┌─────────────────┐    ┌─────────────────┐    ┌──────────────────┐
│  Customer App   │    │   Driver App    │    │ Admin Dashboard  │
│ (React Native)  │    │ (React Native)  │    │  (React + Vite)  │
└────────┬────────┘    └────────┬────────┘    └────────┬─────────┘
         │                      │                      │
         │      REST API + Socket.IO (WebSocket)       │
         └──────────────────────┼──────────────────────┘
                                │
                       ┌────────▼─────────┐
                       │  Express Server  │
                       │  (Port 5000)     │
                       └────────┬─────────┘
                                │
                       ┌────────▼─────────┐
                       │     MongoDB      │
                       │   (deliveryApp)  │
                       └──────────────────┘
```

### نمط الاتصال:
- **REST API**: للعمليات العادية (تسجيل، إنشاء طلب، استعلام...)
- **Socket.IO (WebSocket)**: للتحديثات الفورية (موقع السائق المباشر، الإشعارات)
- **JWT Tokens**: للمصادقة في كل الطلبات

---

## 1. المشروع الأول: Backend

📁 المسار: [delivery-app-backend/](delivery-app-backend/)

### 🔧 التقنيات المستخدمة

| التقنية | الإصدار | الاستخدام |
|---------|---------|-----------|
| Node.js + Express | 4.18.2 | إطار العمل الأساسي |
| MongoDB + Mongoose | 7.6.3 | قاعدة البيانات |
| Socket.IO | 4.7.2 | الاتصال الفوري |
| jsonwebtoken | 9.0.2 | المصادقة JWT |
| bcryptjs | 2.4.3 | تشفير كلمات المرور |
| Multer | 2.1.1 | رفع الملفات |
| dotenv | 16.3.1 | متغيرات البيئة |

### 📂 هيكل المشروع

```
delivery-app-backend/
└── src/
    ├── server.js              ← نقطة الدخول (Express + Socket.IO)
    ├── app.js                 ← إعدادات تطبيق Express
    ├── config/
    │   └── db.js              ← اتصال MongoDB
    ├── models/                ← نماذج البيانات (12 موديل)
    ├── controllers/           ← منطق الأعمال (7 controllers)
    ├── routes/                ← مسارات الـ API
    ├── middlewares/           ← الـ Middlewares (auth, role, upload)
    ├── utils/                 ← أدوات مساعدة (distance, pricing, email)
    └── uploads/               ← مجلد الملفات المرفوعة
```

### 🗃️ نماذج قاعدة البيانات (Models)

#### 1. **User** — المستخدم الأساسي
```javascript
{
  name, email, phone (unique), password,
  role: 'customer' | 'driver' | 'merchant' | 'admin' | 'super_admin',
  status, isBlocked, isOnline,
  location: { type: 'Point', coordinates: [lng, lat] }  // GeoJSON
}
```

#### 2. **Driver** — معلومات السائق
```javascript
{
  userId (ref User),
  vehicleType: 'bike' | 'car',
  isOnline,
  currentLocation: GeoJSON Point  // مع 2dsphere index
}
```

#### 3. **Merchant** — التاجر
```javascript
{
  user (ref User),
  name,
  type: 'restaurant' | 'market' | 'pharmacy' | 'store',
  location: { lat, lng },
  isActive
}
```

#### 4. **Product** — المنتج
```javascript
{
  merchantId, name, price, quantity,
  description, image, isAvailable
}
```

#### 5. **Order** — الطلب (الموديل الرئيسي)
```javascript
{
  customer, merchant, driver,             // مراجع
  type: 'merchant' | 'custom',
  items: [{ product, quantity, price }],
  deliveryLocation: GeoJSON,
  deliveryAddress,
  status: 'pending' | 'accepted' | 'picked' | 'on_the_way' | 'delivered' | 'cancelled',
  timeline: [...],                        // تتبع تطور الحالات
  distance, deliveryFee, totalPrice,
  platformFee, driverEarnings
}
```

#### 6. **DriverApplication** — طلب الانضمام كسائق
```javascript
{
  fullName, phone, vehicleType,
  licenseImage, idCardImage,
  status: 'pending' | 'approved' | 'rejected'
}
```

#### 7. **MerchantApplication** — طلب الانضمام كتاجر
#### 8. **Otp** — أكواد التحقق (TTL = 5 دقائق)
#### 9. **WithdrawRequest** — طلبات سحب أرباح السائقين
#### 10. **BlockedEmail** — الإيميلات المحظورة
#### 11. **AuditLog** — سجل العمليات الإدارية
#### 12. **Review** — تقييمات

### 🛣️ مسارات الـ API

#### 🔐 المصادقة `/api/auth`
| Method | Endpoint | الوصف |
|--------|----------|--------|
| POST | `/login` | تسجيل دخول (هاتف + كلمة مرور) |
| POST | `/customer/register` | تسجيل عميل (إرسال OTP) |
| POST | `/customer/verify-otp` | التحقق من OTP وإنشاء الحساب |
| POST | `/driver/request-otp` | طلب OTP للسائق المعتمد |
| POST | `/driver/set-password` | تعيين كلمة المرور للسائق |
| POST | `/driver/check-status` | فحص حالة طلب الانضمام |

#### 📦 الطلبات `/api/orders`
| Method | Endpoint | الوصف |
|--------|----------|--------|
| POST | `/` | إنشاء طلب جديد |
| GET | `/my` | طلبات العميل |
| POST | `/custom-delivery` | طلب توصيل مخصص (من-إلى) |
| GET | `/available` | الطلبات المتاحة (للسائق) |
| GET | `/driver/active` | الطلب النشط للسائق |
| PUT | `/:id/accept` | قبول طلب |
| PUT | `/:id/status` | تحديث حالة الطلب |

#### 🚗 السائقون `/api/drivers`
- `PUT /online` — تغيير الحالة (متصل/غير متصل)
- `PUT /location` — تحديث موقع السائق

#### 🛡️ الإدارة `/api/admin`
- إحصائيات لوحة التحكم
- إدارة الطلبات (إلغاء، تعيين سائق)
- اعتماد طلبات السائقين والتجار
- إدارة التجار والمنتجات
- معالجة طلبات السحب

### 🔌 أحداث Socket.IO

#### من السيرفر إلى العميل:
- `liveLocation` — تحديث موقع السائق المباشر
- `orderAccepted` — إشعار العميل بقبول الطلب
- `newOrder` — إشعار السائقين بطلب جديد

#### من العميل إلى السيرفر:
- `registerDriver(phone)` — تسجيل اتصال السائق
- `registerCustomer(customerId)` — تسجيل اتصال العميل
- `joinOrderRoom(orderId)` — الانضمام لغرفة طلب معين
- `driverLocationUpdate({ orderId, lat, lng })` — إرسال الموقع المباشر
- `orderAccepted({ orderId, customerId })` — إعلام العميل

### ⚙️ إعدادات `.env`
```bash
PORT=5000
MONGO_URI=mongodb://localhost:27017/deliveryApp
JWT_SECRET=supersecretkey
```

### 🔒 الأمان والصلاحيات
- **JWT Middleware**: [auth.middleware.js](delivery-app-backend/src/middlewares/auth.middleware.js) — يتحقق من Bearer Token
- **Role Middleware**: [role.middleware.js](delivery-app-backend/src/middlewares/role.middleware.js) — يتحقق من الدور (customer/driver/admin...)
- **مدة JWT**: 7 أيام
- **تشفير كلمات المرور**: bcryptjs

---

## 2. المشروع الثاني: Customer App

📁 المسار: [customer-app/](customer-app/)

### 🔧 التقنيات

| التقنية | الإصدار |
|---------|---------|
| React Native | 0.81.5 |
| Expo | 54.0.33 |
| React Navigation | 7.1.28 |
| Axios | 1.13.5 |
| Socket.IO Client | 4.8.3 |
| AsyncStorage | 2.2.0 |
| React Native Maps | 1.20.1 |
| Expo Location | 19.0.8 |

### 📂 هيكل المشروع

```
customer-app/src/
├── screens/                    ← 12 شاشة
│   ├── LoginScreen.js
│   ├── RegisterScreen.js
│   ├── VerifyOtpScreen.js
│   ├── HomeScreen.js
│   ├── MerchantsScreen.js      ← قائمة المحلات
│   ├── MerchantDetailsScreen.js ← تفاصيل المحل والمنتجات
│   ├── CartScreen.js
│   ├── SelectLocationScreen.js  ← اختيار الموقع على الخريطة
│   ├── OrderSummaryScreen.js
│   ├── CustomDeliveryScreen.js  ← طلب توصيل مخصص
│   ├── TrackingScreen.js        ← تتبع الطلب المباشر
│   └── MyOrdersScreen.js
├── context/
│   ├── AuthContext.js          ← إدارة JWT
│   └── CartContext.js          ← إدارة السلة
├── api/
│   ├── api.js                  ← Axios + Interceptor
│   └── location.js             ← أدوات الموقع
├── navigation.js               ← تكوين Stack Navigator
├── socket.js                   ← اتصال Socket.IO
└── App.js                      ← Providers Wrapper
```

### 🎯 الميزات الرئيسية

1. **التسجيل والمصادقة**
   - تسجيل الدخول بالهاتف + كلمة المرور
   - التسجيل عن طريق OTP (هاتف → كود → كلمة مرور)

2. **التصفح والشراء**
   - استعراض المحلات (مطاعم، أسواق، صيدليات)
   - عرض تفاصيل كل محل ومنتجاته
   - إضافة منتجات للسلة
   - تعديل السلة (إضافة/حذف)

3. **الطلبات**
   - اختيار موقع التوصيل من الخريطة
   - عرض ملخص الطلب والسعر
   - **توصيل مخصص**: طلب من أي موقع إلى أي موقع

4. **التتبع المباشر**
   - مشاهدة موقع السائق على الخريطة في الوقت الفعلي
   - تحديثات حالة الطلب فوراً عبر Socket.IO

5. **سجل الطلبات**
   - عرض الطلبات السابقة وحالاتها

### 🔐 المصادقة
- **التخزين**: `AsyncStorage` تحت مفتاح `token`
- **الحقن التلقائي**: Axios Interceptor يضيف `Authorization: Bearer {token}`

### 🌐 الاتصال
- **Base URL**: `http://192.168.1.5:5000/api` (يحتاج تعديل حسب الـ IP)
- **Socket.IO**: `http://192.168.1.5:5000`

---

## 3. المشروع الثالث: Driver App

📁 المسار: [driver-app/](driver-app/)

### 🔧 التقنيات
نفس التقنيات الأساسية للـ Customer App (React Native + Expo) مع إضافة:
- `@react-native-picker/picker` 2.11.1 — لاختيار نوع المركبة

### 📂 هيكل المشروع

```
driver-app/src/
├── screens/                    ← 8 شاشات
│   ├── LoginScreen.js
│   ├── RegisterScreen.js
│   ├── DriverApplyScreen.js    ← التقديم للعمل كسائق
│   ├── PendingScreen.js        ← شاشة الانتظار للموافقة
│   ├── SetPasswordScreen.js    ← تعيين كلمة المرور بعد القبول
│   ├── VerifyOtpScreen.js
│   ├── HomeScreen.js           ← الواجهة الرئيسية
│   └── ProfileScreen.js
├── context/
│   └── AuthContext.js          ← userToken + applicationPending
├── api/
│   └── api.js                  ← api + publicApi
├── navigation.js               ← 3 Stacks (Auth/Pending/App)
├── socket.js
└── App.js
```

### 🔄 رحلة السائق (3 مراحل)

```
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│  Auth Stack  │   →    │ Pending Stack│   →    │   App Stack  │
│              │        │              │        │              │
│ Login        │        │ Pending      │        │ Home         │
│ DriverApply  │        │ SetPassword  │        │ (Orders +    │
│              │        │ VerifyOtp    │        │  Tracking)   │
└──────────────┘        └──────────────┘        └──────────────┘
   تقديم طلب              انتظار الموافقة         سائق نشط
```

### 🎯 الميزات الرئيسية

1. **تقديم طلب الانضمام**
   - الاسم، الهاتف، نوع المركبة
   - رفع صورة الرخصة + البطاقة الشخصية

2. **حالة الانتظار**
   - مراقبة حالة الطلب
   - إعداد كلمة المرور بعد الموافقة (مع OTP)

3. **الواجهة الرئيسية للسائق**
   - عرض الطلبات المتاحة
   - قبول الطلبات
   - تحديث حالة الطلب: استلمت → في الطريق → تم التوصيل
   - **بث الموقع المباشر** للعميل عبر Socket.IO
   - عرض الأرباح

### 🔐 الحالة المحفوظة
- `driverToken` — JWT للسائق المعتمد
- `applicationPending` — هل الطلب قيد المراجعة؟

---

## 4. المشروع الرابع: Admin Dashboard

📁 المسار: [admin-dashboard/](admin-dashboard/)

### 🔧 التقنيات

| التقنية | الإصدار |
|---------|---------|
| React | 19.2.0 |
| Vite | 8 (beta) |
| React Router DOM | 7.13.0 |
| Tailwind CSS | 3.4.19 |
| Recharts | 3.7.0 |
| Leaflet + Leaflet Heat | 1.9.4 |
| TanStack React Table | 8.21.3 |
| Axios | 1.13.5 |

### 📂 هيكل المشروع

```
admin-dashboard/src/
├── pages/                      ← 21 صفحة
│   ├── Login.jsx
│   ├── DashboardLayout.jsx     ← الإطار العام
│   ├── Overview.jsx            ← الإحصائيات
│   ├── Drivers.jsx
│   ├── DriverApplications.jsx
│   ├── DriversMap.jsx          ← خريطة السائقين
│   ├── DriversHeatMap.jsx      ← خريطة حرارية
│   ├── Merchants.jsx
│   ├── MerchantApplications.jsx
│   ├── CreateMerchant.jsx
│   ├── Products.jsx
│   ├── CreateProduct.jsx
│   ├── AdminOrders.jsx
│   ├── LiveOrders.jsx          ← الطلبات الفورية
│   ├── LiveOrdersMap.jsx
│   ├── DispatchMap.jsx         ← خريطة التوزيع
│   ├── Analytics.jsx
│   ├── Withdraws.jsx           ← طلبات سحب الأرباح
│   ├── BlockedEmails.jsx
│   └── CreateUser.jsx
├── components/
│   ├── DataTable.jsx
│   ├── Pagination.jsx
│   ├── SearchBar.jsx
│   ├── OrderModal.jsx
│   └── AssignDriverModal.jsx
├── context/
│   └── AuthContext.jsx         ← JWT في localStorage
├── services/
│   └── api.js                  ← Axios Instance
└── App.jsx                     ← Routing الأساسي
```

### 🎯 الميزات الرئيسية

#### 📊 لوحة الإحصائيات
- عدد السائقين، التجار، الطلبات
- الإيرادات الإجمالية
- الطلبات المعلقة

#### 🚗 إدارة السائقين
- عرض جميع السائقين
- اعتماد/رفض طلبات الانضمام
- **خريطة مباشرة** لكل السائقين
- **خريطة حرارية** لتوزع السائقين

#### 🏪 إدارة التجار
- عرض/إنشاء تجار
- اعتماد طلبات الانضمام
- إدارة المنتجات (إضافة، حذف، تفعيل/تعطيل)

#### 📦 إدارة الطلبات
- عرض جميع الطلبات
- **الطلبات الفورية** على الخريطة
- **خريطة التوزيع**: تعيين سائق لطلب
- إلغاء طلب

#### 💰 الإدارة المالية
- معالجة طلبات سحب الأرباح
- اعتماد/رفض السحب

#### 📈 التحليلات
- رسوم بيانية لنمو المنصة (Recharts)

#### 🛠️ أدوات إدارية
- إنشاء مستخدمين
- حظر إيميلات

### 🔐 المصادقة
- **التخزين**: `localStorage` تحت `adminToken`
- Axios Interceptor يحقن الـ Token تلقائياً

### 🛣️ التوجيه (Routing)
```
/login                          ← تسجيل الدخول
/                              ← DashboardLayout (محمي)
  ├── /                        → Overview
  ├── /drivers
  ├── /driver-applications
  ├── /drivers-map
  ├── /merchants
  ├── /merchant-applications
  ├── /merchants/create
  ├── /products
  ├── /products/create
  ├── /orders
  ├── /live-orders
  ├── /analytics
  ├── /withdraws
  ├── /dispatch-map
  ├── /blocked-emails
  └── /create-user
```

---

## التكامل بين المشاريع

### 🔄 تدفق المصادقة الموحد
```
المستخدم → تسجيل/دخول → JWT Token → تخزين محلي → حقن في كل طلب
```

### 📡 الاتصال الفوري (Socket.IO)
السيرفر يدير:
- تسجيل اتصال السائقين والعملاء
- غرف الطلبات (Order Rooms)
- بث المواقع المباشرة
- إرسال الإشعارات

### 🔌 معالجة الـ API الموحدة
كل التطبيقات تستخدم نفس النمط:
```javascript
// Axios Interceptor
api.interceptors.request.use(config => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

## دورة حياة الطلب

```
┌─────────┐   ┌──────────┐   ┌────────┐   ┌────────────┐   ┌───────────┐
│ pending │ → │ accepted │ → │ picked │ → │ on_the_way │ → │ delivered │
└─────────┘   └──────────┘   └────────┘   └────────────┘   └───────────┘
   العميل      السائق         السائق        السائق           السائق
   ينشئ       يقبل           استلم          في الطريق        وصّل
   الطلب                     الطلب                          الطلب

   أو في أي وقت → ┌───────────┐
                  │ cancelled │
                  └───────────┘
```

### الأحداث Socket.IO المرتبطة:
1. **Pending** → يُبث `newOrder` لكل السائقين الأونلاين القريبين
2. **Accepted** → يُبث `orderAccepted` للعميل
3. **On the way** → يُبث `liveLocation` بشكل مستمر للعميل

---

## النظام المالي

### 💰 معادلة التسعير
```
رسوم التوصيل = الرسوم الأساسية (5) + (المسافة × سعر/كم)
سعر الكيلو = 2

عمولة المنصة   = 10% من إجمالي الطلب
أرباح السائق   = 90% من إجمالي الطلب
```

### 📍 الحسابات الجغرافية
- جميع المواقع مخزنة بتنسيق **GeoJSON Point**
- استخدام **2dsphere indexes** للاستعلامات الجغرافية السريعة
- حساب المسافة عبر [utils/distance.js](delivery-app-backend/src/utils/distance.js)

### 💸 سحب الأرباح
- السائق يطلب السحب → `WithdrawRequest`
- الإدارة تعتمد/ترفض من لوحة التحكم

---

## دليل التشغيل

### 📋 المتطلبات
- Node.js 18+
- MongoDB (محلي أو MongoDB Atlas)
- Expo CLI لتطبيقات الجوال
- IP محلي (مثل `192.168.1.5`) لتشغيل التطبيقات على الجوال

### 🚀 1. تشغيل الـ Backend
```bash
cd delivery-app-backend
npm install
# أنشئ ملف .env بالمتغيرات المطلوبة
npm run dev      # وضع التطوير (Nodemon)
# أو
npm start        # الإنتاج
```
الخادم يعمل على: `http://localhost:5000`

### 💻 2. تشغيل لوحة الإدارة
```bash
cd admin-dashboard
npm install
npm run dev
```
عادة على: `http://localhost:5173`

### 📱 3. تشغيل تطبيق العميل
```bash
cd customer-app
npm install
# عدّل الـ IP في src/api/api.js و src/socket.js إلى IP جهازك المحلي
npx expo start
```

### 🚗 4. تشغيل تطبيق السائق
```bash
cd driver-app
npm install
# نفس التعديل على IP
npx expo start
```

### ⚠️ ملاحظات مهمة
1. **عنوان IP**: يجب تغيير `192.168.1.5` في تطبيقات الجوال إلى IP جهازك الذي يعمل عليه الـ Backend.
2. **MongoDB**: تأكد من تشغيل خدمة MongoDB قبل تشغيل الـ Backend.
3. **الشبكة**: تطبيقات الجوال والـ Backend يجب أن يكونوا على نفس الشبكة.
4. **الإذن للموقع**: تطبيقات الجوال تحتاج صلاحيات الموقع لتعمل بشكل صحيح.
5. **رفع الملفات**: تأكد من وجود مجلد `uploads/` في الـ Backend.

---

## 🔑 أدوار المستخدمين (Roles)

| الدور | الصلاحيات |
|-------|----------|
| `customer` | إنشاء طلبات، تتبعها، تقييمها |
| `driver` | قبول الطلبات، تحديث الحالة، طلب سحب |
| `merchant` | إدارة منتجاته، استلام الطلبات |
| `admin` | كل العمليات الإدارية |
| `super_admin` | صلاحيات مطلقة + إدارة المسؤولين |

---

## 📌 ملخص نقاط القوة في المعمارية

✅ **فصل واضح** بين المشاريع الأربعة (Microservices-like)
✅ **REST + WebSocket** = أداء مثالي للعمليات الفورية
✅ **JWT-based auth** موحدة في كل التطبيقات
✅ **GeoJSON + 2dsphere** = استعلامات جغرافية سريعة
✅ **Role-based Access Control** على مستوى الـ Middleware
✅ **Context API** كحل خفيف لإدارة الحالة
✅ **Workflow متكامل** للتقديم والاعتماد للسائقين والتجار

---

## 📞 الدعم والصيانة

- **سجل العمليات**: نموذج `AuditLog` يسجل كل العمليات الإدارية
- **OTP TTL**: 5 دقائق (تنتهي صلاحية الكود تلقائياً)
- **JWT Expiry**: 7 أيام
- **Soft Delete / Block**: عبر `isBlocked` في موديل `User`

---

> 📅 **تاريخ التوثيق**: 2026-05-03
> 🏗️ **الإصدار**: v1
