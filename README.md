# INFAST - Hra pro dva hráče

Moderní webová hra zaměřená na reakce pro dva hráče.

## 🎮 O hře

INFAST je dynamická hra pro dva hráče, kde každý hráč soutěží o nejlepší reakci. Cílem je stisknout klávesu co nejblíže k 0,1 sekundě před koncem 10sekundového odpočtu.

### Ovládání
- **Hráč 1**: Mezerník (Space)
- **Hráč 2**: Enter

## 🎨 Design

Hra je navržena s moderním, futuristickým designem inspirovaným školními barvami:
- **Hlavní barvy**: Modrá, oranžová a bílá
- **Styly**: Hladké gradienty, animace a moderní typografie
- **Písma**: Orbitron (logo), Rajdhani (hlavní text)

## ⚙️ Funkce

- ✨ Plně responzivní design
- 🎯 Přesný časovač s aktualizací každých 10ms
- 🏆 Systém vyhodnocování vítěze
- 🎨 Animované pozadí s částicemi
- 💫 Smooth animace a přechody
- 🎊 Konfety pro vítěze
- 🔄 Možnost opakování hry
- 📊 Zobrazení statistik reakce a odchylky

## 🚀 Jak spustit

1. Otevřete soubor `index.html` v moderním webovém prohlížeči
2. Nebo použijte lokální server (doporučeno pro nejlepší výkon):
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Nebo pomocí Node.js
   npx serve
   ```
3. Otevřete v prohlížeči: `http://localhost:8000`

## 📋 Pravidla hry

1. **Příprava**: Oba hráči se připraví před zahájením odpočtu
2. **Odpočet**: 10sekundový odpočet začne
3. **Ideální čas**: Hráč by měl stisknout klávesu mezi 0,1s a 0,0s
4. **Příliš brzy**: Pokud hráč stiskne klávesu dříve než 0,1s před koncem, dostane penalizaci
5. **Vítěz**: Hráč, který je blíže k cílovému času (0,1s před koncem), vyhrává

## 🎯 Hodnocení

- **Perfektní** (±10ms): Neuvěřitelná reakce!
- **Skvělé** (±50ms): Vynikající timing!
- **Dobré**: Blízko k cíli
- **Příliš brzy**: Penalizace za předčasný stisk

## 🛠️ Technologie

- **HTML5**: Struktura stránky
- **CSS3**: Styling, animace, gradienty
- **Vanilla JavaScript**: Herní logika, časovač, event handling
- **Google Fonts**: Orbitron, Rajdhani

## 📱 Responzivita

Hra je plně responzivní a funguje na:
- 🖥️ Desktop (1920px+)
- 💻 Laptop (1024px+)
- 📱 Tablet (768px+)
- 📱 Mobilní zařízení (480px+)

## 🎨 Barevná paleta

```css
Modrá:
- Primary: #1e3a8a
- Light: #3b82f6
- Lighter: #60a5fa

Oranžová:
- Primary: #ea580c
- Light: #f97316
- Lighter: #fb923c

Neutrální:
- White: #ffffff
- Gray: #9ca3af
- Dark: #1f2937
```

## 🔧 Konfigurace

V souboru `game.js` můžete upravit následující parametry:

```javascript
const CONFIG = {
    COUNTDOWN_DURATION: 10000,  // Délka odpočtu (ms)
    TARGET_TIME: 100,            // Cílový čas před koncem (ms)
    TOLERANCE_PERFECT: 10,       // Tolerance pro perfektní skóre (ms)
    TOLERANCE_GOOD: 50,          // Tolerance pro dobré skóre (ms)
    TIMER_UPDATE_INTERVAL: 10,   // Frekvence aktualizace časovače (ms)
};
```

## 🐛 Debug

Pro zobrazení debug informací v konzoli prohlížeče:
```javascript
window.debugGame()
```

## 👨‍💻 Autor

**Giovanni** - INFAST School Project

## 📄 Licence

Tento projekt je vytvořen pro školní účely.

## 🌟 Budoucí vylepšení

- 🔊 Zvukové efekty
- 💾 Ukládání nejlepších výsledků
- 👥 Více herních režimů
- 🏅 Žebříček nejlepších časů
- 🌐 Multiplayer přes síť
- 📊 Rozšířené statistiky
- 🎨 Více barevných témat
- 🌍 Více jazykových verzí

---

**Enjoy the game! 🎮✨**
# INFAST
