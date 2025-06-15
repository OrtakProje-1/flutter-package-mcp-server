# Flutter Package MCP Server

🚀 **Flutter paketleri için Model Context Protocol (MCP) server** - Claude ve diğer AI asistanları ile Flutter paket ekosistemini entegre kullanın!

Pub.dev API'si ile entegre çalışarak Flutter paketlerinin güncel bilgilerini, versiyonlarını ve dokümantasyonlarını AI asistanınızın kullanımına sunar.

## ✨ Özellikler

- 📦 **Paket Bilgileri**: Güncel versiyon, açıklama, bağımlılıklar ve kurulum talimatları
- 🔍 **Akıllı Arama**: Anahtar kelime ile Flutter paket arama
- 📊 **Versiyon Yönetimi**: Tüm paket versiyonlarını listeleme ve karşılaştırma
- 📖 **Kapsamlı Dokümantasyon**: README, API dokümantasyonu ve özel dokümantasyon
- ⭐ **Paket Değerlendirmesi**: Popülerlik, kalite skorları ve topluluk beğenileri
- 🔥 **Trend Analizi**: En popüler ve trend olan paketleri keşfetme
- 🇹🇷 **Türkçe Destek**: Tamamen Türkçe arayüz ve açıklamalar

## 🛠️ Kurulum

### Ön Koşullar

- **Node.js** v18 veya üzeri ([İndir](https://nodejs.org/))
- **npm** veya **yarn** paket yöneticisi
- **Claude Desktop** veya MCP destekli bir AI client

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/OrtakProje-1/flutter-package-mcp-server.git
cd flutter-package-mcp-server
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Projeyi Build Edin

```bash
npm run build
```

### 4. Test Edin

```bash
npm run dev
```

Server başarıyla çalışırsa terminalden çıkmak için `Ctrl+C` kullanın.

## 🔧 MCP Client Kurulumu

### Claude Desktop ile Kullanım

1. **Claude Desktop Config Dosyasını Bulun:**

   **macOS:**

   ```bash
   ~/Library/Application Support/Claude/claude_desktop_config.json
   ```

   **Windows:**

   ```bash
   %APPDATA%\Claude\claude_desktop_config.json
   ```

   **Linux:**

   ```bash
   ~/.config/Claude/claude_desktop_config.json
   ```

2. **Config dosyasını düzenleyin:**

   ```json
   {
     "mcpServers": {
       "flutter-packages": {
         "command": "node",
         "args": ["/FULL/PATH/TO/flutter-package-mcp-server/dist/index.js"],
         "env": {}
       }
     }
   }
   ```

   ⚠️ **Önemli:** `/FULL/PATH/TO/flutter-package-mcp-server` kısmını projenin gerçek tam yolu ile değiştirin.

3. **Claude Desktop'ı yeniden başlatın**

### Cursor IDE ile Kullanım

1. **Cursor ayarlarını açın** (`Cmd/Ctrl + ,`)

2. **MCP ayarlarına şu konfigürasyonu ekleyin:**

   ```json
   {
     "mcp": {
       "servers": {
         "flutter-packages": {
           "command": "node",
           "args": ["/FULL/PATH/TO/flutter-package-mcp-server/dist/index.js"]
         }
       }
     }
   }
   ```

3. **Cursor'u yeniden başlatın**

### Diğer MCP Clientlar

Bu server, MCP standardını destekleyen herhangi bir client ile kullanılabilir. Server stdio üzerinden iletişim kurar.

## 🎯 Kullanım Örnekleri

### Paket Bilgisi Alma

```
"http paketinin güncel bilgilerini ve kurulum talimatlarını getir"
```

### Paket Arama

```
"state management için en iyi Flutter paketlerini ara"
```

### Versiyon Karşılaştırması

```
"provider paketinin tüm versiyonlarını listele"
```

### Dokümantasyon

```
"bloc paketinin detaylı dokümantasyonunu ve kullanım örneklerini getir"
```

### Trend Analizi

```
"Bu ay trend olan Flutter paketlerini göster"
```

### Paket Değerlendirmesi

```
"riverpod ve provider paketlerini karşılaştır, hangisi daha popüler?"
```

## 🛠️ Geliştirme

### Geliştirme Ortamını Hazırlama

```bash
# Repository'yi fork edin ve klonlayın
git clone https://github.com/OrtakProje-1/flutter-package-mcp-server.git
cd flutter-package-mcp-server

# Bağımlılıkları yükleyin
npm install

# Geliştirme modunda çalıştırın
npm run dev
```

### Mevcut Scriptler

```bash
# TypeScript'i build et
npm run build

# Geliştirme modunda çalıştır (hot reload)
npm run dev

# Production modunda çalıştır
npm start

# Tip kontrolü
npm run type-check
```

### Proje Yapısı

```
flutter-package-mcp-server/
├── src/
│   └── index.ts          # Ana server kodu
├── dist/                 # Build edilmiş dosyalar
├── package.json
├── tsconfig.json
└── README.md
```

### Yeni Özellik Ekleme

1. `src/index.ts` dosyasında `FlutterPackageMCPServer` sınıfına yeni method ekleyin
2. `setupToolHandlers()` metodunda yeni tool'u tanımlayın
3. `CallToolRequestSchema` handler'ında yeni case ekleyin
4. Build edin ve test edin

## 📊 Mevcut API Araçları

| Araç Adı                    | Açıklama                  | Parametreler                               |
| --------------------------- | ------------------------- | ------------------------------------------ |
| `get_package_info`          | Paket detaylarını getirir | `package_name: string`                     |
| `search_packages`           | Paket arama yapar         | `query: string`, `page?: number`           |
| `get_package_versions`      | Tüm versiyonları listeler | `package_name: string`                     |
| `get_package_documentation` | Dokümantasyon getirir     | `package_name: string`, `version?: string` |
| `get_package_score`         | Paket skorlarını getirir  | `package_name: string`                     |
| `get_trending_packages`     | Trend paketleri listeler  | `page?: number`                            |

## ⚡ Performans ve Limitler

### Pub.dev API Limitleri

- **Rate Limiting**: Saniyede 10 istek, dakikada 600 istek
- **Günlük Limit**: 36,000 istek/saat
- **Timeout**: 30 saniye

### Optimizasyon İpuçları

- Sık kullanılan paketler için cache kullanımı planlanıyor
- Batch istekler gelecek versiyonda eklenecek

## 🐛 Sorun Giderme

### Server Çalışmıyor

```bash
# Node.js versiyonunu kontrol edin
node --version  # v18+ olmalı

# Bağımlılıkları yeniden yükleyin
rm -rf node_modules package-lock.json
npm install

# Build işlemini tekrarlayın
npm run build
```

### Claude Desktop Bağlantı Sorunu

1. **Config dosyası konumunu doublcheck edin**
2. **JSON syntax'ının doğru olduğundan emin olun**
3. **Dosya yolunun mutlak path olduğunu kontrol edin**
4. **Claude Desktop'ı tamamen kapatıp açın**

### API Hataları

```bash
# İnternet bağlantısını test edin
curl https://pub.dev/api/packages/http

# DNS sorunları için
nslookup pub.dev

# Proxy ayarlarınızı kontrol edin
echo $HTTP_PROXY
echo $HTTPS_PROXY
```

### Debug Modu

```bash
# Detaylı loglar için
DEBUG=* npm run dev

# Sadece MCP logları için
DEBUG=mcp:* npm run dev
```

## 🤝 Katkıda Bulunma

Katkılarınızı memnuniyetle karşılıyoruz!

### Katkı Süreci

1. **Fork** edin
2. **Feature branch** oluşturun (`git checkout -b feature/amazing-feature`)
3. **Değişikliklerinizi commit** edin (`git commit -m 'Add amazing feature'`)
4. **Branch'inizi push** edin (`git push origin feature/amazing-feature`)
5. **Pull Request** oluşturun

### Geliştirme Kuralları

- TypeScript strict mode kullanın
- Her yeni özellik için test yazın
- Commit mesajlarında conventional commit formatını kullanın
- README'yi güncel tutun

### İstenen Özellikler

- [ ] Package caching sistemi
- [ ] Offline mod desteği
- [ ] Batch API istekleri
- [ ] Package dependency tree görselleştirmesi
- [ ] Vulnerability checking
- [ ] License compatibility kontrolü

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🙏 Teşekkürler

- [Pub.dev](https://pub.dev) - Flutter paket repository'si
- [Model Context Protocol](https://modelcontextprotocol.io/) - AI entegrasyon standardı
- [Claude](https://claude.ai) - AI asistan platformu
- [Flutter](https://flutter.dev) - Harika framework

## 📞 Destek

Sorularınız veya sorunlarınız için:

- 🐛 **Bug Report**: [GitHub Issues](https://github.com/OrtakProje-1/flutter-package-mcp-server/issues)
- 💡 **Feature Request**: [GitHub Discussions](https://github.com/OrtakProje-1/flutter-package-mcp-server/discussions)
- 📧 **İletişim**: [hasanuk98@gmail.com](mailto:hasanuk98@gmail.com)

---

⭐ **Bu proje faydalı olduysa star vermeyi unutmayın!**

Made with ❤️ for Flutter Community
