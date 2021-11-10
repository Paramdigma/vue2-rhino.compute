export default function RhinoService() {}
// // set auth token and url
RhinoService.prototype.init = function () {
  // set auth token
  return new Promise((resolve, reject) => {
    console.log("It is done.");

    // Succeed half of the time.
    if (window.rhino3dm) {
      window.RhinoCompute.url = process.env.VUE_APP_RHINO_COMPUTE_URL;
      window.RhinoCompute.apiKey = process.env.VUE_APP_RHINO_COMPUTE_API_KEY;
      window.RhinoCompute.authToken = process.env.VUE_APP_RHINO_COMPUTE_API_KEY;
      window.rhino3dm().then(rh => {
        window.Rhino3dm = rh;
        resolve();
      });
    } else {
      alert("couldn't load rhino3dm");
      reject();
    }
  });
};
