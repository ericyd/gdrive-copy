const props = {
  propertiesDocId: 'myPropertiesDocID',
  stop: false,
  triggerId: 'myTriggerId'
};

module.exports = {
  getUserProperties: function() {
    return {
      getProperties: function() {
        return props;
      },
      getProperty: function(x) {
        return props[x];
      },
      setProperty: function(x, y) {
        props[x] = y;
      }
    };
  }
};
