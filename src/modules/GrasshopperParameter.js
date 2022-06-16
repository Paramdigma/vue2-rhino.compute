export default function GrasshopperParameter(name, value) {
  this.name = name;
  this.value = value;
}
GrasshopperParameter.prototype.GetParameter = function () {
  var param = new window.RhinoCompute.Grasshopper.DataTree(this.name);
  param.append([0], [this.value]);
  return param;
};
