<template>
  <div class="viewer">
    <h1>This is the viewer page</h1>
  </div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default {
  name: "Viewer",
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
      doc: {}
    };
  },
  beforeMount() {
    this.initRhino3dm();
  },
  methods: {
    initRhino3dm() {
      // set rhino compute url and api key
      window.rhino3dm().then(rhino => {
        this.rhino_compute = window.RhinoCompute;
        this.rhino = rhino;
        this.rhino_compute.url = "http://localhost:8081/";
        this.rhino_compute.authToken = this.rhino_compute.getAuthToken();
        // this.rhino_compute.authToken =
        //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwIjoiUEtDUyM3IiwiYyI6IkFFU18yNTZfQ0JDIiwiYjY0aXYiOiJqMGEzdmVLNFhPeGZhSmw3RGFjeTR3PT0iLCJiNjRjdCI6IjcyVGRIL2NsaWZIWnVEQk9OSUsrNTc5enUzMERhdTRpZzRBYzBBYmord0M2YnM5SmtqVVhicnRtMHRYN3ByUWk2eDJvdUFxb0JiVkhsSE84MWZtL3k3Z2dQd2R0U21wTHgxT295cEo0Q3N5RlhTbS9PbFhwbXRZaEg2dW5rUndwUUhoM0l2cjhJME1tOVdWQkFQTzlLcC94UndoZ1Uxbzg4VkNYZitOcThnNlBhekV4K25va3QrT1dUbGJMU3NubSt0WVg1OHJ6dWhaSFo0U0QxeUsxVkE9PSIsImlhdCI6MTYzNDE2NDAxMH0.G3AeLj3Gk_k-dgbqotcpTA9-HYuKXjvszGI4G-nhORM";

        if (this.rhino_compute.authToken) {
          // // initiate threejs
          this.init();
          // // initiate rhino compute
          this.compute();
        }
      });
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
      let sphere = new this.rhino.Sphere([0, 0, 0], 4);
      window.RhinoCompute.Mesh.createFromSphere(sphere, 15, 15, false).then(
        result => {
          console.log(result);
          if (result !== undefined) {
            let mesh = this.rhino.CommonObject.decode(result);
            console.log(mesh.vertices().count);
            let threemesh = this.meshToThreejs(
              mesh,
              new THREE.MeshNormalMaterial({ wireframe: true })
            );
            this.scene.add(threemesh);
          }
        }
      );
    }
  }
};
</script>

<style></style>
