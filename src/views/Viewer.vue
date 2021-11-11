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
      viewer: null,
      definition: null,
      trees: [],
      parameters: [
        {
          name: "Typology",
          value: 0,
          min: 0,
          max: 3,
          step: 1
        },
        { name: "Length", value: 8.0, min: 5.0, max: 20.0, step: 0.1 },
        { name: "Count", value: 5, min: 1, max: 100, step: 1 }
      ]
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
      await this.loadGrasshopperModel();
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
    },
    async loadGrasshopperModel() {
      var definition = await this.rhinoService.loadGrasshopperFileLocally(
        "/grasshopper/Truss.gh"
      );
      this.computeParametersTrees(definition);
    },
    computeParametersTrees(definition) {
      console.log("computing params");
      for (let i = 0; i < this.parameters.length; i++) {
        const tempParam = this.parameters[i];

        var grasshopperParameter = new GrasshopperParameter(
          tempParam.name,
          tempParam.value
        );
        var param = grasshopperParameter.GetParameter();
        console.log("param", param);
        this.trees.push(param);
      }
      this.rhinoCompute(definition);
    },
    async rhinoCompute(definition) {
      const res = await this.rhinoService.computeGrasshopperDefinition(
        definition,
        this.trees
      );
      console.log(res);
      var results = this.rhinoService.collectResults(res);
      4;
      console.log(results.objects);
    }
  }
};
</script>

<style></style>
