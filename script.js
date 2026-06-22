/* ============================================================
   ELVER - ORTAK JAVASCRIPT DOSYASI (script.js)
   ------------------------------------------------------------
   Sitenin çalışan kısmı burada: kampanyaları gösterme,
   imza atma, yeni kampanya oluşturma ve üst menüdeki
   giriş/çıkış durumunu yönetme.

   ÖNEMLİ DEĞİŞİKLİK:
   Artık veriler tarayıcı hafızasında DEĞİL, gerçek bir
   veritabanında (Google Firebase - Firestore) tutuluyor.
   Yani kampanyalar herkeste aynı görünür ve kalıcıdır.

   Bu dosya çalışmadan ÖNCE sayfada "firebase-ayarlar.js"
   yüklenmiş olmalıdır (orada "db" ve "auth" tanımlanıyor).
   ============================================================ */


/* ------------------------------------------------------------
   1) KAMPANYA KARTI OLUŞTURMA
   ------------------------------------------------------------
   Bir kampanya nesnesini alıp HTML kart koduna çevirir.
   Hem ana sayfada hem kampanyalar sayfasında kullanılır.

   Dikkat: Firestore her kampanyaya metin (string) bir kimlik
   verir. Bu kimliği k.id içinde tutuyoruz ve detay sayfasına
   bu kimlikle gidiyoruz.
   ------------------------------------------------------------ */
function kartHtmlOlustur(k) {
    return (
        '<div class="kart">' +
            '<div class="kart-resim">' + k.ikon + '</div>' +
            '<div class="kart-icerik">' +
                '<span class="etiket">' + k.kategori + '</span>' +
                '<h3>' + k.baslik + '</h3>' +
                '<p>' + k.ozet + '</p>' +
                '<div class="imza-sayisi">' + k.imza + ' imza toplandı</div>' +
                // Detay sayfasına kampanyanın kimliği (id) ile gidiyoruz
                '<a class="btn" href="kampanya-detay.html?id=' + k.id + '">İncele ve İmzala</a>' +
            '</div>' +
        '</div>'
    );
}


/* ------------------------------------------------------------
   2) TÜM KAMPANYALARI VERİTABANINDAN OKUMA
   ------------------------------------------------------------
   Firestore'daki "kampanyalar" koleksiyonundaki tüm kayıtları
   getirir. İşlem internet üzerinden olduğu için "Promise"
   (sonradan gelen veri) döndürür; bu yüzden çağıran yerlerde
   .then(...) kullanıyoruz.

   Her kaydın kimliğini (doc.id) nesnenin içine "id" olarak
   ekliyoruz ki kartlarda ve detayda kullanabilelim.
   ------------------------------------------------------------ */
function kampanyalariGetir() {
    return db.collection("kampanyalar").get().then(function (sonuc) {
        var liste = [];
        sonuc.forEach(function (doc) {
            var k = doc.data();   // kampanyanın bilgileri
            k.id = doc.id;        // kampanyanın kimliği (metin)
            liste.push(k);
        });
        // En çok imza alanlar en üstte olsun diye büyükten küçüğe sırala
        liste.sort(function (a, b) {
            return b.imza - a.imza;
        });
        return liste;
    });
}


/* ------------------------------------------------------------
   3) ANA SAYFA: ÖNE ÇIKAN KAMPANYALAR
   ------------------------------------------------------------
   Ana sayfada sadece ilk 3 kampanyayı gösterir.
   index.html içinde id="one-cikan" olan kutuyu doldurur.
   ------------------------------------------------------------ */
function oneCikanlariGoster() {
    var kutu = document.getElementById("one-cikan");
    if (!kutu) return; // bu öğe sayfada yoksa hiçbir şey yapma

    // "Yükleniyor" yazısını göster (veri internetten gelene kadar)
    kutu.innerHTML = "<p style='text-align:center;color:#6b6b6b;'>Yükleniyor...</p>";

    kampanyalariGetir().then(function (liste) {
        var html = "";
        // Sadece ilk 3 kampanyayı al (slice ile)
        liste.slice(0, 3).forEach(function (k) {
            html += kartHtmlOlustur(k);
        });
        kutu.innerHTML = html;
    });
}


/* ------------------------------------------------------------
   4) KAMPANYALAR SAYFASI: TÜM LİSTE + KATEGORİ FİLTRESİ
   ------------------------------------------------------------
   kampanyalar.html içinde id="tum-kampanyalar" kutusunu doldurur.
   ------------------------------------------------------------ */
function tumKampanyalariGoster(kategori) {
    var kutu = document.getElementById("tum-kampanyalar");
    if (!kutu) return;

    kutu.innerHTML = "<p style='text-align:center;color:#6b6b6b;'>Yükleniyor...</p>";

    kampanyalariGetir().then(function (liste) {
        // Eğer bir kategori seçildiyse sadece o kategoriyi göster
        if (kategori && kategori !== "Hepsi") {
            liste = liste.filter(function (k) {
                return k.kategori === kategori;
            });
        }

        // Hiç kampanya yoksa bilgi mesajı göster
        if (liste.length === 0) {
            kutu.innerHTML = "<p style='text-align:center;color:#6b6b6b;'>Bu kategoride henüz kampanya yok.</p>";
            return;
        }

        var html = "";
        liste.forEach(function (k) {
            html += kartHtmlOlustur(k);
        });
        kutu.innerHTML = html;
    });
}

// Kategori filtre butonlarına tıklanınca çalışır
function kategoriSec(kategori, buton) {
    // Tüm filtre butonlarından "aktif" görünümünü kaldır
    var butonlar = document.querySelectorAll(".filtre-buton");
    butonlar.forEach(function (b) {
        b.classList.remove("btn");
        b.classList.add("btn-cizgili");
    });
    // Tıklanan butonu dolu (aktif) yap
    buton.classList.remove("btn-cizgili");
    buton.classList.add("btn");

    // Listeyi seçilen kategoriye göre yeniden çiz
    tumKampanyalariGoster(kategori);
}


/* ------------------------------------------------------------
   5) KAMPANYA DETAY SAYFASI
   ------------------------------------------------------------
   Adres çubuğundaki ?id=KIMLIK değerine göre ilgili kampanyayı
   veritabanından çekip detay sayfasına yazar.
   Örnek: kampanya-detay.html?id=abc123
   ------------------------------------------------------------ */
function detayGoster() {
    var kutu = document.getElementById("kampanya-detay");
    if (!kutu) return;

    // Adres çubuğundaki id parametresini oku
    var parametreler = new URLSearchParams(window.location.search);
    var id = parametreler.get("id");

    // id yoksa uyarı göster
    if (!id) {
        kutu.innerHTML = "<p style='text-align:center;'>Kampanya bulunamadı. <a href='kampanyalar.html'>Tüm kampanyalara dön</a></p>";
        return;
    }

    // O kimliğe sahip kampanyayı veritabanından tek tek çek
    db.collection("kampanyalar").doc(id).get().then(function (doc) {

        // Kampanya bulunamazsa uyarı göster
        if (!doc.exists) {
            kutu.innerHTML = "<p style='text-align:center;'>Kampanya bulunamadı. <a href='kampanyalar.html'>Tüm kampanyalara dön</a></p>";
            return;
        }

        var k = doc.data();
        k.id = doc.id;

        // Hedefe ne kadar ulaşıldığını yüzde olarak hesapla
        var yuzde = Math.min(100, Math.round((k.imza / k.hedef) * 100));

        // Detay içeriğini sayfaya yaz
        kutu.innerHTML =
            '<span class="etiket">' + k.kategori + '</span>' +
            '<h1>' + k.baslik + '</h1>' +
            '<div class="kart-resim" style="height:200px;font-size:80px;border-radius:10px;margin:20px 0;">' + k.ikon + '</div>' +
            '<p style="font-size:17px;color:#555;">' + k.detay + '</p>' +

            // İlerleme çubuğu (imza / hedef)
            '<div style="margin:26px 0;">' +
                '<div style="background:#eee;border-radius:20px;height:18px;overflow:hidden;">' +
                    '<div style="background:var(--ana-renk);height:100%;width:' + yuzde + '%;"></div>' +
                '</div>' +
                '<p style="margin-top:8px;font-weight:bold;color:var(--ana-renk);">' +
                    k.imza + ' / ' + k.hedef + ' imza (%' + yuzde + ')' +
                '</p>' +
            '</div>';

        // İmza formundaki gizli id alanını bu kampanyaya ayarla
        var gizliId = document.getElementById("imza-kampanya-id");
        if (gizliId) gizliId.value = k.id;
    });
}


/* ------------------------------------------------------------
   6) İMZA ATMA
   ------------------------------------------------------------
   Detay sayfasındaki imza formu gönderilince çalışır.
   - Önce giriş yapılmış mı kontrol eder (giriş şart).
   - Sonra ilgili kampanyanın imza sayısını veritabanında
     1 artırır.
   ------------------------------------------------------------ */
function imzaAt(olay) {
    olay.preventDefault(); // sayfanın yenilenmesini engelle

    // Giriş yapılmamışsa imza atılamaz
    if (!auth.currentUser) {
        alert("İmza atmak için önce giriş yapmalısın.");
        window.location.href = "giris.html";
        return;
    }

    var id = document.getElementById("imza-kampanya-id").value;

    // Firestore'da güvenli sayaç artırma: increment(1)
    // Aynı anda birden çok kişi imza atsa bile sayı doğru artar.
    db.collection("kampanyalar").doc(id).update({
        imza: firebase.firestore.FieldValue.increment(1)
    }).then(function () {
        // Başarı mesajını göster ve formu temizle
        var mesaj = document.getElementById("imza-basari");
        if (mesaj) mesaj.style.display = "block";
        olay.target.reset();

        // Detayı yeniden çizerek güncel imza sayısını göster
        detayGoster();
    });
}


/* ------------------------------------------------------------
   7) YENİ KAMPANYA OLUŞTURMA
   ------------------------------------------------------------
   kampanya-olustur.html formundan gelen bilgilerle yeni bir
   kampanya kaydı oluşturup veritabanına ekler.
   Giriş yapılmış olması şarttır.
   ------------------------------------------------------------ */
function kampanyaOlustur(olay) {
    olay.preventDefault();

    // Giriş yapılmamışsa kampanya oluşturulamaz
    if (!auth.currentUser) {
        alert("Kampanya oluşturmak için önce giriş yapmalısın.");
        window.location.href = "giris.html";
        return;
    }

    // Formdaki kategoriye göre uygun bir emoji seç
    var kategori = document.getElementById("yeni-kategori").value;
    var ikon = "📢"; // varsayılan ikon
    if (kategori === "Sağlık") ikon = "🎗️";
    if (kategori === "Hayvanlar") ikon = "🐾";
    if (kategori === "Çevre") ikon = "🌱";
    if (kategori === "Eğitim") ikon = "📚";

    // Yeni kampanya nesnesini oluştur
    var yeni = {
        baslik: document.getElementById("yeni-baslik").value,
        kategori: kategori,
        ikon: ikon,
        ozet: document.getElementById("yeni-ozet").value,
        detay: document.getElementById("yeni-detay").value,
        imza: 0, // yeni kampanya 0 imzayla başlar
        hedef: parseInt(document.getElementById("yeni-hedef").value),
        olusturanEmail: auth.currentUser.email,            // kim oluşturdu
        olusturmaTarihi: firebase.firestore.FieldValue.serverTimestamp() // ne zaman
    };

    // Veritabanına yeni kayıt ekle (kimliği Firestore otomatik verir)
    db.collection("kampanyalar").add(yeni).then(function () {
        // Başarı mesajını göster ve formu temizle
        var mesaj = document.getElementById("olustur-basari");
        if (mesaj) mesaj.style.display = "block";
        olay.target.reset();

        // 1.5 saniye sonra kampanyalar sayfasına yönlendir
        setTimeout(function () {
            window.location.href = "kampanyalar.html";
        }, 1500);
    });
}


/* ------------------------------------------------------------
   8) İLETİŞİM FORMU
   ------------------------------------------------------------
   Mesaj gönderilince sadece bir teşekkür mesajı gösterir.
   (İletişim mesajları için ayrı bir veritabanı tutmuyoruz.)
   ------------------------------------------------------------ */
function iletisimGonder(olay) {
    olay.preventDefault();
    var mesaj = document.getElementById("iletisim-basari");
    if (mesaj) mesaj.style.display = "block";
    olay.target.reset();
}


/* ------------------------------------------------------------
   9) ÜST MENÜ: GİRİŞ / ÇIKIŞ DURUMU
   ------------------------------------------------------------
   Her sayfanın menüsünde id="oturum-link" adında boş bir alan
   var. Burayı kullanıcının giriş durumuna göre dolduruyoruz:
     - Giriş yapılmamışsa: "Giriş Yap" linki
     - Giriş yapılmışsa  : e-posta + "Çıkış" (admin ise "Admin" linki)
   ------------------------------------------------------------ */
function menuyuGuncelle(kullanici) {
    var yer = document.getElementById("oturum-link");
    if (!yer) return;

    if (kullanici) {
        // Admin ise menüye "Admin" linki de ekle
        var adminLinki = "";
        if (adminMi(kullanici)) {
            adminLinki = '<a href="admin.html" style="color:var(--ana-renk);font-weight:bold;">Admin</a> ';
        }
        // Çıkış linki (tıklanınca cikisYap çalışır)
        yer.innerHTML =
            adminLinki +
            '<a href="#" onclick="cikisYap(); return false;" style="margin-left:14px;">Çıkış</a>';
    } else {
        // Giriş yapılmamış: sadece "Giriş Yap"
        yer.innerHTML = '<a href="giris.html">Giriş Yap</a>';
    }
}

// "Çıkış" linkine tıklanınca oturumu kapatır ve ana sayfaya döner
function cikisYap() {
    auth.signOut().then(function () {
        window.location.href = "index.html";
    });
}


/* ------------------------------------------------------------
   10) KAMPANYA OLUŞTURMA SAYFASINI GİRİŞE KİLİTLE
   ------------------------------------------------------------
   Kullanıcı giriş yapmadan kampanya oluşturma formunu görmesin.
   Giriş yoksa formu gizleyip uyarı gösteriyoruz.
   ------------------------------------------------------------ */
function olusturSayfasiniKontrolEt(kullanici) {
    var form = document.getElementById("olustur-form");
    var uyari = document.getElementById("giris-uyari");
    if (!form || !uyari) return; // bu sayfada değiliz

    if (kullanici) {
        form.style.display = "block";
        uyari.style.display = "none";
    } else {
        form.style.display = "none";
        uyari.style.display = "block";
    }
}


/* ------------------------------------------------------------
   11) SAYFA YÜKLENİNCE ÇALIŞACAKLAR
   ------------------------------------------------------------
   - Kampanya listeleri (herkese açık) hemen yüklenir.
   - Menü ve giriş kontrolleri, Firebase oturum durumunu
     öğrenince (onAuthStateChanged) güncellenir.
   ------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", function () {

    oneCikanlariGoster();           // ana sayfa öne çıkanlar
    tumKampanyalariGoster("Hepsi"); // kampanyalar sayfası tüm liste
    detayGoster();                  // detay sayfası

    // İmza formu varsa, gönderilince imzaAt çalışsın
    var imzaForm = document.getElementById("imza-form");
    if (imzaForm) imzaForm.addEventListener("submit", imzaAt);

    // Kampanya oluşturma formu
    var olusturForm = document.getElementById("olustur-form");
    if (olusturForm) olusturForm.addEventListener("submit", kampanyaOlustur);

    // İletişim formu
    var iletisimForm = document.getElementById("iletisim-form");
    if (iletisimForm) iletisimForm.addEventListener("submit", iletisimGonder);

    // Oturum (giriş) durumu değişince menüyü ve kilitli sayfaları güncelle.
    // Sayfa ilk açıldığında da bir kez otomatik çalışır.
    auth.onAuthStateChanged(function (kullanici) {
        menuyuGuncelle(kullanici);
        olusturSayfasiniKontrolEt(kullanici);
    });
});
