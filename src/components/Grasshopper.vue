<template>
  <div>
    <div>
      <input
        @input="onInputChanged"
        type="range"
        id="count"
        name="count"
        :min="count_slider.min"
        :max="count_slider.max"
        :step="count_slider.step"
        v-model="count_slider.value"
      />
      <label for="count">Count</label>
    </div>
    <div>
      <input
        @input="onInputChanged"
        type="range"
        id="radius"
        name="radius"
        :min="radius_slider.min"
        :max="radius_slider.max"
        v-model="radius_slider.value"
        :step="radius_slider.step"
      />
      <label for="radius">Radius</label>
    </div>
    <div>
      <input
        @input="onInputChanged"
        type="range"
        id="length"
        name="length"
        :min="length_slider.min"
        :max="length_slider.max"
        v-model="length_slider.value"
        :step="length_slider.step"
      />
      <label for="length">Length</label>
    </div>
    <div ref="canvas"></div>
  </div>
</template>

<script>
// import { Rhino3dmLoader } from "three/examples/jsm/loaders/3DMLoader.js";
export default {
  name: "Grasshopper",
  data() {
    return {
      scene: {},
      camera: {},
      renderer: {},
      controls: {},
      definition: null,
      doc: undefined,
      radius_slider: {
        value: 3.0,
        min: 0,
        max: 10.0,
        step: 0.1
      },
      length_slider: {
        value: 8.0,
        min: 0,
        max: 10.0,
        step: 0.1
      },
      count_slider: {
        value: 65,
        min: 1,
        max: 100,
        step: 1
      }
    };
  },
  async mounted() {
    if (this.$refs.canvas) {
      await this.loadGhFile();
      this.init();
      await this.compute();
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
        0.1,
        1000
      );

      this.camera.position.y = 50;

      this.renderer = new this.$THREE.WebGLRenderer({ antialias: true });
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

    async loadGhFile() {
      const definitionName = "grasshopper/BranchNodeRnd.gh";
      let url = definitionName;
      let res = await fetch(url);
      console.log("res:0", res);
      let buffer = await res.arrayBuffer();
      this.definition = new Uint8Array(buffer);
      console.log("buffer: ", buffer, "definition: ", this.definition);
    },

    async compute() {
      console.log("in compute");
      const param1 = new this.$RhinoCompute.Grasshopper.DataTree("Length");
      param1.append([0], [this.length_slider.value]);

      const param2 = new this.$RhinoCompute.Grasshopper.DataTree("Radius");
      param2.append([0], [this.radius_slider.value]);

      const param3 = new this.$RhinoCompute.Grasshopper.DataTree("Count");
      param3.append([0], [this.count_slider.value]);

      // clear values
      const trees = [];
      trees.push(param1);
      trees.push(param2);
      trees.push(param3);

      const res = await this.$RhinoCompute.Grasshopper.evaluateDefinition(
        this.definition,
        trees
      );

      console.log(res);

      // hide spinner

      const data = JSON.parse(res.values[0].InnerTree["{0}"][0].data);
      console.log("data json parsed:", data);
      const mesh = this.$rhino.DracoCompression.decompressBase64String(data);
      console.log("decompressd mesh:", mesh);

      const material = new this.$THREE.MeshNormalMaterial();
      const threeMesh = this.meshToThreejs(mesh, material);

      // // clear the scene
      this.scene.traverse(child => {
        if (child.isMesh) {
          this.scene.remove(child);
        }
      });
      this.scene.add(threeMesh);
    },
    async onInputChanged() {
      await this.compute();
    }
  }
};
</script>

<style></style>
