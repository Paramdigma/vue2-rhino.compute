export default class MyNameClass {
  FirstName = null;
  LastName = "";

  constructor(fname, lname) {
    this.FirstName = fname;
    this.LastName = lname;
  }
  getFullName() {
    return this.FirstName + " " + this.LastName;
  }
  getFirstName() {
    return this.FirstName;
  }
  getLastName() {
    return this.LastName;
  }
}
