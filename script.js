// ======================================
// 1. KODE RAHASIA
// ======================================

const intro = document.getElementById("intro");
const secretInput = document.getElementById("secretInput");
const dots = [...document.querySelectorAll("#codeDots span")];
const codeError = document.getElementById("codeError");

const giftScreen = document.getElementById("giftScreen");
const flowerReveal = document.getElementById("flowerReveal");
const story = document.getElementById("story");

function syncDots() {
  const value = secretInput.value;

  dots.forEach((dot, i) => {
    dot.classList.toggle("filled", i < value.length);
  });
}

intro.addEventListener("click", () => {
  secretInput.focus();
});

secretInput.addEventListener("input", () => {

  secretInput.value = secretInput.value
    .replace(/\D/g, "")
    .slice(0, 6);

  syncDots();
  codeError.textContent = "";

  if (secretInput.value.length === 6) {

    if (secretInput.value === "141108") {

      intro.classList.add("hidden");
      giftScreen.classList.remove("hidden");

      window.scrollTo(0, 0);

    } else {

      codeError.textContent =
        "Kode belum tepat. Coba sekali lagi, ya.";

      secretInput.value = "";

      syncDots();
      secretInput.focus();
    }
  }
});


// ======================================
// 2. BUKA HADIAH
// ======================================

document.getElementById("openGift").addEventListener("click", () => {

  giftScreen.classList.add("hidden");

  flowerReveal.classList.remove("hidden");

  window.scrollTo(0, 0);

});


// ======================================
// 3. LANJUT KE HALAMAN SCROLL
// ======================================

document.getElementById("continueButton").addEventListener("click", () => {

  flowerReveal.classList.add("hidden");

  story.classList.remove("hidden");

  document.getElementById("cake").scrollIntoView({
    behavior: "smooth"
  });

});


// ======================================
// 4. MEMADAMKAN LILIN KUE
// ======================================

document.querySelectorAll(".candle").forEach(candle => {

  candle.addEventListener("click", () => {

    candle.classList.add("off");

  });

});


// ======================================
// 5. TOMBOL MENUJU BUKET BUNGA
// ======================================

document.getElementById("afterWish").addEventListener("click", () => {

  document.querySelector(".bouquet-section").scrollIntoView({
    behavior: "smooth"
  });

});


// ======================================
// 6. MUSIK / PLAYLIST
// ======================================

const audio = document.getElementById("birthdayAudio");
const playMusic = document.getElementById("playMusic");
const audioStatus = document.getElementById("audioStatus");

playMusic.addEventListener("click", async () => {

  if (audio.paused) {

    try {

      await audio.play();

      playMusic.textContent = "Ⅱ";
      audioStatus.textContent = "Now playing";

    } catch {

      audioStatus.textContent =
        "Letakkan lagu.mp3 di assets/music/";

    }

  } else {

    audio.pause();

    playMusic.textContent = "▶";
    audioStatus.textContent = "Paused";

  }

});

audio.addEventListener("ended", () => {

  playMusic.textContent = "▶";
  audioStatus.textContent = "Replay your song";

});

audio.addEventListener("error", () => {

  audioStatus.textContent =
    "Tambahkan lagu.mp3 ke assets/music/";

});


// ======================================
// 7. WISHING JAR - 7 CATATAN
// ======================================

const notes = [

  "Terima kasih sudah hadir dan membawa warna baik dalam hari-hari di sekitarmu.",

  "Aku bersyukur mengenal seseorang yang punya cara sendiri untuk membuat momen sederhana terasa berarti.",

  "Semoga kamu selalu ingat bahwa dirimu berharga, bahkan pada hari-hari ketika semuanya terasa biasa saja.",

  "Terima kasih untuk tawa, cerita, dan kenangan kecil yang diam-diam menjadi hal istimewa.",

  "Semoga langkahmu selalu didekatkan dengan hal-hal baik dan orang-orang yang tulus.",

  "Aku berharap kamu tidak pernah kehabisan alasan untuk tersenyum dan bangga pada dirimu sendiri.",

  "Satu hal yang pasti: dunia terasa lebih indah karena ada orang seperti kamu di dalamnya."

];

let noteIndex = 0;

const jar = document.getElementById("jar");
const noteText = document.getElementById("noteText");
const noteCount = document.getElementById("noteCount");

function shakeJar() {

  // Memulai animasi botol
  jar.classList.remove("shaking");

  void jar.offsetWidth;

  jar.classList.add("shaking");

  // Mengambil catatan
  const note = notes[noteIndex];

  noteText.textContent = note;

  noteIndex++;

  // Menghitung sisa catatan
  const remaining = notes.length - noteIndex;

  if (remaining > 0) {

    noteCount.textContent =
      `${remaining} little notes remaining`;

  } else {

    noteCount.textContent =
      "All 7 notes have been opened ♡";

    noteIndex = 0;

  }

}


// Tombol kocok botol
document.getElementById("shakeJar").addEventListener("click", shakeJar);


// Klik botol juga bisa mengeluarkan catatan
jar.addEventListener("click", shakeJar);


// Bisa menggunakan keyboard Enter atau Spasi
jar.addEventListener("keydown", event => {

  if (event.key === "Enter" || event.key === " ") {

    event.preventDefault();

    shakeJar();

  }

});


// ======================================
// 8. PENANGANAN FOTO
// ======================================

document.querySelectorAll(".memory img").forEach(img => {

  img.addEventListener("error", () => {

    img.alt = "Tambahkan foto ke folder assets/images";

    img.style.objectFit = "contain";
    img.style.padding = "18px";

  });

});