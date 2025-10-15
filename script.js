const PI2 = Math.PI * 2;
const random = (min, max) => (Math.random() * (max - min + 1) + min) | 0;
const timestamp = () => new Date().getTime();

const fireworkSound = document.getElementById("firework-sound");
fireworkSound.volume = 0.5;

class Birthday {
  constructor() {
    this.resize();
    this.fireworks = [];
    this.counter = 0;
  }

  resize() {
    this.width = canvas.width = window.innerWidth * devicePixelRatio;
    this.height = canvas.height = window.innerHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    let center = (this.width / 2) / devicePixelRatio | 0;
    this.spawnA = center - (center / 4) | 0;
    this.spawnB = center + (center / 4) | 0;
    this.spawnC = this.height * 0.1 / devicePixelRatio;
    this.spawnD = this.height * 0.5 / devicePixelRatio;
  }

  onClick(evt) {
    // Hide hint when user first interacts
    const hint = document.getElementById("tap-hint");
    if (hint && !hint.classList.contains("hidden")) {
      hint.classList.add("hidden");
    }

    if (fireworkSound) {
      fireworkSound.currentTime = 0;
      fireworkSound.play().catch(() => {});
    }

    let touch = evt.touches ? evt.touches[0] : evt;
    let x = touch.clientX;
    let y = touch.clientY;
    let count = random(3, 5);

    for (let i = 0; i < count; i++) {
      this.fireworks.push(
        new Firework(
          random(this.spawnA, this.spawnB),
          this.height / devicePixelRatio,
          x,
          y,
          random(0, 260),
          random(30, 110)
        )
      );
    }
    this.counter = -1;
  }

  update(delta) {
    ctx.globalCompositeOperation = "hard-light";
    ctx.fillStyle = `rgba(20,20,20,${7 * delta})`;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.globalCompositeOperation = "lighter";
    for (let firework of this.fireworks) firework.update(delta);

    this.counter += delta * 3;
    if (this.counter >= 1) {
      this.fireworks.push(
        new Firework(
          random(this.spawnA, this.spawnB),
          this.height / devicePixelRatio,
          random(0, this.width / devicePixelRatio),
          random(this.spawnC, this.spawnD),
          random(0, 360),
          random(30, 110)
        )
      );
      this.counter = 0;
    }

    if (this.fireworks.length > 800)
      this.fireworks = this.fireworks.filter(f => !f.dead);
  }
}

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

    let xDiff = this.targetX - this.x;
    let yDiff = this.targetY - this.y;

    if (Math.abs(xDiff) > 3 || Math.abs(yDiff) > 3) {
      this.x += xDiff * 2 * delta;
      this.y += yDiff * 2 * delta;
      this.history.push({ x: this.x, y: this.y });
      if (this.history.length > 20) this.history.shift();
    } else {
      if (this.offsprings && !this.madeChilds) {
        let babies = this.offsprings / 2;
        for (let i = 0; i < babies; i++) {
          let targetX = this.x + this.offsprings * Math.cos((PI2 * i) / babies) | 0;
          let targetY = this.y + this.offsprings * Math.sin((PI2 * i) / babies) | 0;
          birthday.fireworks.push(new Firework(this.x, this.y, targetX, targetY, this.shade, 0));
        }
      }
      this.madeChilds = true;
      this.history.shift();
    }

    if (this.history.length === 0) this.dead = true;
    else if (this.offsprings) {
      for (let i = 0; this.history.length > i; i++) {
        let point = this.history[i];
        ctx.beginPath();
        ctx.fillStyle = "hsl(" + this.shade + ",100%," + i + "%)";
        ctx.arc(point.x, point.y, 1, 0, PI2, false);
        ctx.fill();
      }
    } else {
      ctx.beginPath();
      ctx.fillStyle = "hsl(" + this.shade + ",100%,50%)";
      ctx.arc(this.x, this.y, 1, 0, PI2, false);
      ctx.fill();
    }
  }
}

let canvas = document.getElementById("birthday");
let ctx = canvas.getContext("2d");
let then = timestamp();
let birthday = new Birthday();

window.onresize = () => birthday.resize();
document.addEventListener("click", e => birthday.onClick(e));
document.addEventListener("touchstart", e => birthday.onClick(e), { passive: true });

(function loop() {
  requestAnimationFrame(loop);
  let now = timestamp();
  let delta = (now - then) / 1000;
  then = now;
  birthday.update(delta);
})();
