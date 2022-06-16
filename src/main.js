import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

Vue.config.productionTip = false;

window.rhino3dm().then(async (rhino) => {
  Vue.prototype.$RhinoCompute = window.RhinoCompute;
  Vue.prototype.$rhino = rhino;
  Vue.prototype.$THREE = THREE;
  Vue.prototype.$OrbitControls = OrbitControls;
  new Vue({
    router,
    render: (h) => h(App),
  }).$mount("#app");
});
