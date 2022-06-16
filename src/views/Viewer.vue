<template>
  <div class="container" id="viewer">
    <loader :loaded="loaded"></loader>
    <h1>This is the viewer page</h1>
    <button @click="changeViewer">
      {{ switchTitle }}
    </button>
    <rhino v-if="!isParametric"></rhino>
    <grasshopper v-else></grasshopper>

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
    return { isParametric: true, switchTitle: "Grasshopper" };
  },
  components: {
    Rhino,
    Grasshopper,
  },
  watch: {
    isParametric: function (newP) {
      if (newP == true) {
        this.switchTitle = "Rhino";
      } else if (newP == false) {
        this.switchTitle = "Grasshopper";
      }
    },

  },
  methods: {
    changeViewer() {
      this.isParametric = !this.isParametric;
      console.clear();
    },
  },
};
</script>

<style lang="scss">
</style>
