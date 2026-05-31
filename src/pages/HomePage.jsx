import { useEffect, useRef } from "react";

const MD_BREAKPOINT = 768;
const XL_BREAKPOINT = 1280;
const XL_MAX_MODEL_WIDTH = 640;
const MODEL_SCALE_RATIO = 0.7;

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
      const light = new THREE.DirectionalLight(0xffffff, 2);
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
        "/images/bokno3.gltf",
        (gltf) => {
          bokModel = gltf.scene;
          const box = new THREE.Box3().setFromObject(bokModel);
          const size = box.getSize(new THREE.Vector3());

          baseModelWidth = size.x || 1;
          fitModelToViewport();
          scene.add(bokModel);
        },
        undefined,
        (error) => {
          console.error("bokno3.gltf load failed:", error);
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

          bokModel.position.y = bounce * 42 - 12;
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

  return (
    <div className="home-page">
      <div id="three-container" ref={containerRef} />

      <section className="home-copy">
        <p className="home-kicker">Seoul-based zine store</p>
        <h1>BOK³</h1>
        <p>
          A scattered shelf of independent zines, tactile browsing, and quiet printed things.
        </p>
      </section>
    </div>
  );
}
