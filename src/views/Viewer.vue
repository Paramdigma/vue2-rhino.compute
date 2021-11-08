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
export default {
  name: "Viewer",
  data() {
    return {
      isParametric: false,
      switchTitle: "Grasshopper",
      viewer: null,
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
  },
  mounted() {
    if (this.$refs.canvas) {
      var container = this.$refs.canvas;
      console.log("container :", container);
      this.viewer = new ThreeViewer(container);
      this.viewer.init();
      this.compute();
    }
  },
  methods: {
    compute() {
      console.log("in compute");
      let sphere = new this.$rhino.Sphere([0, 0, 0], 4);
      this.$RhinoCompute.Mesh.createFromSphere(sphere, 15, 15, false).then(
        (result) => {
          console.log(result);
          if (result !== undefined) {
            let mesh = this.$rhino.CommonObject.decode(result);
            console.log(mesh.vertices().count);
            this.viewer.addMeshToScene(mesh);
          }
        }
      );
    },
    changeViewer() {
      this.isParametric = !this.isParametric;
      console.clear();
    },
  },
};
</script>

<style></style>
