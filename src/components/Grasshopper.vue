<template>
  <div class="container">
    <div v-if="!loaded" id="loader"></div>
    <div class="param px-6">
      <b-field label="Subdivision count">
        <b-slider
          :min="count_slider.min"
          :max="count_slider.max"
          :step="count_slider.step"
          v-model="count_slider.value"
          lazy
          ticks
          @change="onInputChanged"
        ></b-slider>
      </b-field>
    </div>
    <div class="param px-6">
      <b-field label="Roof type">
        <b-slider
          :min="roof_typology.min"
          :max="roof_typology.max"
          :step="roof_typology.step"
          v-model="roof_typology.value"
          lazy
          ticks
          @change="onInputChanged"
        ></b-slider>
      </b-field>
    </div>
    <div class="param px-6">
      <b-field label="Truss Width">
        <b-slider
          :min="truss_width.min"
          :max="truss_width.max"
          :step="truss_width.step"
          v-model="truss_width.value"
          lazy
          ticks
          @change="onInputChanged"
        ></b-slider>
      </b-field>
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
      roof_typology: {
        value: 0,
        min: 0,
        max: 3,
        step: 1
      },
      truss_width: {
        value: 8.0,
        min: 5.0,
        max: 20.0,
        step: 0.1
      },
      count_slider: {
        value: 5,
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
      const definitionName = "/grasshopper/Truss.gh";
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
      param1.append([0], [this.truss_width.value]);

      const param2 = new this.$RhinoCompute.Grasshopper.DataTree("Typology");
      param2.append([0], [this.roof_typology.value]);

      const param3 = new this.$RhinoCompute.Grasshopper.DataTree(
        "Subdivision Count"
      );
      param3.append([0], [this.count_slider.value]);

      // // clear values
      let trees = [];
      trees.push(param1);
      trees.push(param2);
      trees.push(param3);

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

      if (this.doc.objects().count < 1) {
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

        this.scene.traverse(child => {
          this.scene.remove(child);
        });

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

    onInputChanged() {
      this.showSpinner(true);
      this.compute();
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
