export default class Trigger {
  constructor(name) {
    this.name = name;
    return this;
  }

  timeBased() {
    this.basis = 'time';
    return this;
  }

  after(duration) {
    this.duration = duration;
    return this;
  }

  create() {
    this.created = true;
    return this;
  }

  getUniqueId() {
    return `{"created": ${this.created}, "duration": ${
      this.duration
    }, "basis": "${this.basis}", "name": "${this.name}"}`;
  }

  toString() {
    return `{"created": ${this.created}, "duration": ${
      this.duration
    }, "basis": "${this.basis}", "name": "${this.name}"}`;
  }
}
