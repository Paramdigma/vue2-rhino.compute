<template>
  <div class="viewer">
    <h1>This is the viewer page</h1>
    <button @click="isParametric = !isParametric">
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
    return { isParametric: false, switchTitle: "Rhino" };
  },
  components: {
    Rhino,
    Grasshopper,
  },
  watch: {
    isParametric: function (newP) {
      if (newP == true) {
        this.switchTitle = "Grasshopper";
      } else if (newP == false) {
        this.switchTitle = "Rhino";
      }
    },
  },
};
</script>

<style></style>
