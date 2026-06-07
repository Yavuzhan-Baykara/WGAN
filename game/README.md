# 🎮 Pokémon Safari — Mobil Web Oyunu

Telefonun tarayıcısında **anında** oynanan, dokunmatik kontrollü bir Pokémon oyunu.
Kurulum yok, app store yok — sadece bir linki aç ve oyna.

## Özellikler
- 🎯 **Yakalama Modu** — Vahşi Pokémon'lar belirir; zamanlama çubuğu yeşil bölgedeyken
  Pokéball at, yakala! Nadir/efsanevi Pokémon'lar daha zor.
- ❓ **Bu Hangi Pokémon?** — Silüetten 4 şıkla Pokémon'u tahmin et (bilgi yarışması).
- 📕 **Pokédex** — Yakaladığın 1. nesil 151 Pokémon koleksiyonu (telefonda kayıtlı kalır).
- 🔥 Combo + skor + rekor sistemi, `localStorage` ile kalıcı kayıt.
- 📱 Tamamen mobil-öncelikli (touch) tasarım, safe-area desteği.

Görseller ve Pokémon isimleri açık kaynak **[PokéAPI](https://pokeapi.co)** sprite
deposundan çekilir. Sunucu/build gerekmez — saf HTML + CSS + JavaScript.

## Yerel çalıştırma
Sadece `index.html` dosyasını tarayıcıda aç. Ya da basit bir sunucu:
```bash
cd game
python3 -m http.server 8000
# tarayıcıda http://localhost:8000
```

## GitHub Pages ile yayınlama (telefondan oynamak için)
1. Bu klasörün içeriğini bir GitHub reposunun köküne koy
   (veya repo Settings → Pages'te kaynağı `/game` klasörüne ayarla).
2. **Settings → Pages → Source: Deploy from a branch** seç,
   branch olarak `main` (ya da ilgili branch) + klasör `/ (root)` seç.
3. Birkaç dakika içinde `https://<kullanıcı-adı>.github.io/<repo-adı>/`
   adresinden telefonda oynanabilir hale gelir.

## Dosyalar
| Dosya | Açıklama |
|-------|----------|
| `index.html` | Oyun ekranları (menü, yakalama, quiz, pokédex) |
| `style.css`  | Mobil-öncelikli tema ve animasyonlar |
| `game.js`    | Oyun mantığı, kayıt sistemi, PokéAPI sprite'ları |

> Not: Pokémon, Nintendo/Game Freak'in tescilli markasıdır. Bu proje eğitim amaçlı
> bir fan/hobi çalışmasıdır ve ticari amaç taşımaz.
