<template>
  <div class="viewer">
    <h1>This is the viewer page</h1>
    <div ref="canvas"></div>

    <!-- <button @click="changeViewer">
      {{ switchTitle }}
    </button>
    <rhino v-if="!isParametric"></rhino>
    <grasshopper v-else></grasshopper>
    <canvas ref="canvas"></canvas> -->
  </div>
</template>

<script>
// import Rhino from "@/components/Rhino.vue";
// import Grasshopper from "@/components/Grasshopper.vue";
import ThreeViewer from "@/classes/ThreeViewer.js";
import RhinoService from "@/modules/RhinoService.js";

export default {
  name: "Viewer",
  data() {
    return {
      // isParametric: false,
      // switchTitle: "Grasshopper",
      viewer: null,
      rhinoService: null,
      url: "/grasshopper/Truss.gh"
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
    }
  },
  async mounted() {
    if (this.$refs.canvas) {
      var container = this.$refs.canvas;
      console.log("container :", container);
      this.viewer = new ThreeViewer(container);
      this.viewer.init();
      this.rhinoService = new RhinoService();
      await this.rhinoService.init();
      console.log("Rhino compute", window.RhinoCompute);
      console.log("Rhino3dm", window.Rhino3dm);
      await this.loadGHModel();
    }
  },
  methods: {
    async loadGHModel() {
      console.log("loading grasshopper model");
    }
    // changeViewer() {
    //   this.isParametric = !this.isParametric;
    //   console.clear();
    // }
  }
};
</script>

<style></style>
