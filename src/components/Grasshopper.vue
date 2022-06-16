<template>
  <div>
    <div class="is-flex is-flex-direction-row">
      <input
        @input="onInputChanged"
        type="range"
        id="count"
        name="count"
        :min="count_slider.min"
        :max="count_slider.max"
        :step="count_slider.step"
        v-model="count_slider.value"
      />
      <label for="count">Count: {{ count_slider.value }}</label>
    </div>
    <div>
      <input
        @input="onInputChanged"
        type="range"
        id="radius"
        name="radius"
        :min="radius_slider.min"
        :max="radius_slider.max"
        v-model="radius_slider.value"
        :step="radius_slider.step"
      />
      <label for="radius">Radius: {{ radius_slider.value }}</label>
    </div>
    <div>
      <input
        @input="onInputChanged"
        type="range"
        id="length"
        name="length"
        :min="length_slider.min"
        :max="length_slider.max"
        v-model="length_slider.value"
        :step="length_slider.step"
      />
      <label for="length">Length: {{ length_slider.value }}</label>
    </div>
    <div @dblclick="dblClicked = true" class="canvas" ref="canvas"></div>
  </div>
</template>

<script>
/* eslint-disable */
import { Rhino3dmLoader } from "three/examples/jsm/loaders/3DMLoader.js";

export default {
  name: "Grasshopper",
  data() {
    return {
      scene: {},
      camera: {},
      renderer: {},
      controls: {},
      definition: null,
      doc: null,
      applicationDetails: "Rhino.Compute vuejs boilerplate",
      applicationName: "Vue2-Rhino.Compute",
      applicationUrl: "http://localhost:8080",
      createdBy: "Paramdigma",
      lastEditedBy: "Christian Dimitri",
      revision: 1,
      startSectionComments: "",
      pointOnScreen: null,
      selectedPoint: null,
      points: [],
      dblClicked: false,
      radius_slider: {
        value: 2.0,
        min: 2.0,
        max: 10.0,
        step: 0.1
      },
      length_slider: {
        value: 40,
        min: 0,
        max: 40,
        step: 0.1
      },
      count_slider: {
        value: 1,
        min: 1,
        max: 10,
        step: 1
      }
    };
  },
  async mounted() {
    if (this.$refs.canvas) {
      await this.loadGhFile();
      this.init();
      await this.compute();
    }
  },
  watch: {
    async dblClicked(click) {
      if (click) {
        console.log("double clicked");
        this.selectedPoint = this.pointOnScreen;
        this.points.push(this.selectedPoint);
        await this.compute();
        this.dblClicked = false;
        console.log(this.pointOnScreen);
      }
    }
  },
  methods: {
    init() {
      var container = this.$refs["canvas"];
      // Rhino models are z-up, so set this as the default
      this.$THREE.Object3D.DefaultUp = new this.$THREE.Vector3(0, 0, 1);

      this.scene = new this.$THREE.Scene();
      this.scene.background = new this.$THREE.Color(0xa0a0a0);
      this.scene.fog = new this.$THREE.Fog(0xa0a0a0, 100, 500);

      this.camera = new this.$THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );

      // camera position
      this.camera.position.x = 100;
      this.camera.position.y = 100;
      this.camera.position.z = 100;

      this.renderer = new this.$THREE.WebGLRenderer({ antialias: true });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(this.renderer.domElement);

      // add some controls to orbit the camera
      this.controls = new this.$OrbitControls(
        this.camera,
        this.renderer.domElement
      );

      window.addEventListener("resize", this.onWindowResize, false);

      // hemilight
      const hemiLight = new this.$THREE.HemisphereLight(0xffffff, 0x444444);
      hemiLight.position.set(1000, 1000, 1000);
      this.scene.add(hemiLight);

      // directional light
      const dirLight = new this.$THREE.DirectionalLight(0xffffff);
      dirLight.position.set(1200, 1200, 1200);
      dirLight.castShadow = true;
      this.scene.add(dirLight);


      // grid helper
      const gridHelper = new this.$THREE.GridHelper(400, 40, 0x0000ff, 0x808080);
      gridHelper.rotation.x = -Math.PI / 2;
      this.scene.add(gridHelper);

      // events
      document.addEventListener("pointermove", this.onPointerMove);

      this.animate();
    },
    onPointerMove(event) {
      // Relative screen position
      // (WebGL is -1 to 1 left to right, 1 to -1 top to bottom)
      // console.log(this.$refs.canvas);
      const rect = document.querySelector("canvas").getBoundingClientRect();
      let viewportDown = new this.$THREE.Vector2();
      viewportDown.x = (((event.clientX - rect.left) / rect.width) * 2) - 1;
      viewportDown.y = -(((event.clientY - rect.top) / rect.height) * 2) + 1;

      // compute 3d point
      this.pointOnScreen = this.worldPointFromScreenPoint(viewportDown, this.camera);

    },
    constructPoint() {
      return new this.$rhino.Point(this.pointOnScreen.x, this.pointOnScreen.y, this.pointOnScreen.z);
    },
    worldPointFromScreenPoint(screenPoint, camera) {

      let worldPoint = new this.$THREE.Vector3();
      worldPoint.x = screenPoint.x;
      worldPoint.y = screenPoint.y;
      worldPoint.z = 0;
      worldPoint.unproject(camera);
      return worldPoint;
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

    async loadGhFile() {
      // const definitionName = "grasshopper/BranchNodeRnd.gh";
      const url = "grasshopper/ExampleB.gh";
      let res = await fetch(url);
      // console.log("fetched results", res);
      let buffer = await res.arrayBuffer();
      // console.log("buffer: ", buffer);
      this.definition = new Uint8Array(buffer);
      // console.log("definition: ", this.definition);
    },

    async compute() {
      // console.log("in compute");
      const param1 = new this.$RhinoCompute.Grasshopper.DataTree("Length");
      param1.append([0], [this.length_slider.value]);

      const param2 = new this.$RhinoCompute.Grasshopper.DataTree("Radius");
      param2.append([0], [this.radius_slider.value]);
      console.log(param2);
      const param3 = new this.$RhinoCompute.Grasshopper.DataTree("Count");
      param3.append([0], [this.count_slider.value]);


      const pts = new this.$rhino.Point3dList();
      const datas = [];
      const param4 = new this.$RhinoCompute.Grasshopper.DataTree("Points");

      for (let i = 0; i < this.points.length; i++) {
        const point = [this.points[i] != null ? this.points[i].x : 0, this.points[i] != null ? this.points[i].y : 0, this.points[i] != null ? this.points[i].z : 0];
        const tempPt = new this.$rhino.Point(point);
        console.log(tempPt);
        const ptData = JSON.stringify(tempPt.encode());
        datas.push(ptData);
      }
      param4.append([0], datas);
      console.log("param 4", param4);

      // store params
      const trees = [];
      trees.push(param1);
      trees.push(param2);
      trees.push(param3);
      trees.push(param4);

      const response = await this.$RhinoCompute.Grasshopper.evaluateDefinition(
        this.definition,
        trees
      );

      // console.log("results:", response);
      this.parseRhino3dmObjects(response);
    },

    parseRhino3dmObjects(response) {

      this.doc = new this.$rhino.File3dm();

      const values = response.values;

      // clear doc
      if (this.doc !== undefined)
        this.doc.delete();

      //console.log(values)
      this.doc = new this.$rhino.File3dm();
      // console.log("doc", this.doc);
      // for each output (RH_OUT:*)...
      for (let i = 0; i < values.length; i++) {
        // ...iterate through data tree structure...
        for (const path in values[i].InnerTree) {
          const branch = values[i].InnerTree[path];
          // ...and for each branch...
          for (let j = 0; j < branch.length; j++) {
            // ...load rhino geometry into doc
            // console.log("geometry object", branch[j]);
            const rhinoObject = this.decodeItem(branch[j]);
            // console.log("decoded object", rhinoObject);
            if (rhinoObject !== null) {
              this.doc.objects().add(rhinoObject, null);
            }
          }
        }
      }
      const loader = new Rhino3dmLoader();
      loader.setLibraryPath(
        "https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/"
      );
      let arr = new Uint8Array(this.doc.toByteArray()).buffer;
      // console.log("array buffer", arr);
      // console.log("scene", this.scene);

      let scene = this.scene;
      let meshNormalMaterial = new this.$THREE.MeshNormalMaterial();
      let lineMaterial = new this.$THREE.LineBasicMaterial({
        color: 0x00ff00,
        linewidth: 1,
        linecap: "round", //ignored by WebGLRenderer
        linejoin: "round" //ignored by WebGLRenderer
      });

      // parse object
      loader.parse(arr, function(object) {
        console.log("object parsed", object);
        console.log("scene", scene);
        scene.traverse(child => {
          if (child.type == "Object3D" || child.type == "Mesh" || child.type == "Curve")
            scene.remove(child);
        });

        // change material
        object.traverse(child => {
          if (child.type == "Mesh") {
            console.log("is Mesh");
            child.material = meshNormalMaterial;
          } else if (child.type == "Line") {
            console.log("is Line");
            child.material = lineMaterial;
          }
        });
        scene.add(object);
      });
    },

    decodeItem(item) {
      const data = JSON.parse(item.data);
      // console.log("parsed json", data);
      if (item.type === "System.String") {
        // hack for draco meshes
        try {
          const mesh = this.$rhino.DracoCompression.decompressBase64String(data);
          return mesh;
        } catch {
        } // ignore errors (maybe the string was just a string...)
      } else if (typeof data === "object") {
        // console.log("it's object");
        return this.$rhino.CommonObject.decode(data);
      } else {

      }
      return null;
    },

    async onInputChanged() {
      await this.compute();
    }

  }
};
</script>

<style lang="scss">
.canvas {
  width: 100vw;
  height: 70vh !important;

  canvas {
    width: 100%;
    height: 100% !important;
  }
}
</style>
