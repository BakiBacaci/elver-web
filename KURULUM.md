# Elver — Kurulum ve Yayın Kılavuzu

Bu dosya, siteyi Firebase'e (veritabanı + giriş sistemi) bağlamak ve
internette yayınlamak için yapman gerekenleri **sırayla** anlatır.
Adımları atlamadan, yukarıdan aşağıya takip et.

---

## Bölüm 1 — Firebase Projesi Oluştur

1. https://console.firebase.google.com adresine kendi Google hesabınla gir.
2. **"Proje ekle"** (Add project) de. Projeye bir isim ver (örnek: `elver`).
3. Google Analytics sorusunu **kapalı** bırakıp devam et (gerekmiyor).
4. Proje oluşunca panel açılır.

---

## Bölüm 2 — Web Uygulaması Ekle ve Ayarları Kopyala

1. Proje ana sayfasında **`</>`** (Web) simgesine tıkla.
2. Uygulamaya bir takma ad ver (örnek: `elver-web`), **"Uygulamayı kaydet"** de.
3. Karşına şuna benzer bir `firebaseConfig` kod bloğu çıkacak:

   ```js
   const firebaseConfig = {
     apiKey: "AIza....",
     authDomain: "elver-xxxx.firebaseapp.com",
     projectId: "elver-xxxx",
     storageBucket: "elver-xxxx.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abc123"
   };
   ```

4. Bu bilgileri **`js/firebase-ayarlar.js`** dosyasındaki şablonun yerine yapıştır.
   Yani `"BURAYA_API_KEY"` gibi yazan yerleri kendi gerçek değerlerinle değiştir.

> Not: Bu anahtarların web sitesinde görünmesi normaldir; gizli şifre değildir.
> Güvenlik, Bölüm 5'teki "kurallar" ile sağlanır.

---

## Bölüm 3 — Giriş Sistemini (Authentication) Aç

1. Sol menüden **Build > Authentication** > **"Başla"** (Get started).
2. **Sign-in method** sekmesinde **"E-posta/Şifre"** (Email/Password) seçeneğini **etkinleştir** ve kaydet.

---

## Bölüm 4 — Admin (Yönetici) Hesabını Oluştur

1. Authentication ekranında **Users** sekmesine geç.
2. **"Kullanıcı ekle"** (Add user) de.
3. E-posta olarak `js/firebase-ayarlar.js` dosyasındaki `ADMIN_EPOSTA`
   ile **aynı** adresi yaz (varsayılan: `admin@elver.com`).
4. Bir şifre belirle (en az 6 karakter) ve kaydet.

> Bu hesapla giriş yapınca site seni otomatik olarak **Admin Paneli**'ne yönlendirir.
> İstersen `ADMIN_EPOSTA` değerini kendi e-postanla değiştirip o hesabı admin yapabilirsin.

---

## Bölüm 5 — Veritabanını (Firestore) Aç ve Kuralları Ayarla

1. Sol menüden **Build > Firestore Database** > **"Veritabanı oluştur"**.
2. Konum (location) için `eur3 (europe-west)` gibi Avrupa bir bölge seç, devam et.
3. Başlangıçta **"production mode"** seçebilirsin; kuralları birazdan biz gireceğiz.
4. Veritabanı açılınca **Rules (Kurallar)** sekmesine geç ve içeriği şununla değiştir:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {

       // Kampanyalar: herkes okuyabilir, sadece giriş yapan yazabilir/silebilir
       match /kampanyalar/{id} {
         allow read: if true;
         allow write: if request.auth != null;
       }

       // Kullanıcılar: giriş yapan okuyabilir; kişi sadece kendi kaydını yazabilir
       match /kullanicilar/{uid} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.uid == uid;
       }
     }
   }
   ```

5. **"Yayınla"** (Publish) butonuna bas.

---

## Bölüm 6 — Siteyi Bilgisayarında Test Et

Dosyaları çift tıklayıp açmak yerine küçük bir yerel sunucu kullan
(Firebase böyle daha sağlıklı çalışır):

- **En kolay yol:** VS Code'da **"Live Server"** eklentisini kur, `index.html`
  dosyasına sağ tıkla > **"Open with Live Server"**.

Test sırası:
1. `kayit.html`'den normal bir üye oluştur, giriş yap-çık dene.
2. `giris.html` > **Admin Girişi** sekmesinden admin hesabıyla gir.
3. Admin panelinde **"+ Örnek Kampanyaları Yükle"** butonuna **bir kez** bas.
   Veritabanına 6 örnek kampanya eklenir (sitende artık "biraz veri" olur).
4. Ana sayfa ve Kampanyalar sayfasında kampanyaların geldiğini gör.

---

## Bölüm 7 — İnternette Yayınla (Vercel)

Bu site sadece HTML/CSS/JS olduğundan **statik** bir sitedir ve Vercel'de
doğrudan yayınlanır. Ayrı bir sunucu kurmaya gerek yoktur.

**En kolay yol (klasörü sürükle):**
1. https://vercel.com adresine GitHub/Google ile giriş yap.
2. **Add New > Project** de. İstersen önce projeyi GitHub'a yükleyip oradan bağla,
   istersen Vercel CLI ile klasörü doğrudan gönder.
3. Yayın bitince sana `https://...vercel.app` adresli bir link verir. Hocaya bu linki verebilirsin.

**Önemli — Yayın sonrası izin:** Firebase, yalnızca izinli adreslerden girişe izin verir.
1. Firebase konsolu > **Authentication > Settings > Authorized domains**.
2. Vercel'in verdiği `...vercel.app` adresini **ekle**. Aksi halde yayında giriş çalışmaz.

---

## Render Hakkında (Bilgi)

Render, arka planda çalışan bir **sunucu (backend)** gerektiğinde kullanılır.
Bizim sitemizde veritabanı işini Firebase yaptığı için ayrı bir sunucu yok;
bu yüzden **Render'a gerek kalmadan** sadece Vercel ile yayınlamak yeterlidir.
(İleride kendi sunucunu yazarsan Render'ı o zaman kullanırsın.)

---

## Sık Karşılaşılan Sorunlar

- **"Missing or insufficient permissions"**: Firestore kurallarını (Bölüm 5) girmeyi
  veya yayınlamayı unutmuşsundur.
- **Yayında giriş çalışmıyor**: Vercel adresini Authorized domains'e eklemedin (Bölüm 7).
- **Kampanyalar görünmüyor**: Admin panelden örnek verileri yüklemedin (Bölüm 6, adım 3).
- **`firebase is not defined` hatası**: İnternet bağlantını kontrol et; Firebase
  kütüphaneleri internetten yükleniyor.
