<template>
  <div style="background-color: #E6E6E6">
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
    <div id="canvas" class="canvas" ref="canvas"></div>
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
      plane: null,
      dblClicked: false,
      raycaster: null,
      helper: null,
      intersects: [],
      pointer: null,
      objects: [],
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
        value: 5,
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
        this.selectedPoint = this.intersects[0].point;
        console.log("double clicked", this.selectedPoint);
        this.points.push(this.selectedPoint);
        this.dblClicked = false;
        console.log(this.pointOnScreen);
        await this.compute();
      }
    }
  },
  methods: {
    init() {
      const container = document.getElementById("canvas");
      // Rhino models are z-up, so set this as the default
      this.$THREE.Object3D.DefaultUp = new this.$THREE.Vector3(0, 0, 1);

      this.scene = new this.$THREE.Scene();
      this.scene.background = new this.$THREE.Color(0xE6E6E6);
      this.scene.fog = new this.$THREE.Fog(0xa0a0a0, 300, 1000);

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
      this.getXYZ();
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

      const geometry = new this.$THREE.PlaneGeometry(400, 400);
      geometry.rotateZ(-Math.PI / 2);
      this.plane = new this.$THREE.Mesh(geometry, new this.$THREE.MeshBasicMaterial({ visible: true }));
      this.plane.name = "Plane";
      this.scene.add(this.plane);

      // ray caster
      this.raycaster = new this.$THREE.Raycaster();
      this.pointer = new this.$THREE.Vector2();

      const geometryHelper = new this.$THREE.ConeGeometry(2, 10, 3);
      // geometryHelper.translate(0, 50, 0);
      geometryHelper.rotateX(Math.PI / 2);
      this.helper = new this.$THREE.Mesh(geometryHelper, new this.$THREE.MeshNormalMaterial());
      this.scene.add(this.helper);

      container.addEventListener("pointermove", this.onPointerMove);
      // container.addEventListener("dblclick", this.onDblClick);

      this.animate();
    },
    onDblClick() {
      this.dblClicked = true;
    },
    onPointerMove(event) {

      this.pointer.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
      this.pointer.y = -(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;
      this.raycaster.setFromCamera(this.pointer, this.camera);

      // See if the ray from the camera into the world hits one of our meshes
      this.intersects = this.raycaster.intersectObject(this.plane, false);
      // Toggle rotation bool for meshes that we clicked
      if (this.intersects.length > 0) {
        //   // console.log("intersects", this.intersects);
          this.helper.position.set(0, 0, 0);
        // if (this.intersects.face)
        this.helper.lookAt(this.intersects[0].face.normal);
        this.helper.position.copy(this.intersects[0].point);
      }
    },

    compute: async function() {
      // console.log("in compute");
      const param1 = new this.$RhinoCompute.Grasshopper.DataTree("Length");
      param1.append([0], [this.length_slider.value]);
      // console.log(param1);
      const param2 = new this.$RhinoCompute.Grasshopper.DataTree("Radius");
      param2.append([0], [this.radius_slider.value]);
      // console.log(param2);
      const param3 = new this.$RhinoCompute.Grasshopper.DataTree("Count");
      param3.append([0], [this.count_slider.value]);
      // console.log(param3);

      const param4 = new this.$RhinoCompute.Grasshopper.DataTree("Points");

      const data = [];
      for (let i = 0; i < this.points.length; i++) {
        const point = [this.points.x, this.points.y, this.points.z];
        // console.log("input point", point);
        const tempPt = new this.$rhino.Point(point);
        // console.log("rhino3dm point", tempPt);
        const tempData = JSON.stringify(tempPt.encode());
        // console.log("json string", tempData);

        data.push(tempData);
      }
      // console.log("data", data);
      param4.append([0], data);
      // console.log("param 4", param4);

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
      // this.parseRhino3dmObjects(response);
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
      let objs = [];
      loader.parse(arr, function(object) {
        console.log("object parsed", object);
        console.log("scene", scene);
        scene.traverse(child => {
          if (child.type == "Object3D" || (child.type == "Mesh" && child.name != "Plane") || child.type == "Curve")
            scene.remove(child);
        });
        // change material
        object.traverse(child => {
          if (child.isMesh) {
            // console.log("is Mesh");
            child.material = meshNormalMaterial;
            objs.push(child);
          }
          if (child.isLine) {
            // console.log("is Line");
            child.material = lineMaterial;
          }
        });
        scene.add(object);
      });
      this.objects = objs;
      this.objects.push(this.plane);
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
    async onInputChanged() {
      await this.compute();
    },
    getXYZ() {
      const axesHelper = new this.$THREE.AxesHelper(300);
      this.scene.add(axesHelper);
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
