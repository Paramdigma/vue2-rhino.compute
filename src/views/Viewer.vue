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
      switchTitle: "Grasshopper"
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
  mounted() {
    if (this.$refs.canvas) {
      var container = this.$refs.canvas;
      console.log("container :", container);
      let viewer = new ThreeViewer(container);
      viewer.init();
      this.compute();
    }
  },
  methods: {
    meshToThreejs(mesh, material) {
      let loader = new this.$THREE.BufferGeometryLoader();
      var geometry = loader.parse(mesh.toThreejsJSON());
      return new this.$THREE.Mesh(geometry, material);
    },

    compute() {
      console.log("in compute");
      let sphere = new this.$rhino.Sphere([0, 0, 0], 4);
      this.$RhinoCompute.Mesh.createFromSphere(sphere, 15, 15, false).then(
        result => {
          console.log(result);
          if (result !== undefined) {
            let mesh = this.$rhino.CommonObject.decode(result);
            console.log(mesh.vertices().count);
            let threemesh = this.meshToThreejs(
              mesh,
              new this.$THREE.MeshNormalMaterial({ wireframe: true })
            );
            this.scene.add(threemesh);
          }
        }
      );
    },
    changeViewer() {
      this.isParametric = !this.isParametric;
      console.clear();
    }
  }
};
</script>

<style></style>
