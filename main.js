import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let scene, camera, renderer, bokModel, clock;

function init3D() {
 const container = document.getElementById('three-container');

 scene = new THREE.Scene();
 clock = new THREE.Clock();

 camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 10000);
 camera.position.set(0,0,400);

 renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
 renderer.setPixelRatio(window.devicePixelRatio);
 renderer.setSize(window.innerWidth, window.innerHeight);
 container.appendChild(renderer.domElement);

 scene.add(new THREE.AmbientLight(0xffffff,3));

 const light = new THREE.DirectionalLight(0xffffff,2);
 light.position.set(100,100,200);
 scene.add(light);

 const loader = new GLTFLoader();
 loader.load('images/bok3.gltf',(gltf)=>{
  bokModel = gltf.scene;
  bokModel.scale.set(1300,1300,1300);
  scene.add(bokModel);
  animate();
 }, undefined, (error)=>{
  console.error('bok3.gltf load failed:', error);
 });

 window.addEventListener('resize', onResize);
}

function animate(){
 requestAnimationFrame(animate);

 if(bokModel){
  const t = clock.getElapsedTime();
  const bounce = Math.abs(Math.sin(t*2.8));
  const squash = Math.pow(1 - bounce, 2);

  bokModel.position.y = bounce * 42 - 12;
  bokModel.rotation.y = Math.sin(t*2.2)*0.32;
  bokModel.rotation.z = Math.sin(t*3.4)*0.08;
  bokModel.scale.set(
   1300 + squash * 90,
   1300 - squash * 120,
   1300 + squash * 90
  );
 }

 renderer.render(scene,camera);
}

function onResize(){
 camera.aspect = window.innerWidth/window.innerHeight;
 camera.updateProjectionMatrix();
 renderer.setSize(window.innerWidth, window.innerHeight);
}

window.goDetail = (id)=>{
 document.body.style.opacity = 0.5;
 setTimeout(()=>{
  location.href=`detail.html?book=${id}`;
 },150);
};

window.showSection = (id)=>{
 document.querySelectorAll('.content-section').forEach(s=>s.classList.remove('active'));
 document.getElementById(id).classList.add('active');
 document.getElementById('fabContainer').classList.remove('active');
};

document.addEventListener('DOMContentLoaded',()=>{
 const fab = document.getElementById('fabMain');
 const cont = document.getElementById('fabContainer');

 fab.onclick=(e)=>{
  e.stopPropagation();
  cont.classList.toggle('active');
 };

 document.body.onclick=()=>cont.classList.remove('active');
});

window.onload = init3D;
