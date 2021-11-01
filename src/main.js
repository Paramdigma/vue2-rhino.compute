import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";

Vue.config.productionTip = false;

window.rhino3dm().then((rhino) => {
  Vue.prototype.$RhinoCompute = window.RhinoCompute;
  Vue.prototype.$rhino = rhino;

  // this.rhino_compute.authToken =
  //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwIjoiUEtDUyM3IiwiYyI6IkFFU18yNTZfQ0JDIiwiYjY0aXYiOiJqMGEzdmVLNFhPeGZhSmw3RGFjeTR3PT0iLCJiNjRjdCI6IjcyVGRIL2NsaWZIWnVEQk9OSUsrNTc5enUzMERhdTRpZzRBYzBBYmord0M2YnM5SmtqVVhicnRtMHRYN3ByUWk2eDJvdUFxb0JiVkhsSE84MWZtL3k3Z2dQd2R0U21wTHgxT295cEo0Q3N5RlhTbS9PbFhwbXRZaEg2dW5rUndwUUhoM0l2cjhJME1tOVdWQkFQTzlLcC94UndoZ1Uxbzg4VkNYZitOcThnNlBhekV4K25va3QrT1dUbGJMU3NubSt0WVg1OHJ6dWhaSFo0U0QxeUsxVkE9PSIsImlhdCI6MTYzNDE2NDAxMH0.G3AeLj3Gk_k-dgbqotcpTA9-HYuKXjvszGI4G-nhORM";

  new Vue({
    router,
    render: (h) => h(App),
  }).$mount("#app");
});
