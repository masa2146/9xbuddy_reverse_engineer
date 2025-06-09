/**
 * 9xBuddy URL Şifre Çözücü
 * Bu script, 9xbuddy.site'dan alınan şifrelenmiş URL'leri çözmek için kullanılır
 */

class BuddyDecryptor {
    constructor() {
        // Static string: [69,84,65,77,95,89,82,82,79,83] -> "SORRY_MATE" (reversed)
        this.staticString = "SORRY_MATE";
        this.hostname = "9xbuddy.site";
    }

    /**
     * Base64 decode fonksiyonu
     */
    decode64(e) {
        if (e = e.replace(/\s/g, ""), /^[a-z0-9\+\/\s]+\={0,2}$/i.test(e) && !(e.length % 4 > 0)) {
            var t, r, n = 0, s = [];
            for (e = e.replace(/=/g, ""); n < e.length;) {
                switch (t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(e.charAt(n)), n % 4) {
                    case 1:
                        s.push(String.fromCharCode(r << 2 | t >> 4));
                        break;
                    case 2:
                        s.push(String.fromCharCode((15 & r) << 4 | t >> 2));
                        break;
                    case 3:
                        s.push(String.fromCharCode((3 & r) << 6 | t))
                }
                r = t, n++
            }
            return s.join("")
        }
        return "";
    }

    /**
     * Karakter kodu alma fonksiyonu
     */
    ord(e) {
        var t = "".concat(e), r = t.charCodeAt(0);
        if (r >= 55296 && r <= 56319) {
            var n = r;
            return 1 === t.length ? r : 1024 * (n - 55296) + (t.charCodeAt(1) - 56320) + 65536
        }
        return r
    }

    /**
     * Şifre çözme fonksiyonu
     */
    decrypt(e, t) {
        var r = "";
        e = this.decode64(e);
        for (var n = 0; n < e.length; n++) {
            var s = e.substr(n, 1), a = t.substr(n % t.length - 1, 1);
            s = Math.floor(this.ord(s) - this.ord(a)), r += s = String.fromCharCode(s)
        }
        return r
    }

    /**
     * Hex string'i binary'ye çevirme
     */
    hex2bin(e) {
        var t, r = [], n = 0;
        for (t = (e += "").length; n < t; n += 2) {
            var s = parseInt(e.substr(n, 1), 16), a = parseInt(e.substr(n + 1, 1), 16);
            if (isNaN(s) || isNaN(a)) return false;
            r.push(s << 4 | a)
        }
        return String.fromCharCode.apply(String, r)
    }

    /**
     * Ana URL şifre çözme fonksiyonu
     * @param {string} encryptedUrl - Şifrelenmiş hexadecimal URL
     * @param {string} token - Access token
     * @param {string} cssHash - CSS dosyasından alınan hash (opsiyonel)
     * @returns {string} Çözülmüş URL
     */
    decryptUrl(encryptedUrl, token, cssHash = "cb67d183996514034d45") {
        try {
            // Hex'i binary'ye çevir ve tersine çevir
            const hexDecoded = this.hex2bin(encryptedUrl);
            if (!hexDecoded) {
                throw new Error("Hex decode hatası");
            }
            
            const reversed = hexDecoded.split("").reverse().join("");
            
            // Decrypt key oluştur
            const hostnameLength = this.hostname.length;
            const decryptKey = this.staticString + hostnameLength + cssHash + token;
            
            // Şifreyi çöz
            const decryptedUrl = this.decrypt(reversed, decryptKey);
            
            return decryptedUrl;
        } catch (error) {
            console.error("URL decrypt hatası:", error);
            return null;
        }
    }

    /**
     * Tüm format URL'lerini çözme fonksiyonu
     * @param {Array} formats - Format array'i
     * @param {string} token - Access token
     * @param {string} cssHash - CSS hash (opsiyonel)
     * @returns {Array} Çözülmüş URL'ler ile format array'i
     */
    decryptAllUrls(formats, token, cssHash = "cb67d183996514034d45") {
        return formats.map(format => {
            const decryptedUrl = this.decryptUrl(format.url, token, cssHash);
            return {
                ...format,
                url: format.url, // Orijinal şifreli URL
                decryptedUrl: decryptedUrl, // Çözülmüş URL
                isDecrypted: !!decryptedUrl
            };
        });
    }
}

// Kullanım örneği
const decryptor = new BuddyDecryptor();

// Test verisi
const testData = {
    token: "aZiQbmWWY2xhcXCeqaWko21jk22tk6aSlade1suqnKeZqqKmnmVmZGpeY2KUYmVRhI+Xj6LMkWtqm19raWlqZ2U=",
    formats: [
        {
            quality: "Audio",
            type: "audio",
            ext: "mp3",
            url: "3d41713266583672576571733971617170657068696e4a6c624e39316d4f7034774f3256637274755061397834794d32584850595137737a7a53706476796f68326457696e4f4b706f6d70636975717279744b704a725a70555064596c7171777642347a476a4c752b4b4962"
        },
        {
            quality: "480p",
            type: "video",
            ext: "mp4",
            url: "3d3d516d43364c786444346f4558613267323773645036665a573579514c4c796f524d703452327a6748475a52584e6a3075737a5a4336785a4762692b79737567614d68694f647272464972584f6d67384a4a5a72786d6167316f6d534c4967747935633578487a774663302b694d772b614c62"
        }
    ]
};

// URL'leri çöz
console.log("=== 9xBuddy URL Decoder Test ===");
console.log("Token:", testData.token);
console.log();

testData.formats.forEach((format, index) => {
    console.log(`Format ${index + 1}: ${format.quality} (${format.ext})`);
    console.log("Şifreli URL:", format.url);
    
    const decryptedUrl = decryptor.decryptUrl(format.url, testData.token);
    console.log("Çözülmüş URL:", decryptedUrl);
    console.log("---");
});

// Tüm URL'leri bir seferde çöz
const decryptedFormats = decryptor.decryptAllUrls(testData.formats, testData.token);
console.log("\n=== Tüm Formatlar (Çözülmüş) ===");
console.log(JSON.stringify(decryptedFormats, null, 2));

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BuddyDecryptor;
} else if (typeof window !== 'undefined') {
    window.BuddyDecryptor = BuddyDecryptor;
}
