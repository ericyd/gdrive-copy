function sleepPromise(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const Utilities = {
  newBlob: function(x) {
    return x;
  },
  sleep: function(ms) {
    return sleepPromise(ms).then(_ => false);
  },
  formatDate: function(date) {
    return date.toString();
  }
};

module.exports = Utilities;
