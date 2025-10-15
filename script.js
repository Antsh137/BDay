const PI2 = Math.PI * 2;
const random = (min, max) => (Math.random() * (max - min + 1) + min) | 0;
const timestamp = () => new Date().getTime();

const fireworkSound = document.getElementById("firework-sound");
if (fireworkSound) fireworkSound.volume = 0.4;

class Firework {
  constructor(x, y, targetX, targetY, shade, offsprings) {
    this.dead = false;
    this.offsprings = offsprings;
    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.targetY = targetY;
    this.shade = shade;
    this.history = [];
  }

  update(delta) {
    if (this.dead) return;
    const xDiff = this.targetX - this.x;
    const yDiff = this.targetY - this.y;

    if (Math.abs(xDiff) > 3 || Math.abs(yDiff) > 3) {
      this.x += xDiff * 2 * delta;
      this.y += yDiff * 2 * delta;
      this.history.push({ x: this.x, y: this.y });
      if (this.history.length > 10) this.history.shift();
    } else {
      if (this.offsprings && !this.madeChilds) {
        const babies = this.offsprings / 2;
        for (let i = 0; i < babies; i++) {
          const targetX = this.x + this.offsprings * Math.cos((PI2 * i) / babies);
          const targetY = this.y + this.offsprings * Math.sin((PI2 * i) / babies);
          birthday.fireworks.push(
            new Firework(this.x, this.y, targetX, targetY, this.shade, 0)
          );
        }
      }
      this.madeChilds = true;
      this.history.shift();
    }

    if (this.history.length === 0) this.dead = true;
    else {
      for (let i = 0; i < this.history.length; i++) {
        const point = this.history[i];
        ctx.beginPath();
        ctx.fillStyle = `hsl(${this.shade},100%,${i + 30}%)`;
        ctx.arc(point.x, point.y, 1, 0, PI2, false);
        ctx.fill();
      }
    }
  }
}

class Birthday {
  constructor() {
    this.resize();
    this.fireworks = [];
    this.counter = 0;
  }

  resize() {
    this.width = canvas.width = window.innerWidth;
    this.height = canvas.height = window.innerHeight;
    const center = this.width / 2;
    this.spawnA = center - center / 3;
    this.spawnB = center + center / 3;
    this.spawnC = this.height * 0.1;
    this.spawnD = this.height * 0.5;
  }

  onClick(evt) {
    if (fireworkSound) {
      fireworkSound.currentTime = 0;
      fireworkSound.play().catch(() => {});
    }

    const x = evt.clientX || evt.touches?.[0].pageX;
    const y = evt.clientY || evt.touches?.[0].pageY;
    const count = random(2, 4);

    for (let i = 0; i < count; i++) {
      this.fireworks.push(
        new Firework(
          random(this.spawnA, this.spawnB),
          this.height,
          x,
          y,
          random(0, 360),
          random(15, 60)
        )
      );
    }

    this.counter = -1;
  }

  autoFire() {
    const x = random(50, this.width - 50);
    const y = random(this.spawnC, this.spawnD);
    const count = random(1, 3);
    for (let i = 0; i < count; i++) {
      this.fireworks.push(
        new Firework(
          random(this.spawnA, this.spawnB),
          this.height,
          x,
          y,
          random(0, 360),
          random(20, 70)
        )
      );
    }
  }

  update(delta) {
    ctx.globalCompositeOperation = "hard-light";
    ctx.fillStyle = `rgba(0,0,0,${6 * delta})`;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.globalCompositeOperation = "lighter";
    for (const f of this.fireworks) f.update(delta);

    this.counter += delta * 3;
    if (this.counter >= 1) {
      this.autoFire();
      this.counter = 0;
    }

    if (this.fireworks.length > 300)
      this.fireworks = this.fireworks.filter(f => !f.dead);
  }
}

const canvas = document.getElementById("birthday");
const ctx = canvas.getContext("2d");
const birthday = new Birthday();
let then = timestamp();

window.onresize = () => birthday.resize();
document.addEventListener("touchstart", e => birthday.onClick(e));
document.addEventListener("click", e => birthday.onClick(e), { passive: true });

// Auto-fire every 2–3 seconds (for passive display)
setInterval(() => birthday.autoFire(), random(2000, 3000));

(function loop() {
  requestAnimationFrame(loop);
  const now = timestamp();
  const delta = (now - then) / 1000;
  then = now;
  birthday.update(delta);
})();
