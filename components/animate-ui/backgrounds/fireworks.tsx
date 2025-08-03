"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

const rand = (
  min: number,
  max: number
): number =>
  Math.random() * (max - min) + min;

const randInt = (
  min: number,
  max: number
): number =>
  Math.floor(
    Math.random() * (max - min) + min
  );

const randColor = (): string =>
  `hsl(${randInt(0, 360)}, 100%, 50%)`;

const PINK_GLOW =
  "rgba(255, 128, 192, 0.7)";
const AN_TEXT = "AN";
const AN_FONT = "bold 120px Arial";
const AN_PARTICLE_SIZE = 7;
const AN_PARTICLE_COUNT = 350; // Adjust for density
const HEART_ORBIT_COUNT = 12; // Number of orbiting hearts
const HEART_ORBIT_RADIUS = 200; // Base radius for heart orbit

type ParticleType = {
  x: number;
  y: number;
  color: string;
  speed: number;
  direction: number;
  vx: number;
  vy: number;
  gravity: number;
  friction: number;
  alpha: number;
  decay: number;
  size: number;
  update: () => void;
  draw: (
    ctx: CanvasRenderingContext2D
  ) => void;
  isAlive: () => boolean;
};

function createParticle(
  x: number,
  y: number,
  color: string,
  speed: number,
  direction: number,
  gravity: number,
  friction: number,
  size: number
): ParticleType {
  const vx =
    Math.cos(direction) * speed;
  const vy =
    Math.sin(direction) * speed;
  const alpha = 1;
  const decay = rand(0.005, 0.02);

  return {
    x,
    y,
    color,
    speed,
    direction,
    vx,
    vy,
    gravity,
    friction,
    alpha,
    decay,
    size,
    update() {
      this.vx *= this.friction;
      this.vy *= this.friction;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
    },
    draw(
      ctx: CanvasRenderingContext2D
    ) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(
        this.x,
        this.y,
        this.size,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    },
    isAlive() {
      return this.alpha > 0;
    },
  };
}

type FireworkType = {
  x: number;
  y: number;
  targetY: number;
  color: string;
  speed: number;
  size: number;
  angle: number;
  vx: number;
  vy: number;
  trail: { x: number; y: number }[];
  trailLength: number;
  exploded: boolean;
  update: () => boolean;
  explode: () => void;
  draw: (
    ctx: CanvasRenderingContext2D
  ) => void;
};

function createFirework(
  x: number,
  y: number,
  targetY: number,
  color: string,
  speed: number,
  size: number,
  particleSpeed:
    | { min: number; max: number }
    | number,
  particleSize:
    | { min: number; max: number }
    | number,
  onExplode: (
    particles: ParticleType[]
  ) => void
): FireworkType {
  const angle =
    -Math.PI / 2 + rand(-0.3, 0.3);
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;
  const trail: {
    x: number;
    y: number;
  }[] = [];
  const trailLength = randInt(10, 25);

  return {
    x,
    y,
    targetY,
    color,
    speed,
    size,
    angle,
    vx,
    vy,
    trail,
    trailLength,
    exploded: false,
    update() {
      this.trail.push({
        x: this.x,
        y: this.y,
      });
      if (
        this.trail.length >
        this.trailLength
      ) {
        this.trail.shift();
      }
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.02;
      if (
        this.vy >= 0 ||
        this.y <= this.targetY
      ) {
        this.explode();
        return false;
      }
      return true;
    },
    explode() {
      const numParticles = randInt(
        80,
        200
      );
      const particles: ParticleType[] =
        [];
      const scale = 8; // Increased scale for bigger heart

      for (
        let i = 0;
        i < numParticles;
        i++
      ) {
        // Distribute t evenly for a full heart with better coverage
        const t =
          (Math.PI * 2 * i) /
          numParticles;

        // Enhanced heart parametric equations for better shape
        const heartX =
          16 * Math.pow(Math.sin(t), 3);
        const heartY =
          13 * Math.cos(t) -
          5 * Math.cos(2 * t) -
          2 * Math.cos(3 * t) -
          Math.cos(4 * t);

        // Add some randomness for more natural explosion
        const randomOffset = rand(
          0.8,
          1.2
        );
        const dirX =
          heartX * scale * randomOffset;
        const dirY =
          -heartY *
          scale *
          randomOffset; // Negative to orient heart upright

        // Particle speed and size with heart-based variation
        const localParticleSpeed =
          getValueByRange(
            particleSpeed
          ) * rand(0.7, 1.3);
        const localParticleSize =
          getValueByRange(particleSize);

        // Calculate direction from center to heart position
        const distance = Math.sqrt(
          dirX * dirX + dirY * dirY
        );
        const angle = Math.atan2(
          dirY,
          dirX
        );

        // Speed varies with distance for more realistic effect
        const speed =
          localParticleSpeed *
          (distance / (scale * 16));

        particles.push(
          createParticle(
            this.x,
            this.y,
            this.color,
            speed,
            angle,
            0.04, // Slightly less gravity for better heart visibility
            0.985, // Less friction for longer trails
            localParticleSize
          )
        );
      }
      onExplode(particles);
    },
    draw(
      ctx: CanvasRenderingContext2D
    ) {
      ctx.save();
      ctx.beginPath();
      if (this.trail.length > 1) {
        ctx.moveTo(
          this.trail[0]?.x ?? this.x,
          this.trail[0]?.y ?? this.y
        );
        for (const point of this
          .trail) {
          ctx.lineTo(point.x, point.y);
        }
      } else {
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y);
      }
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.size;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.restore();
    },
  };
}

function getValueByRange(
  range:
    | { min: number; max: number }
    | number
): number {
  if (typeof range === "number") {
    return range;
  }
  return rand(range.min, range.max);
}

function getColor(
  color: string | string[] | undefined
): string {
  if (Array.isArray(color)) {
    return (
      color[randInt(0, color.length)] ??
      randColor()
    );
  }
  return color ?? randColor();
}

// Helper to get pixel positions for "AN"
function getTextShapePositions(
  text: string,
  font: string,
  width: number,
  height: number,
  count: number
) {
  // Create offscreen canvas
  const canvas =
    document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, width, height);
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.fillText(
    text,
    width / 2,
    height / 2
  );

  const imageData = ctx.getImageData(
    0,
    0,
    width,
    height
  );
  const positions: {
    x: number;
    y: number;
  }[] = [];
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const idx = (y * width + x) * 4;
      if (
        imageData.data[idx + 3] > 128
      ) {
        positions.push({ x, y });
      }
    }
  }
  // Randomly sample 'count' positions
  const sampled = [];
  for (let i = 0; i < count; i++) {
    sampled.push(
      positions[
        Math.floor(
          Math.random() *
            positions.length
        )
      ]
    );
  }
  return sampled;
}

// Draw a glowing heart at (x, y)
function drawGlowingHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  glowColor: string,
  fillColor: string,
  alpha: number
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = size * 2.5;
  ctx.translate(x, y);
  ctx.scale(size / 16, size / 16);
  ctx.beginPath();
  // Heart parametric path
  for (
    let t = 0;
    t <= Math.PI * 2;
    t += 0.05
  ) {
    const hx =
      16 * Math.pow(Math.sin(t), 3);
    const hy =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);
    if (t === 0) ctx.moveTo(hx, -hy);
    else ctx.lineTo(hx, -hy);
  }
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.restore();
}

// Draw a large heart outline
function drawLargeHeartOutline(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  scale: number,
  color: string,
  alpha: number,
  lineWidth: number = 6
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.shadowColor = color;
  ctx.shadowBlur = 30; // Increased glow
  ctx.translate(centerX, centerY);
  ctx.scale(scale, scale);

  ctx.beginPath();
  // Heart parametric path
  for (
    let t = 0;
    t <= Math.PI * 2;
    t += 0.02
  ) {
    const hx =
      16 * Math.pow(Math.sin(t), 3);
    const hy =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);
    if (t === 0) ctx.moveTo(hx, -hy);
    else ctx.lineTo(hx, -hy);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

// Create heart particle for outline effect
function createHeartOutlineParticle(
  x: number,
  y: number,
  angle: number,
  scale: number,
  startTime: number = 0 // Add startTime parameter for fade-in effect
): ParticleType {
  const originalX = x; // Store original position like AN particles
  const originalY = y;
  const baseSize = 6; // Store base size for pulsing
  const jitter = () =>
    (Math.random() - 0.5) * 1.0; // Similar jitter to AN

  return {
    x,
    y,
    color: "#ff69b4",
    speed: 0,
    direction: angle,
    vx: 0,
    vy: 0,
    gravity: 0,
    friction: 1,
    alpha: 0, // Start with 0 alpha for fade-in
    decay: 0,
    size: baseSize,
    update() {
      // Jitter effect similar to AN particles
      this.x = originalX + jitter();
      this.y = originalY + jitter();

      // Fade-in effect based on elapsed time since start
      const elapsed =
        (performance.now() -
          startTime) /
        1000;
      const fadeInDuration = 5; // Same as AN scaling duration

      if (elapsed < fadeInDuration) {
        // Gradual fade-in during the first 5 seconds
        const fadeProgress =
          elapsed / fadeInDuration;
        const baseAlpha =
          fadeProgress * 0.8; // Max alpha of 0.8

        // Add synchronized pulse effect during fade-in
        const time =
          performance.now() * 0.002; // Same frequency as AN
        const pulseFactor =
          1 + Math.sin(time) * 0.2; // Gentle pulse
        this.alpha =
          baseAlpha * pulseFactor;
        this.size =
          baseSize *
          (1 + Math.sin(time) * 0.3); // Size pulse synchronized with AN
      } else {
        // Synchronized pulse effect after fade-in (same as AN particles)
        const time =
          performance.now() * 0.002;
        const pulseAlpha =
          0.8 + Math.sin(time) * 0.2; // Alpha pulse between 0.6 and 1.0
        const pulseSize =
          1 + Math.sin(time) * 0.3; // Size pulse between 70% and 130%

        this.alpha = pulseAlpha;
        this.size =
          baseSize * pulseSize;
      }
    },
    draw(ctx) {
      drawGlowingHeart(
        ctx,
        this.x,
        this.y,
        this.size,
        PINK_GLOW, // Use same glow as AN
        "#ff69b4",
        this.alpha
      );
    },
    isAlive() {
      return true;
    },
  };
}

// Special particle for "AN" hearts
function createLetterParticle(
  x: number,
  y: number,
  color: string,
  size: number
): ParticleType {
  const originalX = x; // Store original position
  const originalY = y;
  const baseSize = size; // Store original size for pulsing
  const jitter = () =>
    (Math.random() - 0.5) * 0.5; // Reduced jitter for stability
  let alpha = 1;
  const decay = 0; // No decay for persistent letters
  return {
    x,
    y,
    color,
    speed: 0,
    direction: 0,
    vx: 0,
    vy: 0,
    gravity: 0,
    friction: 1,
    alpha,
    decay,
    size,
    update() {
      // Very subtle jitter around the original position
      this.x = originalX + jitter();
      this.y = originalY + jitter();

      // Synchronized pulse effect with heart outline
      const time =
        performance.now() * 0.002; // Slower pulse frequency
      const pulseScale =
        1 + Math.sin(time) * 0.3; // Pulse between 70% and 130%
      this.size = baseSize * pulseScale;
      this.alpha =
        0.8 + Math.sin(time) * 0.2; // Alpha pulse between 0.6 and 1.0
    },
    draw(ctx) {
      drawGlowingHeart(
        ctx,
        this.x,
        this.y,
        this.size,
        PINK_GLOW,
        "#ff8fcf",
        this.alpha
      );
    },
    isAlive() {
      return this.alpha > 0;
    },
  };
}

// Orbiting heart particle for surrounding effect
function createOrbitingHeart(
  centerX: number,
  centerY: number,
  angle: number,
  radius: number,
  speed: number,
  size: number
): ParticleType & {
  centerX: number;
  centerY: number;
  radius: number;
} {
  return {
    x:
      centerX +
      Math.cos(angle) * radius,
    y:
      centerY +
      Math.sin(angle) * radius,
    centerX,
    centerY,
    radius,
    color: "#ff69b4",
    speed,
    direction: angle,
    vx: 0,
    vy: 0,
    gravity: 0,
    friction: 1,
    alpha: 1,
    decay: 0,
    size,
    update() {
      // Update angle for orbital motion
      this.direction += this.speed;
      // Calculate new position based on updated angle
      this.x =
        this.centerX +
        Math.cos(this.direction) *
          this.radius;
      this.y =
        this.centerY +
        Math.sin(this.direction) *
          this.radius;
    },
    draw(ctx) {
      // Add sparkle effect
      const sparkleAlpha =
        0.7 +
        Math.sin(this.direction * 5) *
          0.3;
      drawGlowingHeart(
        ctx,
        this.x,
        this.y,
        this.size,
        "#ff1493",
        "#ff69b4",
        sparkleAlpha
      );

      // Add trailing sparkles
      for (let i = 1; i <= 3; i++) {
        const trailX =
          this.x -
          Math.cos(this.direction) *
            i *
            8;
        const trailY =
          this.y -
          Math.sin(this.direction) *
            i *
            8;
        const trailAlpha =
          sparkleAlpha *
          (0.8 - i * 0.2);
        const trailSize =
          this.size * (1 - i * 0.2);

        if (trailAlpha > 0) {
          drawGlowingHeart(
            ctx,
            trailX,
            trailY,
            trailSize,
            "#ff1493",
            "#ff69b4",
            trailAlpha
          );
        }
      }
    },
    isAlive() {
      return true; // Always alive for continuous orbit
    },
  };
}

type FireworksBackgroundProps = Omit<
  React.ComponentProps<"div">,
  "color"
> & {
  canvasProps?: React.ComponentProps<"canvas">;
  population?: number;
  color?: string | string[];
  fireworkSpeed?:
    | { min: number; max: number }
    | number;
  fireworkSize?:
    | { min: number; max: number }
    | number;
  particleSpeed?:
    | { min: number; max: number }
    | number;
  particleSize?:
    | { min: number; max: number }
    | number;
};

function FireworksBackground({
  ref,
  className,
  canvasProps,
  population = 1,
  color,
  fireworkSpeed = { min: 4, max: 8 },
  fireworkSize = { min: 2, max: 5 },
  particleSpeed = { min: 2, max: 7 },
  particleSize = { min: 1, max: 5 },
  ...props
}: FireworksBackgroundProps) {
  const canvasRef =
    React.useRef<HTMLCanvasElement>(
      null
    );
  const containerRef =
    React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(
    ref,
    () =>
      containerRef.current as HTMLDivElement
  );

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const container =
      containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let maxX = window.innerWidth;
    let ratio =
      container.offsetHeight /
      container.offsetWidth;
    let maxY = maxX * ratio;
    canvas.width = maxX;
    canvas.height = maxY;

    // Track if "AN" explosion has occurred
    let anExploded = false;
    let anPositions: {
      x: number;
      y: number;
    }[] = [];

    const setCanvasSize = () => {
      maxX = window.innerWidth;
      ratio =
        container.offsetHeight /
        container.offsetWidth;
      maxY = maxX * ratio;
      canvas.width = maxX;
      canvas.height = maxY;
    };
    window.addEventListener(
      "resize",
      setCanvasSize
    );

    const explosions: ParticleType[] =
      [];
    const fireworks: FireworkType[] =
      [];

    const handleExplosion = (
      particles: ParticleType[]
    ) => {
      explosions.push(...particles);
    };

    const launchFirework = () => {
      // Stop launching fireworks when AN effect starts
      if (anExploded) {
        return;
      }

      const x = rand(
        maxX * 0.1,
        maxX * 0.9
      );
      const y = maxY;
      const targetY = rand(
        maxY * 0.1,
        maxY * 0.4
      );
      const fireworkColor =
        getColor(color);
      const speed = getValueByRange(
        fireworkSpeed
      );
      const size = getValueByRange(
        fireworkSize
      );
      fireworks.push(
        createFirework(
          x,
          y,
          targetY,
          fireworkColor,
          speed,
          size,
          particleSpeed,
          particleSize,
          handleExplosion
        )
      );
      const timeout =
        rand(300, 800) / population;
      setTimeout(
        launchFirework,
        timeout
      );
    };

    launchFirework();

    // --- Schedule "AN" explosion at 8s with smooth scaling effect ---
    let anScale = 0.2; // Start small
    let anScaleTarget = 1;
    let anScaleStartTime = 0;
    let anAnimating = false;
    let lastANParticlesTime = 0;
    let lastANScale = 0;

    // Large heart outline effect with AN in center
    let heartOutlineParticles: ParticleType[] =
      [];
    let largeHeartEffect = false;
    let heartEffectStartTime = 0;

    // Cache AN positions for each scale to avoid redundant canvas work
    const anPositionsCache: Record<
      string,
      { x: number; y: number }[]
    > = {};

    // Instead of constantly adding new particles, keep a persistent set and just update/draw them
    let anParticles: ParticleType[] =
      [];
    let anCurrentScale = 0.2;

    function getCachedANPositions(
      scale: number
    ) {
      const key = scale.toFixed(3);
      if (anPositionsCache[key])
        return anPositionsCache[key];
      const textW = Math.floor(
        maxX * 1.5 * scale
      );
      const textH = Math.floor(
        maxY * 1.0 * scale
      );
      const positions =
        getTextShapePositions(
          AN_TEXT,
          AN_FONT,
          textW,
          textH,
          AN_PARTICLE_COUNT
        );
      // Center offset
      const offsetX =
        (maxX - textW) / 2;
      const offsetY =
        (maxY - textH) / 2;
      const offsetPositions =
        positions.map((pos) => ({
          x: pos.x + offsetX,
          y: pos.y + offsetY,
        }));
      anPositionsCache[key] =
        offsetPositions;
      return offsetPositions;
    }

    function createPersistentANParticles(
      scale = 1
    ) {
      const positions =
        getCachedANPositions(scale);
      // Only create new particles if not already present or scale changed
      anParticles = positions.map(
        (pos) =>
          createLetterParticle(
            pos.x,
            pos.y,
            "#ff8fcf",
            AN_PARTICLE_SIZE * scale
          )
      );
      anCurrentScale = scale;
    }

    function createLargeHeartOutlineEffect() {
      const centerX = maxX / 2;
      const centerY = maxY / 2;
      const heartScale = 18; // Increased scale by 50% (from 12 to 18) for much larger heart
      const startTime =
        performance.now(); // Get start time for fade-in

      heartOutlineParticles = [];

      // Create more particles along the heart outline for denser effect
      for (let i = 0; i < 300; i++) {
        // Increased from 200 to 300 for even denser outline with larger heart
        const t =
          (Math.PI * 2 * i) / 300;
        const heartX =
          16 * Math.pow(Math.sin(t), 3);
        const heartY =
          13 * Math.cos(t) -
          5 * Math.cos(2 * t) -
          2 * Math.cos(3 * t) -
          Math.cos(4 * t);

        const x =
          centerX + heartX * heartScale;
        const y =
          centerY - heartY * heartScale; // Negative to orient heart upright

        heartOutlineParticles.push(
          createHeartOutlineParticle(
            x,
            y,
            t,
            heartScale,
            startTime // Pass start time for synchronized fade-in
          )
        );
      }

      largeHeartEffect = true;
      heartEffectStartTime = startTime;
    }

    setTimeout(() => {
      anExploded = true;
      anScale = 0.2;
      anScaleTarget = 1;
      anScaleStartTime =
        performance.now();
      anAnimating = true;
      createPersistentANParticles(
        anScale
      );
      // Start large heart effect at the same time as AN animation
      createLargeHeartOutlineEffect();
    }, 8000);

    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, maxX, maxY);

      // Remove dead fireworks in-place
      for (
        let i = fireworks.length - 1;
        i >= 0;
        i--
      ) {
        const firework = fireworks[i];
        if (!firework?.update()) {
          fireworks.splice(i, 1);
        } else {
          firework.draw(ctx);
        }
      }

      // Animate AN scaling
      if (anExploded) {
        if (anAnimating) {
          const elapsed =
            (performance.now() -
              anScaleStartTime) /
            1000;
          if (elapsed < 5) {
            anScale =
              0.2 +
              (anScaleTarget - 0.2) *
                (elapsed / 5);
          } else {
            anScale = anScaleTarget;
            anAnimating = false;
          }
        }
        // Only recreate AN particles if scale changed significantly
        if (
          Math.abs(
            anScale - anCurrentScale
          ) > 0.01
        ) {
          createPersistentANParticles(
            anScale
          );
        } // Draw large heart outline effect
        if (largeHeartEffect) {
          // Only draw heart outline particles, no stroke outline
          for (const particle of heartOutlineParticles) {
            particle.update();
            particle.draw(ctx);
          }
        }

        // Update/draw persistent AN particles (stable, no decay)
        for (
          let i = 0;
          i < anParticles.length;
          i++
        ) {
          anParticles[i].update();
          anParticles[i].draw(ctx);
        }
      }

      // Remove dead explosions in-place
      for (
        let i = explosions.length - 1;
        i >= 0;
        i--
      ) {
        const particle = explosions[i];
        particle?.update();
        if (particle?.isAlive()) {
          particle.draw(ctx);
        } else {
          explosions.splice(i, 1);
        }
      }

      animationFrameId =
        requestAnimationFrame(animate);
    };

    animate();

    const handleClick = (
      event: MouseEvent
    ) => {
      const x = event.clientX;
      const y = maxY;
      const targetY = event.clientY;
      const fireworkColor =
        getColor(color);
      const speed = getValueByRange(
        fireworkSpeed
      );
      const size = getValueByRange(
        fireworkSize
      );
      fireworks.push(
        createFirework(
          x,
          y,
          targetY,
          fireworkColor,
          speed,
          size,
          particleSpeed,
          particleSize,
          handleExplosion
        )
      );
    };

    container.addEventListener(
      "click",
      handleClick
    );

    return () => {
      window.removeEventListener(
        "resize",
        setCanvasSize
      );
      container.removeEventListener(
        "click",
        handleClick
      );
      cancelAnimationFrame(
        animationFrameId
      );
    };
  }, [
    population,
    color,
    fireworkSpeed,
    fireworkSize,
    particleSpeed,
    particleSize,
  ]);

  return (
    <div
      ref={containerRef}
      data-slot="fireworks-background"
      className={cn(
        "relative size-full overflow-hidden",
        className
      )}
      {...props}
    >
      <canvas
        {...canvasProps}
        ref={canvasRef}
        className={cn(
          "absolute inset-0 size-full",
          canvasProps?.className
        )}
      />
    </div>
  );
}

export {
  FireworksBackground,
  type FireworksBackgroundProps,
};
