const props = {
  propertiesDocId: 'myPropertiesDocID',
  stop: false
};

module.exports = {
  getUserProperties: function() {
    return {
      getProperties: function() {
        return props;
      }
    };
  }
};
