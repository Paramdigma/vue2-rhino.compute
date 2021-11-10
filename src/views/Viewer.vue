<template>
  <div class="viewer">
    <h1>This is the viewer page</h1>
    <div ref="canvas"></div>
  </div>
</template>

<script>
import ThreeViewer from "@/classes/ThreeViewer.js";
import RhinoService from "@/modules/RhinoService.js";
import GrasshopperParameter from "@/modules/GrasshopperParameter.js";

export default {
  name: "Viewer",
  data() {
    return {
      rhinoService: null,
      viewer: null,
      definition: null,
      trees: [],
      loaded: 0,
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
  watch: {
    isParametric: function (newP) {
      if (newP == true) {
        this.switchTitle = "Rhino";
      } else if (newP == false) {
        this.switchTitle = "Grasshopper";
      }
    },
    loaded: function (newLoad, oldLoad) {
      if (newLoad > oldLoad) {
        console.log("watching definition change");
        // this.computeParamsTree();
        // this.rhinoCompute(newDef);
      }
    }
  },
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
      this.loaded++;
      // console.log("loading grasshopper model");
      var definition = await this.rhinoService.loadGrasshopperFileLocally(
        "/grasshopper/Truss.gh"
      );
      this.computeParametersTrees(definition);
    },
    computeParametersTrees() {
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
      // var grasshopperParameterB = new GrasshopperParameter("Typology", 0);
      // var paramB = grasshopperParameterB.GetParameter();

      // var grasshopperParameterC = new GrasshopperParameter(
      //   "Subdivision Count",
      //   10
      // );
      // var paramC = grasshopperParameterC.GetParameter();
      // this.trees.push(paramB);
      // this.trees.push(paramC);

      // this.rhinoCompute(definition);
    },
    // eslint-disable-next-line
    async rhinoCompute(definition) {
      const res = await this.rhinoService.computeGrasshopperDefinition(
        definition,
        this.trees
      );
      console.log(res);
    }
  }
};
</script>

<style></style>
