<script setup>
import { onMounted, ref } from "vue";
import HelloWorld from "./components/HelloWorld.vue";
import Sketch from "sketch-js/js/sketch";

onMounted(() => {
  let sketch = Sketch.create(),
    center = {
      x: sketch.width / 2,
      y: sketch.height / 2,
    },
    orbs = [],
    dt = 1,
    opt = {
      total: 0,
      count: 100,
      spacing: 2,
      speed: 30,
      scale: 1,
      jitterRadius: 0,
      jitterHue: 0,
      clearAlpha: 10,
      toggleOrbitals: true,
      orbitalAlpha: 100,
      toggleLight: true,
      lightAlpha: 5,
      clear: function () {
        sketch.clearRect(0, 0, sketch.width, sketch.height), (orbs.length = 0);
      },
    };

  class Orb {
    constructor(x, y) {
      var dx = x / opt.scale - center.x / opt.scale,
        dy = y / opt.scale - center.y / opt.scale;
      this.angle = atan2(dy, dx);
      this.lastAngle = this.angle;
      this.radius = sqrt(dx * dx + dy * dy);
      this.size = this.radius / 300 + 1;
      this.speed = (random(1, 10) / 300000) * this.radius + 0.005;
    }
    update() {
      this.lastAngle = this.angle;
      this.angle += this.speed * (opt.speed / 50) * dt;
      this.x = this.radius * cos(this.angle);
      this.y = this.radius * sin(this.angle);
    }
    render() {
      if (opt.toggleOrbitals) {
        var radius =
          opt.jitterRadius === 0
            ? this.radius
            : this.radius + random(-opt.jitterRadius, opt.jitterRadius);
        radius = opt.jitterRadius != 0 && radius < 0 ? 0.001 : radius;
        sketch.strokeStyle =
          "hsla( " +
          ((this.angle + 90) / (PI / 180) +
            random(-opt.jitterHue, opt.jitterHue)) +
          ", 100%, 50%, " +
          opt.orbitalAlpha / 100 +
          " )";
        sketch.lineWidth = this.size;
        sketch.beginPath();
        if (opt.speed >= 0) {
          sketch.arc(0, 0, radius, this.lastAngle, this.angle + 0.001, false);
        } else {
          sketch.arc(0, 0, radius, this.angle, this.lastAngle + 0.001, false);
        }
        sketch.stroke();
        sketch.closePath();
      }

      if (opt.toggleLight) {
        sketch.lineWidth = 0.5;
        sketch.strokeStyle =
          "hsla( " +
          ((this.angle + 90) / (PI / 180) +
            random(-opt.jitterHue, opt.jitterHue)) +
          ", 100%, 70%, " +
          opt.lightAlpha / 100 +
          " )";
        sketch.beginPath();
        sketch.moveTo(0, 0);
        sketch.lineTo(this.x, this.y);
        sketch.stroke();
      }
    }
  }

  const createOrb = function (config) {
    var x = config && config.x ? config.x : sketch.mouse.x,
      y = config && config.y ? config.y : sketch.mouse.y;
    orbs.push(new Orb(x, y));
  };

  const turnOnMove = function () {
    sketch.mousemove = createOrb;
  };

  const turnOffMove = function () {
    sketch.mousemove = null;
  };

  sketch.mousedown = function () {
    createOrb();
    turnOnMove();
  };

  sketch.mouseup = turnOffMove;

  sketch.resize = () => {
    center.x = sketch.width / 2;
    center.y = sketch.height / 2;
    sketch.lineCap = "round";
  };

  sketch.setup = function () {
    while (opt.count--) {
      createOrb({
        x: random(sketch.width / 2 - 300, sketch.width / 2 + 300),
        y: random(sketch.height / 2 - 300, sketch.height / 2 + 300),
      });
    }
  };

  sketch.clear = function () {
    sketch.globalCompositeOperation = "destination-out";
    sketch.fillStyle = "rgba( 0, 0, 0 , " + opt.clearAlpha / 100 + " )";
    sketch.fillRect(0, 0, sketch.width, sketch.height);
    sketch.globalCompositeOperation = "lighter";
  };

  sketch.update = function () {
    dt = sketch.dt < 0.1 ? 0.1 : sketch.dt / 16;
    dt = dt > 5 ? 5 : dt;
    var i = orbs.length;
    opt.total = i;
    while (i--) {
      orbs[i].update();
    }
  };

  sketch.draw = function () {
    sketch.save();
    sketch.translate(center.x, center.y);
    sketch.scale(opt.scale, opt.scale);
    var i = orbs.length;
    while (i--) {
      orbs[i].render();
    }
    sketch.restore();
  };

  const canvas = document.querySelector("canvas");
  canvas.style.position = "absolute";
  canvas.style.inset = "0";
  canvas.style.zIndex = "-1";
});

const useParty = ref(false);
const showCanvas = () => {
  const canvas = document.querySelector("canvas");
  canvas.style.zIndex = "1";
  showPartyTitle(true, 3000);
  showPartyTitle(false, 6000);
};

const showPartyTitle = (bool, time) => {
  setTimeout(() => (useParty.value = bool), time);
};
</script>

<template>
  <div class="wrapper">
    <span v-if="useParty">
      Скучная вечеринка? Добавь огня, кликая по экрану!
    </span>
    <HelloWorld @showCanvas="showCanvas" />
  </div>
</template>

<style scoped>
.wrapper {
  width: 100vw;
  height: 100vh;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}
</style>
