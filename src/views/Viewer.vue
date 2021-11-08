<template>
  <div class="viewer">
    <h1>This is the viewer page</h1>
    <button @click="changeViewer">
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
import MyNameClass from "@/classes/MyNameClass.js";
export default {
  name: "Viewer",
  data() {
    return {
      isParametric: false,
      switchTitle: "Grasshopper",
      christianName: ""
    };
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
    this.$RhinoCompute.apiKey = this.$RhinoCompute.getAuthToken();
    this.christianName = new MyNameClass("Christian", "Dimitri");
  },
  mounted() {
    console.log("my class name :", this.christianName.getFullName());
  },
  methods: {
    changeViewer() {
      this.isParametric = !this.isParametric;
      console.clear();
    }
  }
};
</script>

<style></style>
