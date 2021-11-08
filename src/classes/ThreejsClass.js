export default class ThreejsClass {
  Canvas = null;
  THREE = null;

  constructor(vcanvas) {
    this.Canvas = vcanvas;
  }
  init() {
    console.log(this.Canvas);
    var container = this.Canvas;

    // Rhino models are z-up, so set this as the default
    this.$THREE.Object3D.DefaultUp = new this.$THREE.Vector3(0, 0, 1);

    this.scene = new this.$THREE.Scene();
    this.scene.background = new this.$THREE.Color(1, 1, 1);
    this.camera = new this.$THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.camera.position.y = 50;

    this.renderer = new this.$THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(this.renderer.domElement);
    // add some controls to orbit the camera
    const controls = new this.$OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.controls = controls;
    window.addEventListener("resize", this.onWindowResize, false);

    this.animate();
  }

  animate() {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.animate();
  }
}
