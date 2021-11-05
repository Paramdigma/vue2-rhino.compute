<template>
  <div class="viewer">
    <h1>This is the viewer page</h1>
    <button @click="isParametric = !isParametric">
      {{ switchTitle }}
    </button>
    <rhino v-if="!isParametric"></rhino>
    <grasshopper v-else></grasshopper>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
import Rhino from "@/components/Rhino.vue";
import Grasshopper from "@/components/Grasshopper.vue";

export default {
  name: "Viewer",
  data() {
    return { isParametric: false, switchTitle: "Grasshopper" };
  },
  components: {
    Rhino,
    Grasshopper
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
  beforeMount() {
    this.$RhinoCompute.url = "http://localhost:8081/";
    this.$RhinoCompute.authToken = this.$RhinoCompute.getAuthToken();
  }
};
</script>

<style></style>
