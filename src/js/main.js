var bindingMark = 'data-element-binding';
function Element(id, initData) {
  var self = this;
  var el = (self.el = document.getElementById(id));
  var bindings = {}; // the internal copy 内部复制
  var data = (self.data = {}); // the external interface 外部接口
  var content = el.innerHTML.replace(/\{\{(.*)\}\}/g, markToken);

  el.innerHTML = content;
  // <p><span data-element-binding="msg"></span></p>
  // <p><span data-element-binding="msg"></span></p>
  // <p><span data-element-binding="msg"></span></p>
  // <p><span data-element-binding="what"></span></p>
  // <p><span data-element-binding="hey"></span></p>

  for (var variable in bindings) {
    // console.log(variable)
    bind(variable);
  }

  if (initData) {
    for (var variable in initData) {
      data[variable] = initData[variable];
    }
  }

  function markToken(match, variable) {
    //  相当于 bindings 赋值
    bindings[variable] = {};

    //  <span data-element-binding="msg"></span>
    return '<span ' + bindingMark + '="' + variable + '"></span>';
  }

  function bind(variable) {
    //  返回数组
    bindings[variable].els = el.querySelectorAll(
      '[' + bindingMark + '="' + variable + '"]'
    );

    [].forEach.call(bindings[variable].els, function(e) {
      e.removeAttribute(bindingMark);
    });

    Object.defineProperty(data, variable, {
      set: function(newVal) {
        [].forEach.call(bindings[variable].els, function(e) {
          bindings[variable].value = e.textContent = newVal;
        });
      },
      get: function() {
        return bindings[variable].value;
      }
    });
  }
}

var app = new Element('app', {
  msg: 'hello kk'
});
