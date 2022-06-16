import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import Buefy from "buefy";
import "buefy/dist/buefy.css";

Vue.config.productionTip = false;
Vue.use(Buefy);

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
