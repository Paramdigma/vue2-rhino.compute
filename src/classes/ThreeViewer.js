import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default class ThreeViewer {
  Canvas = null;
  Renderer = null;
  Camera = null;
  Controls = null;
  Scene = null;
  THREE = null;

  constructor(vcanvas) {
    this.Canvas = vcanvas;
    this.THREE = THREE;
  }
  init() {
    var $this = this;
    var container = this.Canvas;

    // Rhino models are z-up, so set this as the default
    this.THREE.Object3D.DefaultUp = new this.THREE.Vector3(0, 0, 1);

    this.Scene = new this.THREE.Scene();
    this.Scene.background = new this.THREE.Color(1, 1, 1);

    this.Camera = new this.THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.Camera.position.y = 50;

    this.Renderer = new this.THREE.WebGLRenderer({ antialias: true });
    this.Renderer.setPixelRatio(window.devicePixelRatio);
    this.Renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(this.Renderer.domElement);

    // add some controls to orbit the camera
    this.Controls = new OrbitControls(this.Camera, this.Renderer.domElement);

    window.addEventListener("resize", onWindowResize, false);

    function animate() {
      requestAnimationFrame(animate);
      $this.Controls.update();
      $this.Renderer.render($this.Scene, $this.Camera);
    }

    animate();

    // console.log(this.Scene, this.Renderer, this.Camera, this.Controls);

    function onWindowResize() {
      $this.Camera.aspect = window.innerWidth / window.innerHeight;
      $this.Camera.updateProjectionMatrix();
      $this.Renderer.setSize(window.innerWidth, window.innerHeight);
      animate();
    }
  }
  addMeshToScene(mesh) {
    let threemesh = meshToThreejs(
      mesh,
      new THREE.MeshNormalMaterial({ wireframe: true })
    );
    this.Scene.add(threemesh);

    function meshToThreejs(mesh, material) {
      let loader = new THREE.BufferGeometryLoader();
      var geometry = loader.parse(mesh.toThreejsJSON());
      return new THREE.Mesh(geometry, material);
    }
  }
}
