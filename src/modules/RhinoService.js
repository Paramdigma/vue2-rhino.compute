export default function RhinoService() {}

// // set auth token and url
RhinoService.prototype.init = function async() {
  return new Promise((resolve, reject) => {
    if (window.rhino3dm) {
      window.RhinoCompute.url = process.env.VUE_APP_RHINO_COMPUTE_URL;
      window.RhinoCompute.apiKey = process.env.VUE_APP_RHINO_COMPUTE_API_KEY;
      window.RhinoCompute.authToken = process.env.VUE_APP_RHINO_COMPUTE_API_KEY;

      window.rhino3dm().then((rh) => {
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
  let buffer = await res.arrayBuffer();
  var definition = new Uint8Array(buffer);
  return definition;
};

// rhino compute evalute definition
RhinoService.prototype.computeGrasshopperDefinition = async function (
  definition,
  trees
) {
  const res = await window.RhinoCompute.Grasshopper.evaluateDefinition(
    definition,
    trees
  );
  // console.log("computed grasshopper response", res);
  return res;
};

// decode item function
// eslint-disable-next-line
function decodeItem(item) {
  const data = JSON.parse(item.data);
  if (item.type === "System.String") {
    // hack for draco meshes
    try {
      return window.Rhino3dm.DracoCompression.decompressBase64String(data);
    } catch {
      alert("error decompressing data");
    } // ignore errors (maybe the string was just a string...)
  } else if (typeof data === "object") {
    return window.Rhino3dm.CommonObject.decode(data);
  }
  return null;
}
// collect results
RhinoService.prototype.collectResults = function (jsonResponse) {
  var doc;
  const values = jsonResponse.values;
  // clear doc
  if (doc !== undefined) doc.delete();

  doc = new window.Rhino3dm.File3dm();

  // for each output (RH_OUT:*)...
  for (let i = 0; i < values.length; i++) {
    // ...iterate through data tree structure...
    for (const path in values[i].InnerTree) {
      const branch = values[i].InnerTree[path];
      // ...and for each branch...
      for (let j = 0; j < branch.length; j++) {
        // ...load rhino geometry into doc
        const rhinoObject = decodeItem(branch[j]);
        if (rhinoObject !== null) {
          doc.objects().add(rhinoObject, null);
        }
      }
    }
  }
  // console.log(doc);
  return doc;
};
