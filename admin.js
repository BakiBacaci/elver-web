/* ============================================================
   ELVER - ADMIN PANELİ KODU (admin.js)
   ------------------------------------------------------------
   Sadece admin.html sayfasında kullanılır. Burada yönetici:
     - Tüm kampanyaları görür ve silebilir
     - Kayıtlı kullanıcıları (üyeleri) görür
     - İstatistikleri (toplam kampanya/imza/üye) görür
     - Bir tıkla örnek kampanyaları veritabanına yükleyebilir

   GÜVENLİK: Sayfa açılınca giriş yapan kişi admin değilse
   otomatik olarak giriş sayfasına gönderilir.

   Bu dosyadan önce "firebase-ayarlar.js" yüklenmiş olmalıdır.
   ============================================================ */


/* ------------------------------------------------------------
   1) ÖRNEK KAMPANYALAR (İLK VERİ)
   ------------------------------------------------------------
   "Örnek Kampanyaları Yükle" butonuna basınca veritabanına
   eklenecek hazır kampanyalar. Veritabanın boş görünmesin
   diye başlangıç verisi olarak kullanılır.
   Buraya istediğin kadar yeni örnek ekleyebilirsin.
   ------------------------------------------------------------ */
var ORNEK_KAMPANYALAR = [
    {
        baslik: "Lösemili Çocuklar İçin İlik Bağışı Farkındalığı",
        kategori: "Sağlık", ikon: "🎗️",
        ozet: "Lösemiyle mücadele eden çocuklara umut olmak için ilik bağışına dikkat çekelim.",
        detay: "Lösemi tedavisinde ilik nakli birçok çocuk için hayati önem taşıyor. Bu kampanyayla daha fazla insanın ilik bağışçısı olmasını ve uygun donör havuzunun büyümesini hedefliyoruz. İmzanız, yetkililere bu konuda farkındalık çalışmalarının artırılması çağrısıdır.",
        imza: 1240, hedef: 5000
    },
    {
        baslik: "Sokak Hayvanları İçin Mama ve Barınak",
        kategori: "Hayvanlar", ikon: "🐾",
        ozet: "Soğuk kış günlerinde sokak hayvanları için belediyelerden mama ve barınak istiyoruz.",
        detay: "Sokakta yaşayan binlerce can dostumuz kış aylarında açlık ve soğukla mücadele ediyor. Bu kampanya, yerel yönetimlerden düzenli mama desteği ve kapalı barınak alanları talep ediyor. Sesini duyur, imzanı ekle.",
        imza: 860, hedef: 3000
    },
    {
        baslik: "Okullara Ücretsiz Kütüphane Desteği",
        kategori: "Eğitim", ikon: "📚",
        ozet: "Kırsaldaki okullara kitap ve kütüphane kurulması için destek olalım.",
        detay: "Her çocuğun kitaba erişme hakkı vardır. Bu kampanya, imkânı kısıtlı bölgelerdeki okullara kütüphane kurulması ve kitap bağışı yapılması için bir çağrıdır. Hedefimize ulaşırsak talebimizi yetkili kurumlara ileteceğiz.",
        imza: 430, hedef: 2000
    },
    {
        baslik: "Şehir Merkezine Daha Fazla Yeşil Alan",
        kategori: "Çevre", ikon: "🌱",
        ozet: "Betonlaşan şehrimizde yeni parklar ve yeşil alanlar talep ediyoruz.",
        detay: "Şehirde yaşam kalitesini artırmak ve havayı temizlemek için daha fazla yeşil alana ihtiyacımız var. Bu kampanya, belediyeden boş arazilerin park ve bahçeye dönüştürülmesini talep ediyor.",
        imza: 612, hedef: 2500
    },
    {
        baslik: "Köy Okullarına İnternet ve Bilgisayar",
        kategori: "Eğitim", ikon: "📚",
        ozet: "Uzaktaki köy okullarına internet ve bilgisayar desteği sağlanmasını istiyoruz.",
        detay: "Dijital çağda her öğrencinin teknolojiye erişim hakkı olmalı. Bu kampanya, internet altyapısı olmayan köy okullarına bağlantı ve bilgisayar sağlanması için bir çağrıdır.",
        imza: 745, hedef: 3000
    },
    {
        baslik: "Plastik Poşet Kullanımına Son",
        kategori: "Çevre", ikon: "🌱",
        ozet: "Marketlerde tek kullanımlık plastik poşetlerin azaltılmasını istiyoruz.",
        detay: "Plastik poşetler doğada yüzlerce yıl yok olmuyor ve denizleri kirletiyor. Bu kampanya, marketleri kâğıt ve bez torba kullanımına teşvik etmeyi ve plastik atığı azaltmayı amaçlıyor.",
        imza: 1530, hedef: 6000
    }
];


/* ------------------------------------------------------------
   2) İSTATİSTİKLERİ HESAPLA VE YAZ
   ------------------------------------------------------------
   Toplam kampanya sayısı, toplam imza ve toplam üye sayısını
   sayfanın üstündeki kutulara yazar.
   ------------------------------------------------------------ */
function istatistikleriGoster(kampanyalar, uyeSayisi) {
    var toplamImza = 0;
    kampanyalar.forEach(function (k) {
        toplamImza += k.imza;
    });

    document.getElementById("ist-kampanya").textContent = kampanyalar.length;
    document.getElementById("ist-imza").textContent = toplamImza;
    document.getElementById("ist-uye").textContent = uyeSayisi;
}


/* ------------------------------------------------------------
   3) KAMPANYALARI TABLO OLARAK GÖSTER
   ------------------------------------------------------------
   Tüm kampanyaları admin tablosuna satır satır yazar. Her
   satırda bir "Sil" butonu olur.
   ------------------------------------------------------------ */
function adminKampanyalariGoster() {
    var govde = document.getElementById("kampanya-tablo-govde");
    if (!govde) return;

    db.collection("kampanyalar").get().then(function (sonuc) {
        var kampanyalar = [];
        var html = "";

        sonuc.forEach(function (doc) {
            var k = doc.data();
            k.id = doc.id;
            kampanyalar.push(k);

            // Tablo satırı: başlık, kategori, imza, sil butonu
            html +=
                '<tr>' +
                    '<td>' + k.baslik + '</td>' +
                    '<td>' + k.kategori + '</td>' +
                    '<td>' + k.imza + ' / ' + k.hedef + '</td>' +
                    '<td>' +
                        '<button class="btn-sil" onclick="kampanyaSil(\'' + k.id + '\')">Sil</button>' +
                    '</td>' +
                '</tr>';
        });

        if (kampanyalar.length === 0) {
            html = '<tr><td colspan="4" style="text-align:center;color:#6b6b6b;">Henüz kampanya yok. Aşağıdaki butonla örnek verileri yükleyebilirsin.</td></tr>';
        }

        govde.innerHTML = html;

        // İmza toplamı için kampanya listesini istatistiklere de gönderelim.
        // Üye sayısını ayrıca çekiyoruz (aşağıdaki fonksiyon).
        uyeleriGetirVeGoster(kampanyalar);
    });
}


/* ------------------------------------------------------------
   4) BİR KAMPANYAYI SİL
   ------------------------------------------------------------
   Sil butonuna basınca onay sorar, onaylanırsa kampanyayı
   veritabanından siler ve tabloyu yeniler.
   ------------------------------------------------------------ */
function kampanyaSil(id) {
    // Yanlışlıkla silmeyi önlemek için onay sor
    var eminMi = confirm("Bu kampanyayı silmek istediğine emin misin?");
    if (!eminMi) return;

    db.collection("kampanyalar").doc(id).delete().then(function () {
        // Silindi: tabloyu baştan yükle
        adminKampanyalariGoster();
    });
}


/* ------------------------------------------------------------
   5) KAYITLI KULLANICILARI (ÜYELERİ) GÖSTER
   ------------------------------------------------------------
   "kullanicilar" koleksiyonundaki üyeleri listeler ve aynı
   zamanda istatistik kutularını günceller.
   ------------------------------------------------------------ */
function uyeleriGetirVeGoster(kampanyalar) {
    var govde = document.getElementById("uye-tablo-govde");

    db.collection("kullanicilar").get().then(function (sonuc) {
        var html = "";
        var uyeSayisi = 0;

        sonuc.forEach(function (doc) {
            var u = doc.data();
            uyeSayisi++;
            html +=
                '<tr>' +
                    '<td>' + (u.ad || "-") + '</td>' +
                    '<td>' + (u.email || "-") + '</td>' +
                    '<td>' + (u.rol || "uye") + '</td>' +
                '</tr>';
        });

        if (uyeSayisi === 0) {
            html = '<tr><td colspan="3" style="text-align:center;color:#6b6b6b;">Henüz kayıtlı üye yok.</td></tr>';
        }

        if (govde) govde.innerHTML = html;

        // İstatistikleri kampanya + üye bilgisiyle güncelle
        istatistikleriGoster(kampanyalar, uyeSayisi);
    });
}


/* ------------------------------------------------------------
   6) ÖRNEK KAMPANYALARI VERİTABANINA YÜKLE
   ------------------------------------------------------------
   Yukarıdaki ORNEK_KAMPANYALAR listesini tek tek veritabanına
   ekler. Veritabanın boşsa "biraz veri" oluşturmak için pratiktir.
   ------------------------------------------------------------ */
function ornekVeriYukle() {
    var eminMi = confirm("Örnek kampanyalar veritabanına eklenecek. Devam edilsin mi?");
    if (!eminMi) return;

    // Her örnek kampanyayı ekle. Hepsi bitince tabloyu yenile.
    var islemler = ORNEK_KAMPANYALAR.map(function (k) {
        // Orijinal listeyi bozmamak için kopya alıp ek alanları ekliyoruz
        var kayit = {
            baslik: k.baslik,
            kategori: k.kategori,
            ikon: k.ikon,
            ozet: k.ozet,
            detay: k.detay,
            imza: k.imza,
            hedef: k.hedef,
            olusturanEmail: ADMIN_EPOSTA,
            olusturmaTarihi: firebase.firestore.FieldValue.serverTimestamp()
        };
        return db.collection("kampanyalar").add(kayit);
    });

    Promise.all(islemler).then(function () {
        alert("Örnek kampanyalar başarıyla yüklendi.");
        adminKampanyalariGoster();
    });
}


/* ------------------------------------------------------------
   7) SAYFA YÜKLENİNCE: ADMIN KONTROLÜ + VERİLERİ GETİR
   ------------------------------------------------------------
   Giriş yapan kişi admin değilse sayfayı göstermeyip giriş
   sayfasına yönlendiriyoruz.
   ------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", function () {

    // "Örnek veri yükle" butonuna tıklamayı bağla
    var yukleButon = document.getElementById("ornek-veri-buton");
    if (yukleButon) yukleButon.addEventListener("click", ornekVeriYukle);

    // Oturum durumunu öğren
    auth.onAuthStateChanged(function (kullanici) {
        if (!adminMi(kullanici)) {
            // Admin değil veya giriş yok: giriş sayfasına gönder
            alert("Bu sayfaya sadece yönetici girebilir.");
            window.location.href = "giris.html";
            return;
        }
        // Admin doğrulandı: verileri yükle
        adminKampanyalariGoster();
    });
});
