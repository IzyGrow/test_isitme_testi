import { Facebook, Instagram, MessageCircle, Mail, Phone } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="w-full bg-muted">
      <div className="w-full py-6 px-4 md:px-8 lg:px-40">
        {/* Sınır çizgisi grid ile hizalı */}
        <div className="border-t border-border w-full mb-6 md:mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 items-start w-full">
          {/* Diğer 3 kolon: iletişim, şubeler, hızlı erişim */}
          {/* İletişim Section */}
          <div className="space-y-8">
            <div className="flex items-center space-x-3">
              <img 
                src="/logonuz.png" 
                alt="İzmirses İşitme Cihazları" 
                className="h-20 object-contain"
              />
            </div>
            
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-foreground">İletişim</h3>
              
              <div className="space-y-4 text-base text-muted-foreground">
                <p className="text-lg leading-relaxed">
                  Örnekli Sesova Mahallesi, Örnek Yankı Sokak No:ÖR/01, 00000 Örnekşehir / Türkiye
                </p>
                
                <a 
                  href="mailto:"
                  className="text-primary hover:text-primary-dark transition-colors flex items-center gap-3 text-lg"
                >
                  <Mail className="w-5 h-5" />
                  info@isletmeadi.com
                </a>
                
                <a 
                  href="tel:05050359990"
                  className="text-foreground hover:text-primary transition-colors flex items-center gap-3 text-lg"
                >
                  <Phone className="w-5 h-5" />
                  0 (532) 237 38 79
                </a>
              </div>

              {/* Social Media Icons */}
              <div className="flex space-x-6 pt-4">
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:bg-primary-dark transition-colors"
                >
                  <Instagram className="w-6 h-6" />
                </a>
                <a
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:bg-primary-dark transition-colors"
                >
                  <Facebook className="w-6 h-6" />
                </a>
                <a
                  href="https://api.whatsapp.com/send/?phone=905322373879&text=%C3%9Cr%C3%BCnleriniz+hakk%C4%B1nda+daha+fazla+bilgi+almak+istiyorum.&type=phone_number&app_absent=0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:bg-primary-dark transition-colors"
                >
                  <MessageCircle className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>

          {/* Şubelerimiz Section */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground">Şubelerimiz</h3>
            <div className="space-y-4">
              {[
                "Alsancak Şubesi",
                "Gaziemir Şubesi"
              ].map((branch) => (
                <a
                  key={branch}
                  href=""
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-lg text-muted-foreground hover:text-primary transition-colors"
                >
                  {branch}
                </a>
              ))}
            </div>
          </div>

          {/* Hızlı Erişim Section */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground">Hızlı Erişim</h3>
            <div className="space-y-4">
              <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="block text-lg text-muted-foreground hover:text-primary transition-colors"
              >
                Anasayfa
              </a>
              <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="block text-lg text-muted-foreground hover:text-primary transition-colors"
              >
                Faydalı Bilgiler
              </a>
              <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="block text-lg text-muted-foreground hover:text-primary transition-colors"
              >
                Hakkımızda
              </a>
              <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="block text-lg text-muted-foreground hover:text-primary transition-colors"
              >
                Hizmetlerimiz
              </a>
              <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="block text-lg text-muted-foreground hover:text-primary transition-colors"
              >
                Kulak Arkası İşitme Cihazları
              </a>
              <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="block text-lg text-muted-foreground hover:text-primary transition-colors"
              >
                Kulak İçi İşitme Cihazları
              </a>
              <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="block text-lg text-muted-foreground hover:text-primary transition-colors"
              >
                Randevu Alın
              </a>
              <a
                href="https://api.whatsapp.com/send/?phone=905322373879&text=%C3%9Cr%C3%BCnleriniz+hakk%C4%B1nda+daha+fazla+bilgi+almak+istiyorum.&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-lg text-muted-foreground hover:text-primary transition-colors"
              >
                İletişim
              </a>
            </div>
          </div>
          {/* Açıklama yazısı en sağa alınıyor */}
          <div className="md:col-span-1 col-span-full flex items-center justify-center mb-8 md:mb-0">
            <p className="text-base md:text-lg font-bold text-foreground leading-relaxed drop-shadow-sm max-w-xs text-center">
            "İşletme Adı" olarak, işitme sağlığınızı önemsiyor, hayat kalitenizi artırmak için en yeni teknolojilere sahip işitme cihazlarını sizlerle buluşturuyoruz. Uzman ekibimizle ücretsiz işitme testi, kişiye özel çözümler ve satış sonrası destekle daima yanınızdayız. Duyduğunuz her an daha anlamlı, her ses daha net olsun diye buradayız!
            </p>
          </div>
        </div>
        {/* Copyright */}
        <div className="border-t border-border w-full mt-8"></div>
        <div className="pt-6 text-center">
          <p className="text-base text-muted-foreground">
            © 2025. *İşletme adı* İşitme Cihazları. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
};