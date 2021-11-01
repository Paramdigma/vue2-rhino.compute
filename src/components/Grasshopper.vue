<template>
  <div>
    <div ref="canvas"></div>
  </div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Rhino3dmLoader } from "three/examples/jsm/loaders/3DMLoader.js";
export default {
  name: "Grasshopper",
  data() {
    return {
      scene: {},
      camera: {},
      renderer: {},
      controls: {},
      crvData: {},
      definition: null,
      doc: undefined
    };
  },
  beforeMount() {
    this.$RhinoCompute.url = "http://localhost:8081/";
    this.$RhinoCompute.authToken = this.$RhinoCompute.getAuthToken();
  },
  async mounted() {
    if (this.$refs.canvas) {
      await this.loadGhFile();
      this.init();
      await this.compute();
    }
  },
  methods: {
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

    async loadGhFile() {
      const definitionName = "/grasshopper/worm.gh";
      let url = definitionName;
      let res = await fetch(url);
      console.log("res:0", res);
      let buffer = await res.arrayBuffer();
      this.definition = new Uint8Array(buffer);
      console.log("buffer: ", buffer, "definition: ", this.definition);
    },
    async compute() {
      console.log("in compute");
      const crvPoints = new this.$rhino.Point3dList();
      crvPoints.add(0, 0, 0);
      crvPoints.add(10, 10, 0);
      crvPoints.add(20, -10, 0);
      crvPoints.add(30, 10, 20);
      crvPoints.add(40, -10, -20);
      crvPoints.add(50, 0, 0);

      const nCrv = this.$rhino.NurbsCurve.create(false, 3, crvPoints);

      var crvData = JSON.stringify(nCrv.encode());
      this.crvData = crvData;
      const param1 = new this.$RhinoCompute.Grasshopper.DataTree("curve");
      param1.append([0], [this.crvData]);

      console.log("params:", param1);

      // clear values
      let trees = [];
      trees.push(param1);

      // Call RhinoCompute

      const res = await this.$RhinoCompute.Grasshopper.evaluateDefinition(
        this.definition,
        trees
      );

      console.log("grasshopper res:", res);
      this.collectResults(res);
    },

    collectResults(responseJson) {
      const values = responseJson.values;

      // clear doc
      if (this.doc !== undefined) this.doc.delete();

      //console.log(values)
      this.doc = new this.$rhino.File3dm();

      // for each output (RH_OUT:*)...
      for (let i = 0; i < values.length; i++) {
        // ...iterate through data tree structure...
        for (const path in values[i].InnerTree) {
          const branch = values[i].InnerTree[path];
          // ...and for each branch...
          for (let j = 0; j < branch.length; j++) {
            // ...load rhino geometry into doc
            const rhinoObject = this.decodeItem(branch[j]);
            if (rhinoObject !== null) {
              this.doc.objects().add(rhinoObject, null);
            }
          }
        }
      }
      console.log("doc: ", this.doc);
      if (this.doc.objects().count < 1) {
        console.error("No rhino objects to load!");
        // showSpinner(false);
        return;
      }

      // set up loader for converting the results to threejs
      const loader = new Rhino3dmLoader();
      loader.setLibraryPath(
        "https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/"
      );

      const resMaterial = new THREE.MeshBasicMaterial({
        vertexColors: true,
        wireframe: true
      });
      // load rhino doc into three.js scene
      const buffer = new Uint8Array(this.doc.toByteArray()).buffer;
      loader.parse(buffer, object => {
        // add material to resulting meshes
        object.traverse(child => {
          child.material = resMaterial;
        });

        // add object graph from rhino model to three.js scene
        this.scene.add(object);

        // hide spinner
        // showSpinner(false);
      });
    },
    decodeItem(item) {
      const data = JSON.parse(item.data);
      if (item.type === "System.String") {
        // hack for draco meshes
        try {
          return this.$rhino.DracoCompression.decompressBase64String(data);
        } catch {
          alert("error decompressing data");
        } // ignore errors (maybe the string was just a string...)
      } else if (typeof data === "object") {
        return this.$rhino.CommonObject.decode(data);
      }
      return null;
    }
  }
};
</script>

<style></style>
