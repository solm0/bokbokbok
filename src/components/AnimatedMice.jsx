import { useEffect, useRef } from "react";

const MOUSE_IMAGE_COUNT = 3;
const MOUSE_SPEED_RANGE = [28, 92];
const MOUSE_PAUSE_GAP_RANGE = [900, 2800];
const MOUSE_PAUSE_DURATION_RANGE = [500, 1600];

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function randomDirection() {
  return Math.random() < 0.5 ? -1 : 1;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function createMouseConfigs() {
  return Array.from({ length: MOUSE_IMAGE_COUNT }, (_, index) => ({
    id: index + 1,
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
  const mouseWrappersRef = useRef([]);
  const mouseImagesRef = useRef([]);

  useEffect(() => {
    let cancelled = false;
    let frameId = 0;
    let previousTime = performance.now();

    const states = miceRef.current.map(() => null);

    const updateMouseTransform = (wrapper, image, x, facing, scale) => {
      wrapper.style.opacity = "1";
      wrapper.style.transform = `translate3d(${x}px, 0, 0) scale(${scale})`;
      image.style.transform = `rotateY(${facing === 1 ? 0 : 180}deg)`;
    };

    const initializeState = (wrapper, image, config) => {
      const maxX = Math.max(window.innerWidth - wrapper.offsetWidth, 0);
      const direction = randomDirection();
      const state = {
        x: randomBetween(0, maxX),
        direction,
        facing: direction,
        speed: randomBetween(MOUSE_SPEED_RANGE[0], MOUSE_SPEED_RANGE[1]),
        pauseAt: performance.now() + randomBetween(MOUSE_PAUSE_GAP_RANGE[0], MOUSE_PAUSE_GAP_RANGE[1]),
        pausedUntil: 0,
      };

      updateMouseTransform(wrapper, image, state.x, state.facing, config.scale);
      return state;
    };

    const tick = (time) => {
      if (cancelled) {
        return;
      }

      const deltaSeconds = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;

      miceRef.current.forEach((config, index) => {
        const wrapper = mouseWrappersRef.current[index];
        const image = mouseImagesRef.current[index];
        if (!wrapper || !image) {
          return;
        }

        let state = states[index] ?? initializeState(wrapper, image, config);
        const maxX = Math.max(window.innerWidth - wrapper.offsetWidth, 0);

        if (state.pausedUntil > time) {
          updateMouseTransform(wrapper, image, state.x, state.facing, config.scale);
          states[index] = state;
          return;
        }

        if (state.pausedUntil !== 0 && state.pausedUntil <= time) {
          const direction = state.direction * -1;
          state = {
            ...state,
            direction,
            facing: direction,
            pausedUntil: 0,
            speed: randomBetween(MOUSE_SPEED_RANGE[0], MOUSE_SPEED_RANGE[1]),
            pauseAt: time + randomBetween(MOUSE_PAUSE_GAP_RANGE[0], MOUSE_PAUSE_GAP_RANGE[1]),
          };
        }

        if (state.pauseAt <= time) {
          state = {
            ...state,
            pausedUntil: time + randomBetween(MOUSE_PAUSE_DURATION_RANGE[0], MOUSE_PAUSE_DURATION_RANGE[1]),
          };
          updateMouseTransform(wrapper, image, state.x, state.facing, config.scale);
          states[index] = state;
          return;
        }

        let nextX = state.x + state.direction * state.speed * deltaSeconds;
        let nextDirection = state.direction;
        let nextFacing = state.facing;

        if (nextX <= 0) {
          nextX = 0;
          nextDirection = 1;
          nextFacing = 1;
        } else if (nextX >= maxX) {
          nextX = maxX;
          nextDirection = -1;
          nextFacing = -1;
        }

        state = {
          ...state,
          x: clamp(nextX, 0, maxX),
          direction: nextDirection,
          facing: nextFacing,
        };

        updateMouseTransform(wrapper, image, state.x, state.facing, config.scale);
        states[index] = state;
      });

      frameId = window.requestAnimationFrame(tick);
    };

    const handleResize = () => {
      miceRef.current.forEach((config, index) => {
        const wrapper = mouseWrappersRef.current[index];
        const image = mouseImagesRef.current[index];
        const state = states[index];
        if (!wrapper || !image || !state) {
          return;
        }

        const maxX = Math.max(window.innerWidth - wrapper.offsetWidth, 0);
        state.x = clamp(state.x, 0, maxX);
        updateMouseTransform(wrapper, image, state.x, state.facing, config.scale);
      });
    };

    window.addEventListener("resize", handleResize);
    frameId = window.requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className={className}>
      {miceRef.current.map((mouse, index) => (
        <div
          key={mouse.id}
          ref={(element) => {
            mouseWrappersRef.current[index] = element;
          }}
          className={imageClassName}
          style={{
            "--mouse-bottom": mouse.bottom,
            "--mouse-scale": mouse.scale,
          }}
        >
          <img
            ref={(element) => {
              mouseImagesRef.current[index] = element;
            }}
            src={mouse.src ?? `/images/mouse${mouse.id}.png`}
            alt=""
            aria-hidden="true"
            className="mouse-flip-image"
          />
        </div>
      ))}
    </div>
  );
}
