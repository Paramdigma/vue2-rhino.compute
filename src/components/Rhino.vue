<template>
  <div ref="canvas"></div>
</template>

<script>
export default {
  name: "Rhino",
  props: ["isRhino"],
  data() {
    return {
      scene: {},
      camera: {},
      renderer: {},
      controls: {},
    };
  },
  mounted() {
    if (this.$refs.canvas) {
      this.init();
      this.compute();
    }
  },
  methods: {
    init() {
      var container = this.$refs["canvas"];
      // Rhino models are z-up, so set this as the default
      this.$THREE.Object3D.DefaultUp = new this.$THREE.Vector3(0, 0, 1);

      this.scene = new this.$THREE.Scene();
      this.scene.background = new this.$THREE.Color(1, 1, 1);
      this.camera = new this.$THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        1000
      );

      this.camera.position.z = 10;

      const renderer = new this.$THREE.WebGLRenderer({ antialias: true });
      this.renderer = renderer;
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(this.renderer.domElement);
      // add some controls to orbit the camera
      const controls = new this.$OrbitControls(
        this.camera,
        this.renderer.domElement
      );
      this.controls = controls;
      window.addEventListener("resize", this.onWindowResize, false);

      console.log("renderer", this.renderer);
      this.animate();
    },
    animate() {
      requestAnimationFrame(this.animate);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    },

    onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.animate();
    },

    meshToThreejs(mesh, material) {
      let loader = new this.$THREE.BufferGeometryLoader();
      var geometry = loader.parse(mesh.toThreejsJSON());
      return new this.$THREE.Mesh(geometry, material);
    },

    compute() {
      console.log("in compute");
      let sphere = new this.$rhino.Sphere([0, 0, 0], 4);
      this.$RhinoCompute.Mesh.createFromSphere(sphere, 15, 15, false).then(
        (result) => {
          console.log(result);
          if (result !== undefined) {
            let mesh = this.$rhino.CommonObject.decode(result);
            console.log(mesh.vertices().count);
            let threemesh = this.meshToThreejs(
              mesh,
              new this.$THREE.MeshNormalMaterial({ wireframe: true })
            );
            this.scene.add(threemesh);
          }
        }
      );
    },
  },
};
</script>

<style></style>
