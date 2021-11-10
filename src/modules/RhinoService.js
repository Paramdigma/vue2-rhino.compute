export default function RhinoService() {}
// // set auth token and url
RhinoService.prototype.init = function async() {
  // set auth token
  return new Promise((resolve, reject) => {
    // console.log("auth successful");

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
      alert("Couldn't load rhino3dm");
      reject();
    }
  });
};

RhinoService.prototype.loadGrasshopperFileLocally = async function (filePath) {
  let res = await fetch(filePath);
  // console.log("res:0", res);
  let buffer = await res.arrayBuffer();
  var definition = new Uint8Array(buffer);
  console.log("buffer: ", buffer, "definition: ", definition);
  return definition;
};

// rhino compute evalute definition
// RhinoService.prototype.computeGrasshopperDefinition = async function (
//   definition,
//   trees
// ) {
//   const res = await window.RhinoCompute.Grasshopper.evaluateDefinition(
//     definition,
//     trees
//   );
//   console.log("computed grasshopper response", res);
//   return res;
// };
