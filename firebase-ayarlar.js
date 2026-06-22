/* ============================================================
   ELVER - FIREBASE AYAR DOSYASI (firebase-ayarlar.js)
   ------------------------------------------------------------
   Sitenin veritabanı (Firestore) ve giriş sistemi (Auth)
   buradaki ayarlarla Google Firebase'e bağlanır.

   ÖNEMLİ: Bu dosyadaki "firebaseConfig" bilgileri ŞABLONDUR.
   Kendi Firebase projeni oluşturup, oradaki gerçek bilgileri
   buraya yapıştırman gerekir. Nasıl yapılacağı KURULUM.md
   dosyasında adım adım anlatılıyor.

   Bu dosya tüm sayfalarda, diğer js dosyalarından ÖNCE
   yüklenir. Böylece "db" ve "auth" değişkenleri her yerde
   hazır olur.
   ============================================================ */


/* ------------------------------------------------------------
   1) FIREBASE PROJE BİLGİLERİ
   ------------------------------------------------------------
   Firebase konsolundan (Proje Ayarları > Genel > "Web uygulaması")
   aldığın bilgileri aşağıdaki tırnakların içine yapıştır.
   Her satırın ne olduğunu yanına yazdım.
   ------------------------------------------------------------ */
var firebaseConfig = {
    apiKey: "AIzaSyDIMb9E8U8-zJCh9KszD18Y1-yIz0j9jWk",          // Projenin anahtarı
    authDomain: "elver-app-db9f8.firebaseapp.com",             // Giriş (login) adresi
    projectId: "elver-app-db9f8",                              // Proje kimliği
    storageBucket: "elver-app-db9f8.firebasestorage.app",      // Dosya deposu (kullanmıyoruz ama dursun)
    messagingSenderId: "791332966723",                         // Bildirim kimliği (kullanmıyoruz)
    appId: "1:791332966723:web:4c38a60df81ae5697a1ff6"         // Uygulama kimliği
};


/* ------------------------------------------------------------
   2) ADMIN (YÖNETİCİ) E-POSTASI
   ------------------------------------------------------------
   Bu e-posta ile giriş yapan kişi "admin" sayılır ve admin
   paneline girebilir. Burayı kendi yönetici e-postanla değiştir.
   Bu hesabı Firebase'de oluşturmayı unutma (KURULUM.md'de var).
   ------------------------------------------------------------ */
var ADMIN_EPOSTA = "admin@elver.com";


/* ------------------------------------------------------------
   3) FIREBASE'İ BAŞLAT
   ------------------------------------------------------------
   Yukarıdaki ayarlarla Firebase'i çalıştırıyoruz. Ardından
   veritabanı (db) ve giriş sistemi (auth) kısayollarını
   oluşturuyoruz ki diğer dosyalarda kısaca kullanabilelim.
   ------------------------------------------------------------ */
firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();   // Veritabanı (kampanyalar, kullanıcılar burada)
var auth = firebase.auth();      // Giriş/çıkış işlemleri burada


/* ------------------------------------------------------------
   4) YARDIMCI: GİRİŞ YAPAN KİŞİ ADMIN Mİ?
   ------------------------------------------------------------
   Bir kullanıcı nesnesi alır, e-postası admin e-postasıyla
   aynıysa true (evet) döner. Birçok yerde kullanacağız.
   ------------------------------------------------------------ */
function adminMi(kullanici) {
    // Kullanıcı yoksa veya e-postası admin değilse: admin değil
    if (!kullanici) return false;
    return kullanici.email === ADMIN_EPOSTA;
}
