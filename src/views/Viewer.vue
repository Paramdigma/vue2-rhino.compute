<template>
  <div class="viewer">
    <button @click="changeViewer">
      {{ switchTitle }}
    </button>
    <rhino v-if="!isParametric"></rhino>
    <grasshopper v-else></grasshopper>
  </div>
</template>

<script>
import Rhino from "@/components/Rhino.vue";
import Grasshopper from "@/components/Grasshopper.vue";

export default {
  name: "Viewer",
  data() {
    return { isParametric: true, switchTitle: "Grasshopper" };
  },
  components: {
    Rhino,
    Grasshopper
  },
  watch: {
    isParametric: function(newP) {
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
    this.$RhinoCompute.apiKey = this.$RhinoCompute.getAuthToken();
  },
  methods: {
    changeViewer() {
      this.isParametric = !this.isParametric;
      console.clear();
    }
  }
};
</script>

<style lang="scss">
</style>
