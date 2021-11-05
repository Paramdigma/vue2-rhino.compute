<template>
  <div>
    <div v-if="!loaded" id="loader"></div>

    <!-- <div>
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
    </div> -->
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
export default {
  name: "Grasshopper",
  data() {
    return {
      loaded: false,
      scene: null,
      camera: null,
      renderer: null,
      controls: null,
      doc: undefined,
      definition: null,
      radius_slider: {
        value: 3.0,
        min: 0,
        max: 10.0,
        step: 0.1
      },
      length_slider: {
        value: 8.0,
        min: 5.0,
        max: 20.0,
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
      const definitionName = "/grasshopper/FlatTruss.gh";
      let url = definitionName;
      let res = await fetch(url);
      console.log("res:0", res);
      let buffer = await res.arrayBuffer();
      this.definition = new Uint8Array(buffer);
      console.log("buffer: ", buffer, "definition: ", this.definition);
    },

    async compute() {
      console.log("in compute");
      const crvPoints = new this.$rhino.Point3dList();
      crvPoints.add(0, 0, 0);
      crvPoints.add(10, 10, 0);
      crvPoints.add(20, -10, 0);
      crvPoints.add(30, 10, 20);
      crvPoints.add(40, -10, -20);
      crvPoints.add(50, 0, 0);
      const nCrv = this.$rhino.NurbsCurve.create(false, 3, crvPoints);
      var crvData = JSON.stringify(nCrv.encode());
      this.crvData = crvData;
      const param1 = new this.$RhinoCompute.Grasshopper.DataTree("Length");
      param1.append([0], [this.length_slider.value]);
      console.log("params:", param1);
      // clear values
      let trees = [];
      trees.push(param1);
      // Call RhinoCompute
      const res = await this.$RhinoCompute.Grasshopper.evaluateDefinition(
        this.definition,
        trees
      );
      console.log("grasshopper res:", res);
      this.collectResults(res);
    },
    collectResults(responseJson) {
      const values = responseJson.values;
      // clear doc
      if (this.doc !== undefined) this.doc.delete();
      //console.log(values)
      this.doc = new this.$rhino.File3dm();
      // for each output (RH_OUT:*)...
      for (let i = 0; i < values.length; i++) {
        // ...iterate through data tree structure...
        for (const path in values[i].InnerTree) {
          const branch = values[i].InnerTree[path];
          // ...and for each branch...
          for (let j = 0; j < branch.length; j++) {
            // ...load rhino geometry into doc
            const rhinoObject = this.decodeItem(branch[j]);
            if (rhinoObject !== null) {
              this.doc.objects().add(rhinoObject, null);
            }
          }
        }
      }
      console.log("doc: ", this.doc);
      if (this.doc.objects().count < 1) {
        console.error("No rhino objects to load!");
        this.showSpinner(false);
        return;
      }
      // set up loader for converting the results to threejs
      const loader = new this.$Rhino3dmLoader();
      loader.setLibraryPath(
        "https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/"
      );
      const resMaterial = new this.$THREE.MeshBasicMaterial({
        vertexColors: true,
        wireframe: true
      });
      // load rhino doc into three.js scene
      const buffer = new Uint8Array(this.doc.toByteArray()).buffer;
      loader.parse(buffer, object => {
        // add material to resulting meshes
        object.traverse(child => {
          child.material = resMaterial;
        });
        // add object graph from rhino model to three.js scene
        this.scene.add(object);
        // hide spinner
        this.showSpinner(false);
      });
    },
    decodeItem(item) {
      const data = JSON.parse(item.data);
      if (item.type === "System.String") {
        // hack for draco meshes
        try {
          return this.$rhino.DracoCompression.decompressBase64String(data);
        } catch {
          alert("error decompressing data");
        } // ignore errors (maybe the string was just a string...)
      } else if (typeof data === "object") {
        return this.$rhino.CommonObject.decode(data);
      }
      return null;
    },
    async onInputChanged() {
      this.showSpinner(true);
      await this.compute();
    },
    showSpinner(enable) {
      if (enable) {
        this.loaded = false;
      } else this.loaded = true;
    }
  }
};
</script>

<style lang="scss">
#loader {
  border: 5px solid #f3f3f3; /* Light grey */
  border-top: 5px solid #3d3d3d; /* Grey */
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 2;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
