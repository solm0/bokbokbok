import { useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { useI18n } from "../lib/i18n";

const MD_BREAKPOINT = 768;
const XL_BREAKPOINT = 1280;
const XL_MAX_MODEL_WIDTH = 640;
const MODEL_SCALE_RATIO = 0.42;
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

function getTargetModelWidth(viewportWidth) {
  if (viewportWidth >= XL_BREAKPOINT) {
    return Math.min(viewportWidth * 0.5, XL_MAX_MODEL_WIDTH);
  }

  if (viewportWidth >= MD_BREAKPOINT) {
    return viewportWidth * 0.5;
  }

  return viewportWidth * 0.8;
}

export default function HomePage() {
  const containerRef = useRef(null);
  const miceRef = useRef(createMouseConfigs());
  const mouseElementsRef = useRef([]);
  const { toggleNav } = useOutletContext();
  const { t } = useI18n();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    let animationFrame = 0;
    let renderer = null;
    let mounted = true;
    let cleanupResize = () => {};

    async function loadScene() {
      const THREE = await import("three");
      const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");

      if (!mounted) {
        return;
      }

      const scene = new THREE.Scene();
      const clock = new THREE.Clock();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
      );
      camera.position.set(0, 0, 400);

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xffffff, 3));
      const light = new THREE.DirectionalLight(0xffffff, 20);
      light.position.set(100, 100, 200);
      scene.add(light);

      let bokModel = null;
      let baseModelScale = 1;
      let baseModelWidth = 1;
      const loader = new GLTFLoader();

      const fitModelToViewport = () => {
        if (!bokModel || !baseModelWidth) {
          return;
        }

        baseModelScale = (getTargetModelWidth(window.innerWidth) / baseModelWidth) * MODEL_SCALE_RATIO;
        bokModel.scale.set(baseModelScale, baseModelScale, baseModelScale);
      };

      loader.load(
        "/images/bok3.gltf",
        (gltf) => {
          bokModel = gltf.scene;
          const box = new THREE.Box3().setFromObject(bokModel);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          bokModel.position.sub(center);
          baseModelWidth = size.x || 1;
          fitModelToViewport();
          scene.add(bokModel);
        },
        undefined,
        (error) => {
          console.error("bok3.gltf load failed:", error);
        }
      );

      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        fitModelToViewport();
      };

      cleanupResize = () => window.removeEventListener("resize", onResize);
      window.addEventListener("resize", onResize);

      const animate = () => {
        animationFrame = window.requestAnimationFrame(animate);

        if (bokModel) {
          const t = clock.getElapsedTime();
          const bounce = Math.abs(Math.sin(t * 2.8));
          const squash = Math.pow(1 - bounce, 2);

          bokModel.position.y = bounce * 22;
          bokModel.rotation.y = Math.sin(t * 2.2) * 0.32;
          bokModel.rotation.z = Math.sin(t * 3.4) * 0.08;
          bokModel.scale.set(
            baseModelScale + squash * baseModelScale * 0.07,
            baseModelScale - squash * baseModelScale * 0.09,
            baseModelScale + squash * baseModelScale * 0.07
          );
        }

        renderer.render(scene, camera);
      };

      animate();
    }

    loadScene();

    return () => {
      mounted = false;
      window.cancelAnimationFrame(animationFrame);
      cleanupResize();
      renderer?.dispose();
      container.innerHTML = "";
    };
  }, []);

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
        const isHorizontal = step === "right";
        const duration = isHorizontal
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
          if (cancelled) {
            return;
          }

          runMouseLoop(element, config, cycleIndex + 1);
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
    <div className="relative min-h-screen overflow-visible">
      <div
        id="three-container"
        ref={containerRef}
        className="fixed inset-0 z-10 cursor-pointer border-0 bg-transparent p-0 outline-none"
        role="button"
        tabIndex={0}
        aria-label={t("home.toggleMenu")}
        onClick={toggleNav}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleNav();
          }
        }}
      />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 h-36 overflow-visible">
        {miceRef.current.map((mouse, index) => (
          <img
            key={mouse.id}
            ref={(element) => {
              mouseElementsRef.current[index] = element;
            }}
            src={`/images/mouse${mouse.id}.png`}
            alt=""
            aria-hidden="true"
            className="home-mouse"
            style={{
              "--mouse-bottom": mouse.bottom,
              "--mouse-scale": mouse.scale,
            }}
          />
        ))}
      </div>
    </div>
  );
}
