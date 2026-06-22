/* ============================================================
   ELVER - GİRİŞ / KAYIT KODU (giris.js)
   ------------------------------------------------------------
   Bu dosya iki sayfada kullanılır:
     - giris.html  : Kullanıcı girişi + Admin girişi (iki sekme)
     - kayit.html  : Yeni kullanıcı (üye) kaydı

   Giriş ve kayıt işlemleri Firebase Authentication ile yapılır.
   Bu dosya çalışmadan önce "firebase-ayarlar.js" yüklenmiş
   olmalıdır (db, auth ve adminMi orada tanımlı).
   ============================================================ */


/* ------------------------------------------------------------
   1) SEKME DEĞİŞTİRME (giris.html'deki Kullanıcı / Admin)
   ------------------------------------------------------------
   Üstteki iki butona tıklanınca ilgili formu gösterir,
   diğerini gizler. "hangi" değeri "kullanici" veya "admin".
   ------------------------------------------------------------ */
function sekmeSec(hangi) {
    // Form kutuları
    var kullaniciForm = document.getElementById("kullanici-form-kutu");
    var adminForm = document.getElementById("admin-form-kutu");
    // Sekme butonları
    var kullaniciSekme = document.getElementById("sekme-kullanici");
    var adminSekme = document.getElementById("sekme-admin");

    if (hangi === "admin") {
        adminForm.style.display = "block";
        kullaniciForm.style.display = "none";
        adminSekme.classList.add("aktif");
        kullaniciSekme.classList.remove("aktif");
    } else {
        kullaniciForm.style.display = "block";
        adminForm.style.display = "none";
        kullaniciSekme.classList.add("aktif");
        adminSekme.classList.remove("aktif");
    }
}


/* ------------------------------------------------------------
   2) KULLANICI (NORMAL) GİRİŞİ
   ------------------------------------------------------------
   E-posta ve şifre ile giriş yapar. Başarılı olursa ana
   sayfaya yönlendirir. Hata olursa kırmızı mesaj gösterir.
   ------------------------------------------------------------ */
function kullaniciGiris(olay) {
    olay.preventDefault();

    var eposta = document.getElementById("k-eposta").value;
    var sifre = document.getElementById("k-sifre").value;
    var hataKutu = document.getElementById("kullanici-hata");

    auth.signInWithEmailAndPassword(eposta, sifre)
        .then(function () {
            // Giriş başarılı: ana sayfaya git
            window.location.href = "index.html";
        })
        .catch(function (hata) {
            // Giriş başarısız: hatayı göster
            hataKutu.style.display = "block";
            hataKutu.textContent = "Giriş yapılamadı: e-posta veya şifre hatalı.";
        });
}


/* ------------------------------------------------------------
   3) ADMIN (YÖNETİCİ) GİRİŞİ
   ------------------------------------------------------------
   Önce normal giriş yapar, sonra bu hesabın admin olup
   olmadığını kontrol eder. Admin değilse oturumu kapatır ve
   uyarı verir. Admin ise admin paneline yönlendirir.
   ------------------------------------------------------------ */
function adminGiris(olay) {
    olay.preventDefault();

    var eposta = document.getElementById("a-eposta").value;
    var sifre = document.getElementById("a-sifre").value;
    var hataKutu = document.getElementById("admin-hata");

    auth.signInWithEmailAndPassword(eposta, sifre)
        .then(function (sonuc) {
            // Giriş yaptı ama admin mi? (firebase-ayarlar.js'deki adminMi ile)
            if (adminMi(sonuc.user)) {
                window.location.href = "admin.html"; // admin paneline git
            } else {
                // Admin değil: güvenlik için oturumu kapat ve uyar
                auth.signOut();
                hataKutu.style.display = "block";
                hataKutu.textContent = "Bu hesap yönetici (admin) değil.";
            }
        })
        .catch(function (hata) {
            hataKutu.style.display = "block";
            hataKutu.textContent = "Giriş yapılamadı: e-posta veya şifre hatalı.";
        });
}


/* ------------------------------------------------------------
   4) YENİ KULLANICI KAYDI (kayit.html)
   ------------------------------------------------------------
   E-posta ve şifre ile yeni bir hesap oluşturur. Ayrıca
   kullanıcının adını ve rolünü ("uye") veritabanındaki
   "kullanicilar" koleksiyonuna kaydeder (admin panelinde
   listelenebilsin diye).
   ------------------------------------------------------------ */
function kayitOl(olay) {
    olay.preventDefault();

    var ad = document.getElementById("kayit-ad").value;
    var eposta = document.getElementById("kayit-eposta").value;
    var sifre = document.getElementById("kayit-sifre").value;
    var hataKutu = document.getElementById("kayit-hata");

    auth.createUserWithEmailAndPassword(eposta, sifre)
        .then(function (sonuc) {
            // Hesap oluştu. Şimdi bilgilerini veritabanına yaz.
            // Belge kimliği olarak kullanıcının uid'sini kullanıyoruz.
            return db.collection("kullanicilar").doc(sonuc.user.uid).set({
                ad: ad,
                email: eposta,
                rol: "uye", // normal üye (admin değil)
                kayitTarihi: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(function () {
            // Kayıt tamam: ana sayfaya yönlendir (otomatik giriş yapılmış olur)
            window.location.href = "index.html";
        })
        .catch(function (hata) {
            // Sık karşılaşılan hatalar için anlaşılır mesajlar
            hataKutu.style.display = "block";
            if (hata.code === "auth/email-already-in-use") {
                hataKutu.textContent = "Bu e-posta zaten kayıtlı. Giriş yapmayı dene.";
            } else if (hata.code === "auth/weak-password") {
                hataKutu.textContent = "Şifre en az 6 karakter olmalı.";
            } else {
                hataKutu.textContent = "Kayıt yapılamadı. Bilgileri kontrol et.";
            }
        });
}


/* ------------------------------------------------------------
   5) SAYFA YÜKLENİNCE: FORMLARI BAĞLA
   ------------------------------------------------------------
   Hangi form sayfada varsa ona göre dinleyici (listener) ekler.
   ------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", function () {

    var kForm = document.getElementById("kullanici-giris-form");
    if (kForm) kForm.addEventListener("submit", kullaniciGiris);

    var aForm = document.getElementById("admin-giris-form");
    if (aForm) aForm.addEventListener("submit", adminGiris);

    var kayitForm = document.getElementById("kayit-form");
    if (kayitForm) kayitForm.addEventListener("submit", kayitOl);
});
