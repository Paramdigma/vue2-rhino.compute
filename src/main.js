import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";

Vue.config.productionTip = false;

window.rhino3dm().then(async rhino => {
  Vue.prototype.$RhinoCompute = window.RhinoCompute;
  Vue.prototype.$rhino = rhino;

  new Vue({
    router,
    render: h => h(App)
  }).$mount("#app");
});
