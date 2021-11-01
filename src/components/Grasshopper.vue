<template>
  <div></div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default {
  name: "Grasshopper",
  data() {
    return {
      rhino: {},
      rhino_compute: {},
      scene: {},
      camera: {},
      renderer: {},
      controls: {},
      definition: {},
      grasshopper_file: "grasshopper/worm.gh",
      doc: {},
    };
  },
  beforeMount() {
    this.initRhino3dm();
  },
  methods: {
    initRhino3dm() {
      // set rhino compute url and api key
    },
    init() {
      // Rhino models are z-up, so set this as the default
      THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1);

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(1, 1, 1);
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      this.camera = camera;
      this.camera.position.x = 100;
      this.camera.position.y = 50;
      this.camera.position.z = 25;

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer = renderer;
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(this.renderer.domElement);
      // add some controls to orbit the camera
      const controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls = controls;
      window.addEventListener("resize", this.onWindowResize, false);

      console.log("renderer", this.renderer);
      this.animate();
    },
    animate() {
      requestAnimationFrame(this.animate);
      this.renderer.render(this.scene, this.camera);
    },

    onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.animate();
    },

    meshToThreejs(mesh, material) {
      let loader = new THREE.BufferGeometryLoader();
      var geometry = loader.parse(mesh.toThreejsJSON());
      return new THREE.Mesh(geometry, material);
    },

    compute() {
      console.log("in compute");
    },
  },
};
</script>

<style></style>
