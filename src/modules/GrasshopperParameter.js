export default function GrasshopperParameter(name, value) {
  this.name = name;
  this.value = value;
}
GrasshopperParameter.prototype.GetParameter = function () {
  // if (name != String || name == null || value == undefined || value == null)
  //   return;
  console.log(this.name, this.value, window.RhinoCompute);
  // eslint-disable-next-line
  const param = new window.RhinoCompute.Grasshopper.DataTree("Length");
  console.log(param);
  param.append([0, [this.value]]);
  console.log(param);
};
