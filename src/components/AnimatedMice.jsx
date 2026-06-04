import { useEffect, useRef } from "react";

const MOUSE_IMAGE_COUNT = 3;
const MOUSE_IDLE_MS = 1000;
const MOUSE_HORIZONTAL_DURATION_RANGE = [2100, 3000];
const MOUSE_VERTICAL_DURATION_RANGE = [700, 1100];
const MOUSE_VERTICAL_DISTANCE_RANGE = [26, 44];

const MOUSE_PATTERNS = [
  ["right", "up", "down", "right"],
  ["right", "down", "up", "right"],
  ["up", "right", "down", "right"],
  ["down", "right", "up", "right"],
  ["right", "up", "right", "down"],
  ["right", "down", "right", "up"],
];

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function randomIntBetween(min, max) {
  return Math.round(randomBetween(min, max));
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function createMouseConfigs() {
  return Array.from({ length: MOUSE_IMAGE_COUNT }, (_, index) => ({
    id: index + 1,
    delayMs: randomIntBetween(120, 900) + index * 180,
    bottom: `${index * 6}px`,
    scale: Number((1 - index * 0.04).toFixed(2)),
  }));
}

export default function AnimatedMice({
  className = "",
  imageConfigs,
  imageClassName = "home-mouse",
}) {
  const miceRef = useRef(imageConfigs ?? createMouseConfigs());
  const mouseElementsRef = useRef([]);

  useEffect(() => {
    const activeAnimations = [];
    const activeTimers = [];
    let cancelled = false;

    const clearScheduledWork = () => {
      activeAnimations.splice(0).forEach((animation) => animation.cancel());
      activeTimers.splice(0).forEach((timer) => window.clearTimeout(timer));
    };

    const scheduleTimer = (callback, delay) => {
      const timer = window.setTimeout(() => {
        const timerIndex = activeTimers.indexOf(timer);
        if (timerIndex >= 0) {
          activeTimers.splice(timerIndex, 1);
        }

        callback();
      }, delay);

      activeTimers.push(timer);
    };

    const registerAnimation = (animation) => {
      activeAnimations.push(animation);

      const release = () => {
        const animationIndex = activeAnimations.indexOf(animation);
        if (animationIndex >= 0) {
          activeAnimations.splice(animationIndex, 1);
        }
      };

      animation.addEventListener("finish", release, { once: true });
      animation.addEventListener("cancel", release, { once: true });
      return animation;
    };

    const runMouseLoop = (element, config, cycleIndex = 0) => {
      if (cancelled || !element) {
        return;
      }

      const viewportWidth = window.innerWidth;
      const startX = -140;
      const endX = viewportWidth + 140;
      const travelDistance = endX - startX;
      const firstHorizontalShare = randomBetween(0.28, 0.42);
      const secondHorizontalShare = randomBetween(0.68, 0.82);
      const firstHorizontalX = startX + travelDistance * firstHorizontalShare;
      const secondHorizontalX = startX + travelDistance * secondHorizontalShare;
      const verticalDistance = randomBetween(
        MOUSE_VERTICAL_DISTANCE_RANGE[0],
        MOUSE_VERTICAL_DISTANCE_RANGE[1]
      );
      const pattern = randomItem(MOUSE_PATTERNS);
      const horizontalTargets = [firstHorizontalX, secondHorizontalX];
      let horizontalIndex = 0;
      let currentX = startX + cycleIndex * 18;
      let currentY = 0;

      const keyframes = [
        {
          opacity: 0,
          transform: `translate3d(${currentX}px, ${currentY}px, 0) scale(${config.scale})`,
          offset: 0,
        },
        {
          opacity: 1,
          transform: `translate3d(${currentX}px, ${currentY}px, 0) scale(${config.scale})`,
          offset: 0.08,
        },
      ];

      let elapsed = 0;
      pattern.forEach((step) => {
        const duration = step === "right"
          ? randomIntBetween(
              MOUSE_HORIZONTAL_DURATION_RANGE[0],
              MOUSE_HORIZONTAL_DURATION_RANGE[1]
            )
          : randomIntBetween(MOUSE_VERTICAL_DURATION_RANGE[0], MOUSE_VERTICAL_DURATION_RANGE[1]);

        elapsed += duration;

        if (step === "right") {
          currentX = horizontalTargets[Math.min(horizontalIndex, horizontalTargets.length - 1)];
          horizontalIndex += 1;
        }

        if (step === "up") {
          currentY -= verticalDistance;
        }

        if (step === "down") {
          currentY += verticalDistance;
        }

        keyframes.push({
          opacity: 1,
          transform: `translate3d(${currentX}px, ${currentY}px, 0) scale(${config.scale})`,
          offset: 0.08 + (elapsed / (elapsed + MOUSE_IDLE_MS)) * 0.82,
        });
      });

      const finalHorizontalDuration = randomIntBetween(
        MOUSE_HORIZONTAL_DURATION_RANGE[0],
        MOUSE_HORIZONTAL_DURATION_RANGE[1]
      );
      const totalMotionDuration = elapsed + finalHorizontalDuration;

      keyframes.push({
        opacity: 1,
        transform: `translate3d(${endX}px, ${currentY}px, 0) scale(${config.scale})`,
        offset: 0.9,
      });
      keyframes.push({
        opacity: 0,
        transform: `translate3d(${endX}px, ${currentY}px, 0) scale(${config.scale})`,
        offset: 0.92,
      });
      keyframes.push({
        opacity: 0,
        transform: `translate3d(${startX}px, 0px, 0) scale(${config.scale})`,
        offset: 1,
      });

      const animation = registerAnimation(
        element.animate(keyframes, {
          duration: totalMotionDuration + MOUSE_IDLE_MS,
          delay: cycleIndex === 0 ? config.delayMs : 0,
          easing: "ease-in-out",
          fill: "forwards",
          iterations: 1,
        })
      );

      animation.addEventListener(
        "finish",
        () => {
          if (!cancelled) {
            runMouseLoop(element, config, cycleIndex + 1);
          }
        },
        { once: true }
      );
    };

    miceRef.current.forEach((config, index) => {
      const element = mouseElementsRef.current[index];
      if (element) {
        scheduleTimer(() => runMouseLoop(element, config), 0);
      }
    });

    return () => {
      cancelled = true;
      clearScheduledWork();
    };
  }, []);

  return (
    <div className={className}>
      {miceRef.current.map((mouse, index) => (
        <img
          key={mouse.id}
          ref={(element) => {
            mouseElementsRef.current[index] = element;
          }}
          src={mouse.src ?? `/images/mouse${mouse.id}.png`}
          alt=""
          aria-hidden="true"
          className={imageClassName}
          style={{
            "--mouse-bottom": mouse.bottom,
            "--mouse-scale": mouse.scale,
          }}
        />
      ))}
    </div>
  );
}
