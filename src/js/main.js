var Vue = require('./explorations');
var app = Vue.create({
  id: 'app',
  // template
  scope: {
    name: 'kkxx',
    age: 'eleven',
    something: true,
    changeMessage: function(val) {
      val = val || 'test'
      app.scope.name = val;
    }
  }
});