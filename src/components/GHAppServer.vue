<template>
  <div id="container">
    <div id="overlay">
      <div>
        <input
          type="range"
          ref="count"
          name="count"
          min="1"
          max="100"
          value="35"
          step="1"
          onmouseup="onSliderChange()"
          ontouchend="onSliderChange()"
        />
        <label for="count">Count</label>
      </div>
      <div>
        <input
          type="range"
          ref="radius"
          name="radius"
          min="0"
          max="10.00"
          value="5.00"
          step="0.1"
          onmouseup="onSliderChange()"
          ontouchend="onSliderChange()"
        />
        <label for="radius">Radius</label>
      </div>
      <div>
        <input
          type="range"
          ref="length"
          name="length"
          min="0"
          max="10.00"
          value="1.00"
          step="0.1"
          onmouseup="onSliderChange()"
          ontouchend="onSliderChange()"
        />
        <label for="length">Length</label>
      </div>
      <!-- <button @click="compute()">compute</button> -->
    </div>
    <div ref="canvas"></div>
  </div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import { Rhino3dmLoader } from "three/examples/jsm/loaders/3DMLoader.js";
export default {
  name: "GHAppServer",
  data() {
    return {
      scene: {},
      camera: {},
      renderer: {},
      controls: {},
      data: {},
      url: null,
      threeMesh: null,
      threeMaterial: null
    };
  },
  mounted() {
    if (
      !this.$refs.canvas ||
      !this.$refs.count ||
      !this.$refs.length ||
      !this.$refs.radius
    )
      return;

    this.init();
    this.loadGhFile();
  },

  methods: {
    setGhInputs() {
      this.data.inputs = {
        "RH_IN:201:Length": this.$refs["length"].value,
        "RH_IN:201:Count": this.$refs["count"].value,
        "RH_IN:201:Radius": this.$refs["radius"].value
      };
    },

    loadGhFile() {
      this.data.definition = "BranchNodeRnd.gh";
      // this.setGhInputs();

      // set this to the target appserver url
      let url = window.location.href;
      console.log(url);
      url = url.substring(0, url.lastIndexOf("/"));
      url = url.substring(0, url.lastIndexOf("/")) + "/solve";
      console.log(url);
    },

    async compute() {
      console.log("in compute");
      // let t0 = performance.now();
      // const timeComputeStart = t0;

      const request = {
        method: "POST",
        body: JSON.stringify(this.data),
        headers: { "Content-Type": "application/json" }
      };

      const response = await fetch(this.url, request);
      console.log("response:", response);
      // Request finished. Do processing gere
      // let t1 = performance.now();
      // const computeSolveTime = t1 - timeComputeStart;
      // t0 = t1;

      // let responseJson = await response.json();
      // let headers = response.headers.get("server-timing");
      // {
      //   // hide spinner

      //   let data = JSON.parse(
      //     responseJson.values[0].InnerTree["{ 0; }"][0].data
      //   );
      //   let mesh = this.$rhino.DracoCompression.decompressBase64String(data);

      //   t1 = performance.now();
      //   const decodeMeshTime = t1 - t0;
      //   t0 = t1;

      //   if (!this.threeMaterial) {
      //     this.threeMaterial = new THREE.MeshNormalMaterial();
      //   }
      //   let threeMesh = this.meshToThreejs(mesh, this.threeMaterial);
      //   mesh.delete();
      //   this.replaceCurrentMesh(threeMesh);

      //   t1 = performance.now();
      //   const rebuildSceneTime = t1 - t0;

      //   console.log(
      //     `[call compute and rebuild scene] = ${Math.round(
      //       t1 - timeComputeStart
      //     )} ms`
      //   );
      //   console.log(`  ${Math.round(computeSolveTime)} ms: appserver request`);
      //   let timings = headers.split(",");
      //   let sum = 0;
      //   timings.forEach(element => {
      //     let name = element.split(";")[0].trim();
      //     let time = element.split("=")[1].trim();
      //     sum += Number(time);
      //     if (name === "network") {
      //       console.log(`  .. ${time} ms: appserver<->compute network latency`);
      //     } else {
      //       console.log(`  .. ${time} ms: ${name}`);
      //     }
      //   });
      //   console.log(
      //     `  .. ${Math.round(
      //       computeSolveTime - sum
      //     )} ms: local<->appserver network latency`
      //   );
      //   console.log(
      //     `  ${Math.round(decodeMeshTime)} ms: decode json to rhino3dm mesh`
      //   );
      //   console.log(
      //     `  ${Math.round(
      //       rebuildSceneTime
      //     )} ms: create threejs mesh and insert in scene`
      //   );
      // }
    },
    init() {
      var container = this.$refs["canvas"];
      // Rhino models are z-up, so set this as the default
      THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1);

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(1, 1, 1);
      this.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );

      this.camera.position.x = 100;
      this.camera.position.y = 50;
      this.camera.position.z = 25;

      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(this.renderer.domElement);
      // add some controls to orbit the camera
      const controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls = controls;
      window.addEventListener("resize", this.onWindowResize, false);

      this.animate();
    },
    animate() {
      requestAnimationFrame(this.animate);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    },

    onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.animate();
    },

    meshToThreejs(mesh, material) {
      let loader = new THREE.BufferGeometryLoader();
      var geometry = loader.parse(mesh.toThreejsJSON());
      return new THREE.Mesh(geometry, material);
    },

    replaceCurrentMesh(threeMesh) {
      if (this.threeMesh) {
        this.scene.remove(this.threeMesh);
        this.threeMesh.dispose();
      }
      this.threeMesh = threeMesh;
      this.scene.add(this.threeMesh);
    }
  }
};
</script>

<style></style>
