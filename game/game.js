/* ============================================================
   Pokémon Safari — dokunmatik mobil web oyunu
   Görseller & isimler: PokéAPI açık kaynak sprite deposundan.
   Tüm oyun istemcide (telefonda) çalışır, sunucu gerektirmez.
   ============================================================ */

// 1. Nesil 151 Pokémon isimleri (index 0 = #1 Bulbasaur)
const POKEMON = [
  "Bulbasaur","Ivysaur","Venusaur","Charmander","Charmeleon","Charizard","Squirtle",
  "Wartortle","Blastoise","Caterpie","Metapod","Butterfree","Weedle","Kakuna","Beedrill",
  "Pidgey","Pidgeotto","Pidgeot","Rattata","Raticate","Spearow","Fearow","Ekans","Arbok",
  "Pikachu","Raichu","Sandshrew","Sandslash","Nidoran♀","Nidorina","Nidoqueen","Nidoran♂",
  "Nidorino","Nidoking","Clefairy","Clefable","Vulpix","Ninetales","Jigglypuff","Wigglytuff",
  "Zubat","Golbat","Oddish","Gloom","Vileplume","Paras","Parasect","Venonat","Venomoth",
  "Diglett","Dugtrio","Meowth","Persian","Psyduck","Golduck","Mankey","Primeape","Growlithe",
  "Arcanine","Poliwag","Poliwhirl","Poliwrath","Abra","Kadabra","Alakazam","Machop","Machoke",
  "Machamp","Bellsprout","Weepinbell","Victreebel","Tentacool","Tentacruel","Geodude","Graveler",
  "Golem","Ponyta","Rapidash","Slowpoke","Slowbro","Magnemite","Magneton","Farfetch'd","Doduo",
  "Dodrio","Seel","Dewgong","Grimer","Muk","Shellder","Cloyster","Gastly","Haunter","Gengar",
  "Onix","Drowzee","Hypno","Krabby","Kingler","Voltorb","Electrode","Exeggcute","Exeggutor",
  "Cubone","Marowak","Hitmonlee","Hitmonchan","Lickitung","Koffing","Weezing","Rhyhorn","Rhydon",
  "Chansey","Tangela","Kangaskhan","Horsea","Seadra","Goldeen","Seaking","Staryu","Starmie",
  "Mr. Mime","Scyther","Jynx","Electabuzz","Magmar","Pinsir","Tauros","Magikarp","Gyarados",
  "Lapras","Ditto","Eevee","Vaporeon","Jolteon","Flareon","Porygon","Omanyte","Omastar","Kabuto",
  "Kabutops","Aerodactyl","Snorlax","Articuno","Zapdos","Moltres","Dratini","Dragonair","Dragonite",
  "Mewtwo","Mew"
];

// Efsanevi/nadir Pokémon -> yakalaması daha zor (dar yeşil bölge)
const RARE = new Set([3,6,9,143,144,145,146,149,150,151]);

// Sprite URL'leri (PokéAPI sprite deposu — GitHub raw)
const ART = id => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
const PIX = id => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

const $ = sel => document.querySelector(sel);
const rand = n => Math.floor(Math.random() * n);
const randId = () => rand(151) + 1; // 1..151

/* ---------------- Kalıcı kayıt (localStorage) ---------------- */
const SAVE_KEY = "pokesafari_v1";
const store = {
  data: { caught: [], highscore: 0 },
  load() {
    try { Object.assign(this.data, JSON.parse(localStorage.getItem(SAVE_KEY)) || {}); }
    catch (e) { /* ilk açılış */ }
    this.data.caught = this.data.caught || [];
  },
  save() { localStorage.setItem(SAVE_KEY, JSON.stringify(this.data)); },
  addCatch(id) { if (!this.data.caught.includes(id)) { this.data.caught.push(id); this.save(); return true; } return false; },
  setHigh(s) { if (s > this.data.highscore) { this.data.highscore = s; this.save(); } }
};
store.load();

/* ---------------- Ekran yönetimi ---------------- */
function goto(name) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  $("#screen-" + name).classList.add("active");
  if (name === "menu") refreshMenu();
  if (name === "catch") startCatch();
  if (name === "quiz") startQuiz();
  if (name === "dex") renderDex();
}
document.body.addEventListener("click", e => {
  const t = e.target.closest("[data-goto]");
  if (t) goto(t.dataset.goto);
});

function refreshMenu() {
  $("#menu-highscore").textContent = store.data.highscore;
  $("#menu-caught").textContent = store.data.caught.length;
  $("#menu-sprite").src = ART(randId());
}

/* ============================================================
   YAKALAMA MODU
   ============================================================ */
let catchState = null;

function startCatch() {
  catchState = { score: 0, combo: 0 };
  $("#catch-score").textContent = 0;
  $("#catch-combo").textContent = 0;
  spawnWild();
}

function spawnWild() {
  stopMarker();
  const id = randId();
  const rare = RARE.has(id);
  catchState.current = { id, rare, balls: 3, caught: false };

  const sprite = $("#wild-sprite");
  sprite.className = "wild-sprite idle";
  sprite.src = ART(id);
  $("#wild-name").textContent = "???";
  $("#wild-name").style.color = "";
  updateBalls(3);
  setMessage(rare ? "Nadir bir Pokémon belirdi! ✨" : "Vahşi bir Pokémon belirdi!", "");

  // Yeşil bölge genişliği: nadir = dar, normal = geniş
  const zoneW = rare ? 14 : 26;            // % cinsinden
  const zoneLeft = 20 + rand(60 - zoneW);  // 20..80 arası
  const zone = $("#timing-zone");
  zone.style.width = zoneW + "%";
  zone.style.left = zoneLeft + "%";
  catchState.zone = { left: zoneLeft, right: zoneLeft + zoneW };

  // Marker hızı: nadir daha hızlı
  catchState.speed = rare ? 1.6 : 1.1;
  startMarker();
  $("#throw-btn").disabled = false;
}

/* Sağa-sola gidip gelen işaretçi (requestAnimationFrame) */
function startMarker() {
  const marker = $("#timing-marker");
  let pos = 0, dir = 1;
  function frame() {
    pos += dir * catchState.speed;
    if (pos >= 100) { pos = 100; dir = -1; }
    if (pos <= 0) { pos = 0; dir = 1; }
    marker.style.left = pos + "%";
    catchState.markerPos = pos;
    catchState.raf = requestAnimationFrame(frame);
  }
  catchState.raf = requestAnimationFrame(frame);
}
function stopMarker() { if (catchState && catchState.raf) cancelAnimationFrame(catchState.raf); }

function updateBalls(n) {
  $("#catch-balls").textContent = "⚪".repeat(n) + "·".repeat(3 - n);
}
function setMessage(txt, cls) {
  const m = $("#catch-message");
  m.textContent = txt;
  m.className = "catch-message" + (cls ? " " + cls : "");
}

$("#throw-btn").addEventListener("click", throwBall);

function throwBall() {
  const cur = catchState.current;
  if (!cur || cur.caught || cur.balls <= 0) return;

  stopMarker();
  $("#throw-btn").disabled = true;

  const pos = catchState.markerPos;
  const { left, right } = catchState.zone;
  const inZone = pos >= left && pos <= right;
  // ortaya ne kadar yakınsa o kadar iyi
  const center = (left + right) / 2;
  const accuracy = inZone ? 1 - Math.abs(pos - center) / ((right - left) / 2) : 0;

  // Pokéball atış animasyonu
  const fx = $("#pokeball-fx");
  fx.className = "pokeball-fx throw";

  setTimeout(() => {
    if (inZone) {
      fx.className = "pokeball-fx shake";
      setTimeout(() => { fx.className = "pokeball-fx"; onCatchSuccess(accuracy); }, 1200);
    } else {
      fx.className = "pokeball-fx";
      onCatchMiss();
    }
  }, 450);
}

function onCatchSuccess(accuracy) {
  const cur = catchState.current;
  cur.caught = true;

  const points = Math.round((cur.rare ? 100 : 30) * (1 + accuracy) + catchState.combo * 5);
  catchState.score += points;
  catchState.combo += 1;
  $("#catch-score").textContent = catchState.score;
  $("#catch-combo").textContent = catchState.combo;
  store.setHigh(catchState.score);

  const isNew = store.addCatch(cur.id);
  $("#wild-name").textContent = POKEMON[cur.id - 1];
  $("#wild-name").style.color = "var(--green)";
  $("#wild-sprite").className = "wild-sprite caught";
  setMessage(`Yakalandı! +${points} ${isNew ? "🆕 Pokédex'e eklendi!" : ""}`, "success");

  setTimeout(spawnWild, 1400);
}

function onCatchMiss() {
  const cur = catchState.current;
  cur.balls -= 1;
  catchState.combo = 0;
  $("#catch-combo").textContent = 0;
  updateBalls(cur.balls);

  // hedef kaçış hareketi
  const sprite = $("#wild-sprite");
  sprite.className = "wild-sprite";
  sprite.style.transform = "translateX(20px)";
  setTimeout(() => { sprite.style.transform = ""; sprite.className = "wild-sprite idle"; }, 200);

  if (cur.balls <= 0) {
    setMessage("Pokémon kaçtı! 💨", "fail");
    sprite.className = "wild-sprite flee";
    setTimeout(spawnWild, 1200);
  } else {
    setMessage(`Iskaladın! ${cur.balls} top kaldı.`, "fail");
    startMarker();
    $("#throw-btn").disabled = false;
  }
}

/* ============================================================
   QUIZ MODU — "Bu Hangi Pokémon?"
   ============================================================ */
let quizState = null;

function startQuiz() {
  quizState = { score: 0, lives: 3 };
  $("#quiz-score").textContent = 0;
  $("#quiz-lives").textContent = "●●●";
  nextQuiz();
}

function nextQuiz() {
  const answerId = randId();
  quizState.answer = answerId;

  const img = $("#quiz-sprite");
  img.className = "silhouette";
  img.src = ART(answerId);

  // 4 seçenek: 1 doğru + 3 yanlış (benzersiz)
  const opts = new Set([answerId]);
  while (opts.size < 4) opts.add(randId());
  const list = [...opts].sort(() => Math.random() - 0.5);

  const box = $("#quiz-options");
  box.innerHTML = "";
  list.forEach(id => {
    const b = document.createElement("button");
    b.className = "quiz-opt";
    b.textContent = POKEMON[id - 1];
    b.onclick = () => answerQuiz(b, id);
    box.appendChild(b);
  });
}

function answerQuiz(btn, id) {
  // çift tıklamayı engelle
  [...$("#quiz-options").children].forEach(b => b.onclick = null);
  $("#quiz-sprite").classList.add("reveal");

  if (id === quizState.answer) {
    btn.classList.add("correct");
    quizState.score += 10;
    $("#quiz-score").textContent = quizState.score;
    store.setHigh(quizState.score);
    store.addCatch(quizState.answer); // doğru bilince Pokédex'e ekle
    setTimeout(nextQuiz, 900);
  } else {
    btn.classList.add("wrong");
    // doğru cevabı yeşil göster
    [...$("#quiz-options").children].forEach(b => {
      if (b.textContent === POKEMON[quizState.answer - 1]) b.classList.add("correct");
    });
    quizState.lives -= 1;
    $("#quiz-lives").textContent = "●".repeat(quizState.lives) + "·".repeat(3 - quizState.lives);
    if (quizState.lives <= 0) {
      setTimeout(() => {
        alert(`Oyun bitti! Skorun: ${quizState.score}`);
        goto("menu");
      }, 1000);
    } else {
      setTimeout(nextQuiz, 1300);
    }
  }
}

/* ============================================================
   POKÉDEX
   ============================================================ */
function renderDex() {
  $("#dex-count").textContent = store.data.caught.length;
  const grid = $("#dex-grid");
  grid.innerHTML = "";
  for (let id = 1; id <= 151; id++) {
    const owned = store.data.caught.includes(id);
    const cell = document.createElement("div");
    cell.className = "dex-cell" + (owned ? "" : " locked");
    cell.innerHTML =
      `<img src="${PIX(id)}" loading="lazy" alt="">
       <span class="num">#${String(id).padStart(3, "0")}</span>
       <small>${owned ? POKEMON[id - 1] : "???"}</small>`;
    grid.appendChild(cell);
  }
}

/* ---------------- Başlangıç ---------------- */
refreshMenu();
