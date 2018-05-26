var Vue = require('./explorations');
var app = Vue.create({
  id: 'app',
  // template
  scope: {
    'name.wow': 'kkxx',
    age: 'eleven',
    changeMessage: function(val) {
      val = val || 'test';
      app.scope['name.wow'] = val;
    },
    remove: function() {
      app.destroy();
    }
  }
});
