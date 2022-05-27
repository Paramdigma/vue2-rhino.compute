<template>
  <div class="container" id="viewer">
    <loader :loaded="loaded"></loader>
    <h1>This is the viewer page</h1>
    <div
      v-for="(parameter, index) in parameters"
      :key="index"
      class="param px-6"
    >
      <b-field :label="parameter.name">
        <b-slider
          :min="parameter.min"
          :max="parameter.max"
          :step="parameter.step"
          v-model="parameter.value"
          lazy
          ticks
          @change="paramChanged"
        ></b-slider>
      </b-field>
    </div>
    <div ref="canvas"></div>
  </div>
</template>

<script>
import ThreeViewer from "@/classes/ThreeViewer.js";
import RhinoService from "@/modules/RhinoService.js";
import GrasshopperParameter from "@/modules/GrasshopperParameter.js";
import Loader from "@/components/Loader.vue";

export default {
  name: "Viewer",
  data() {
    return {
      loaded: false,
      rhinoService: null,
      trees: [],
      viewer: null,
      rhino3dmLoader: null,
      definition: null,
      doc: null,
      parameters: [
        {
          name: "Width",
          value: 15,
          min: 2,
          max: 30,
          step: 0.1,
        },
        { name: "Typology", value: 2, min: 0, max: 3, step: 1 },
        { name: "Subdivision Count", value: 5, min: 1, max: 20, step: 1 },
      ],
      url: "/grasshopper/Truss.gh",
    };
  },
  components: { Loader },
  watch: {},
  beforeMount() {
    this.initRhinoServices();
  },
  async mounted() {
    if (this.$refs.canvas) {
      this.initViewer();
      await this.loadGrasshopperModel(this.url);
    }
  },
  methods: {
    initRhinoServices() {
      this.rhinoService = new RhinoService();
      this.rhinoService.init();
    },

    initViewer() {
      var container = this.$refs.canvas;
      // console.log("container :", container);
      this.viewer = new ThreeViewer(container);
      this.viewer.init();
      this.rhino3dmLoader = this.viewer.rhino3dmLoader();
    },

    async loadGrasshopperModel(url) {
      this.definition = await this.rhinoService.loadGrasshopperFileLocally(url);
      this.computeParametersTrees(this.definition);
    },

    computeParametersTrees() {
      // console.log("computing params");
      for (let i = 0; i < this.parameters.length; i++) {
        const tempParam = this.parameters[i];

        var grasshopperParameter = new GrasshopperParameter(
          tempParam.name,
          tempParam.value
        );
        var param = grasshopperParameter.GetParameter();
        // console.log("param", param);
        this.trees.push(param);
      }
      this.rhinoCompute();
    },

    async rhinoCompute() {
      const res = await this.rhinoService.computeGrasshopperDefinition(
        this.definition,
        this.trees
      );
      // console.log(res);
      var doc = this.rhinoService.collectResults(res);

      const resMaterial = new this.viewer.THREE.MeshNormalMaterial();
      console.log(doc);
      // load rhino doc into three.js scene
      const buffer = new Uint8Array(doc.toByteArray()).buffer;
      console.log(buffer);
      this.rhino3dmLoader.parse(buffer, (object) => {
        // add material to resulting meshes
        object.traverse((child) => {
          child.material = resMaterial;
        });

        this.viewer.Scene.traverse((child) => {
          this.viewer.Scene.remove(child);
        });

        this.viewer.Scene.add(object);

        // hide spinner
        this.activateSpinner(false);
      });
    },

    activateSpinner(enable) {
      if (enable) {
        this.loaded = false;
      } else this.loaded = true;
    },
    paramChanged() {
      this.activateSpinner(true);
      this.computeParametersTrees();
    },
  },
};
</script>

<style></style>
