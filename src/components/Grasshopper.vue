<template>
  <div class="container">
    <loader :loaded="loaded"></loader>
    <!-- <div class="param px-6">
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
    </div> -->
    <div ref="canvas"></div>
  </div>
</template>

<script>
import ThreeViewer from "@/classes/ThreeViewer.js";
import RhinoService from "@/modules/RhinoService.js";
import { Rhino3dmLoader } from "three/examples/jsm/loaders/3DMLoader.js";
import Loader from "@/components/Loader.vue";

export default {
  name: "Grasshopper",
  data() {
    return {
      viewer: null,
      loaded: false,
      doc: undefined,
      definition: null,
      rhinoService: null,
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
  components: { Loader },
  beforeMount() {
    this.rhinoService = new RhinoService();
    this.rhinoService.init();
    // console.log(window.RhinoCompute, window.Rhino3dm);
  },
  async mounted() {
    if (this.$refs.canvas) {
      this.viewer = new ThreeViewer(this.$refs.canvas);
      this.viewer.init();
      await this.loadGhFile();
      await this.compute();
    }
  },
  methods: {
    async loadGhFile() {
      const definitionName = "/grasshopper/Truss.gh";
      this.definition = await this.rhinoService.loadGrasshopperFileLocally(
        definitionName
      );
    },

    async compute() {
      // console.log("in compute");

      const param1 = new window.RhinoCompute.Grasshopper.DataTree("Length");
      param1.append([0], [this.truss_width.value]);

      const param2 = new window.RhinoCompute.Grasshopper.DataTree("Typology");
      param2.append([0], [this.roof_typology.value]);

      const param3 = new window.RhinoCompute.Grasshopper.DataTree(
        "Subdivision Count"
      );
      param3.append([0], [this.count_slider.value]);

      // // clear values
      let trees = [];
      trees.push(param1);
      trees.push(param2);
      trees.push(param3);

      // Call RhinoCompute
      const res = await window.RhinoCompute.Grasshopper.evaluateDefinition(
        this.definition,
        trees
      );

      // console.log("grasshopper res:", res);
      this.collectResults(res);
    },

    collectResults(responseJson) {
      const values = responseJson.values;
      // clear doc
      if (this.doc !== undefined) this.doc.delete();

      this.doc = new window.Rhino3dm.File3dm();

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
      const loader = new Rhino3dmLoader();
      loader.setLibraryPath(
        "https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/"
      );

      const resMaterial = new this.viewer.THREE.MeshBasicMaterial({
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

        this.viewer.Scene.traverse(child => {
          if (child.isMesh) {
            this.viewer.Scene.remove(child);
          }
        });

        this.viewer.Scene.add(object);

        // hide spinner
        this.showSpinner(false);
      });
    },

    decodeItem(item) {
      const data = JSON.parse(item.data);
      if (item.type === "System.String") {
        // hack for draco meshes
        try {
          return window.Rhino3dm.DracoCompression.decompressBase64String(data);
        } catch {
          alert("error decompressing data");
        } // ignore errors (maybe the string was just a string...)
      } else if (typeof data === "object") {
        return window.Rhino3dm.CommonObject.decode(data);
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

<style lang="scss"></style>
