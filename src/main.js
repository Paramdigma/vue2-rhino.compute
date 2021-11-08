import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Rhino3dmLoader } from "three/examples/jsm/loaders/3DMLoader.js";
import Buefy from "buefy";
import "buefy/dist/buefy.css";

Vue.config.productionTip = false;

Vue.use(Buefy);

window.rhino3dm().then(async rhino => {
  window.RhinoCompute.url = process.env.VUE_APP_RHINO_COMPUTE_URL;
  window.RhinoCompute.apiKey = process.env.VUE_APP_RHINO_COMPUTE_API_KEY;
  Vue.prototype.$RhinoCompute = window.RhinoCompute;
  Vue.prototype.$rhino = rhino;
  Vue.prototype.$THREE = THREE;
  Vue.prototype.$OrbitControls = OrbitControls;
  Vue.prototype.$Rhino3dmLoader = Rhino3dmLoader;

  new Vue({
    router,
    render: h => h(App)
  }).$mount("#app");
});
