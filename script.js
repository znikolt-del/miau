const canvas = document.getElementById('garden-canvas');
const ctx = canvas.getContext('2d');

let flowers = [];
let petals = [];
let audioContext = null;
let isPlayingMusic = false;

// Ajustar tamaño del Canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// DIBUJAR FLORES
class Flower {
  constructor(x, y) {
    this.x = x;
    this.y = window.innerHeight;
    this.targetY = y;
    this.stemHeight = 0;
    this.maxStemHeight = window.innerHeight - y;
    this.petalSize = 0;
    this.maxPetalSize = Math.random() * 20 + 20;
    this.petalCount = Math.floor(Math.random() * 4) + 6;
    this.color = ['#ff7675', '#fd79a8', '#fdcb6e', '#e84393', '#00b894'][Math.floor(Math.random() * 5)];
    this.growthSpeed = Math.random() * 4 + 4;
    this.isFullyGrown = false;
  }

  update() {
    if (this.stemHeight < this.maxStemHeight) {
      this.stemHeight += this.growthSpeed;
    } else if (this.petalSize < this.maxPetalSize) {
      this.petalSize += 0.8;
    } else {
      this.isFullyGrown = true;
    }
  }

  draw() {
    const currentY = window.innerHeight - this.stemHeight;

    // Tallo
    ctx.beginPath();
    ctx.moveTo(this.x, window.innerHeight);
    ctx.quadraticCurveTo(this.x + 10, window.innerHeight - this.stemHeight / 2, this.x, currentY);
    ctx.strokeStyle = '#2ed573';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Hojas
    if (this.stemHeight > this.maxStemHeight * 0.4) {
      ctx.beginPath();
      ctx.ellipse(this.x - 12, window.innerHeight - this.stemHeight * 0.4, 15, 6, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fillStyle = '#2ed573';
      ctx.fill();
    }

    // Pétalos
    if (this.stemHeight >= this.maxStemHeight) {
      ctx.save();
      ctx.translate(this.x, currentY);
      for (let i = 0; i < this.petalCount; i++) {
        ctx.rotate((Math.PI * 2) / this.petalCount);
        ctx.beginPath();
        ctx.ellipse(0, this.petalSize, this.petalSize / 2, this.petalSize, 0, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }

      // Centro de la flor
      ctx.beginPath();
      ctx.arc(0, 0, this.petalSize / 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffeaa7';
      ctx.fill();
      ctx.restore();
    }
  }
}

// LLUVIA DE PÉTALOS
class Petal {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = -20;
    this.size = Math.random() * 8 + 6;
    this.speedY = Math.random() * 2 + 1;
    this.speedX = Math.random() * 2 - 1;
    this.color = '#ff7675';
    this.angle = Math.random() * 360;
  }

  update() {
    this.y += this.speedY;
    this.x += this.speedX;
    this.angle += 0.02;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.beginPath();
    ctx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = 0.8;
    ctx.fill();
    ctx.restore();
  }
}

// BUCLE DE ANIMACIÓN
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  flowers.forEach((flower) => {
    flower.update();
    flower.draw();
  });

  petals.forEach((petal, index) => {
    petal.update();
    petal.draw();
    if (petal.y > canvas.height) petals.splice(index, 1);
  });

  requestAnimationFrame(animate);
}
animate();

// GENERAR FLORES AUTOMÁTICAS Y AL HACER CLIC
function spawnInitialFlowers() {
  const count = Math.floor(window.innerWidth / 120);
  for (let i = 0; i < count; i++) {
    const x = (canvas.width / count) * i + Math.random() * 40;
    const y = canvas.height - (Math.random() * 200 + 150);
    flowers.push(new Flower(x, y));
  }
}

canvas.addEventListener('click', (e) => {
  flowers.push(new Flower(e.clientX, e.clientY));
});

// SINTETIZADOR DE MÚSICA DE FONDO (Web Audio API)
function playTone(freq, duration) {
  if (!audioContext) return;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, audioContext.currentTime);
  gain.gain.setValueAtTime(0.05, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + duration);
}

function startMelody() {
  const notes = [261.63, 329.63, 392.00, 523.25, 440.00, 349.23];
  let noteIndex = 0;
  setInterval(() => {
    if (isPlayingMusic) {
      playTone(notes[noteIndex], 1.5);
      noteIndex = (noteIndex + 1) % notes.length;
    }
  }, 800);
}

// INTERACCIONES Y EVENTOS
document.getElementById('start-btn').addEventListener('click', () => {
  document.getElementById('intro-overlay').classList.add('hidden');
  spawnInitialFlowers();
  
  // Iniciar audio en interacción del usuario
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  isPlayingMusic = true;
  startMelody();
});

document.getElementById('music-btn').addEventListener('click', () => {
  isPlayingMusic = !isPlayingMusic;
  document.getElementById('music-btn').innerText = isPlayingMusic ? '🎵' : '🔇';
});

document.getElementById('petals-btn').addEventListener('click', () => {
  for (let i = 0; i < 30; i++) {
    petals.push(new Petal());
  }
});

document.getElementById('clear-btn').addEventListener('click', () => {
  flowers = [];
});

// MODAL DE PERSONALIZACIÓN DE MENSAJE
const modal = document.getElementById('modal-overlay');
document.getElementById('edit-btn').addEventListener('click', () => {
  modal.classList.remove('modal-hidden');
});

document.getElementById('cancel-btn').addEventListener('click', () => {
  modal.classList.add('modal-hidden');
});

document.getElementById('save-btn').addEventListener('click', () => {
  const newTitle = document.getElementById('input-title').value;
  const newMessage = document.getElementById('input-message').value;

  if (newTitle) document.getElementById('title-text').innerText = newTitle;
  if (newMessage) document.getElementById('message-text').innerText = newMessage;

  modal.classList.add('modal-hidden');
});
