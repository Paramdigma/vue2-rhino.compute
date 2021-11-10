<template>
  <div class="viewer">
    <h1>This is the viewer page</h1>
    <button @click="computeParamsTree">params</button>
    <div ref="canvas"></div>
  </div>
</template>

<script>
// import Rhino from "@/components/Rhino.vue";
// import Grasshopper from "@/components/Grasshopper.vue";
import ThreeViewer from "@/classes/ThreeViewer.js";
import RhinoService from "@/modules/RhinoService.js";
// import GrasshopperParameter from "@/modules/GrasshopperParameter.js";

export default {
  name: "Viewer",
  data() {
    return {
      // isParametric: false,
      // switchTitle: "Grasshopper",
      viewer: null,
      definition: null,
      trees: [],
      loaded: 0
    };
  },
  components: {
    // Rhino,
    // Grasshopper
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
  async beforeMount() {
    await this.initRhinoServices();
  },
  async mounted() {
    if (this.$refs.canvas) {
      this.initViewer();
      await this.loadGrasshopperModel();
    }
  },
  methods: {
    async initRhinoServices() {
      var rhinoService = new RhinoService();
      await rhinoService.init();
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
      this.definition = await new RhinoService().loadGrasshopperFileLocally(
        "/grasshopper/Truss.gh"
      );
    },
    computeParamsTree() {
      console.log("computing params");
      // var grasshopperParameterA = new GrasshopperParameter("Length", 10);
      // var paramA = grasshopperParameterA.GetParameter();
      const param = new window.RhinoCompute.Grasshopper.DataTree("Length");
      console.log(window.RhinoCompute.Grasshopper);
      param.append([0, [10]]);
      // var grasshopperParameterB = new GrasshopperParameter("Typology", 0);
      // var paramB = grasshopperParameterB.GetParameter();

      // var grasshopperParameterC = new GrasshopperParameter(
      //   "Subdivision Count",
      //   10
      // );
      // var paramC = grasshopperParameterC.GetParameter();

      // console.log("paramA:", paramA);

      // this.trees.push(paramA);
      // this.trees.push(paramB);
      // this.trees.push(paramC);
    },
    // eslint-disable-next-line
    async rhinoCompute(definition) {
      // const res = await this.rhinoService.computeGrasshopperDefinition(
      //   definition,
      //   this.trees
      // );
      // console.log(res);
    }
    // changeViewer() {
    //   this.isParametric = !this.isParametric;
    //   console.clear();
    // }
  }
};
</script>

<style></style>
