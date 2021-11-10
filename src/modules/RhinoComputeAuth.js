// import { Rhino3dmLoader } from "three/examples/jsm/loaders/3DMLoader.js";
export function RhinoComputeAuth() {
  window.RhinoCompute.url = process.env.VUE_APP_RHINO_COMPUTE_URL;
  window.RhinoCompute.apiKey = process.env.VUE_APP_RHINO_COMPUTE_API_KEY;
  window.RhinoCompute.authToken = process.env.VUE_APP_RHINO_COMPUTE_API_KEY;
  return {
    url: process.env.VUE_APP_RHINO_COMPUTE_URL,
    key: process.env.VUE_APP_RHINO_COMPUTE_API_KEY,
  };
}
