var prefix      = 'sd',
    Filters     = require('./filters'),
    Directives  = require('./directives'),
    selector    = Object.keys(Directives).map(function (d) {
        return '[' + prefix + '-' + d + ']'
    }).join()
    //  ["[sd-text]", "[sd-show]", "[sd-class]", "[sd-on]"].join()
    //  [sd-text],[sd-show],[sd-class],[sd-on]

function Seed (opts) {

    var self = this,
        root = this.el = document.getElementById(opts.id),
        els  = root.querySelectorAll(selector);
    var bindings = self._bindings = {} // internal real data 内部数据

    self.scope = {} // external interface 外部接口

    // process nodes for directives
    ;[].forEach.call(els, processNode)
    processNode(root)

    // initialize all variables by invoking setters
    for (var key in bindings) {
        self.scope[key] = opts.scope[key]
    }

    function processNode (el) {
            cloneAttributes(el.attributes).forEach(function (attr) {

            var directive = parseDirective(attr)
            if (directive) {
                bindDirective(self, el, bindings, directive)
            }
        })
    }
}

Seed.prototype.dump = function () {
    var data = {}
    for (var key in this._bindings) {
        data[key] = this._bindings[key].value
    }
    return data
}

Seed.prototype.destroy = function () {
    for (var key in this._bindings) {
        this._bindings[key].directives.forEach(function (directive) {
            if (directive.definition.unbind) {
                directive.definition.unbind(
                    directive.el,
                    directive.argument,
                    directive
                )
            }
        })
    }
    this.el.parentNode.remove(this.el)
}

// clone attributes so they don't change
function cloneAttributes (attributes) {
    
    return [].map.call(attributes, function (attr) {
        // console.log(attr)
        return {
            name: attr.name,
            value: attr.value
        }
        // {name: "class", value: "button"}
    })
}

function bindDirective (seed, el, bindings, directive) {
    // console.log(directive)
    // argument:"click"
    // attr:{name: "sd-on-click", value: "changeMessage | .myclass"}
    // definition:{update: ƒ, unbind: ƒ, customFilter: ƒ}
    // el:div#app
    // filters:[".myclass"]
    // handlers:{click: ƒ}
    // key:"changeMessage"
    // update:ƒ update(el, handler, event, directive)
    
    directive.el = el
    el.removeAttribute(directive.attr.name)
    // changeMessage
    var key = directive.key;

    var binding = bindings[key];
    // console.log(binding)
    if (!binding) {
        bindings[key] = binding = {
            value: undefined,
            directives: []
        }
    }
    binding.directives.push(directive)
    // invoke bind hook if exists
    if (directive.bind) {
        // 目前没执行这里
        directive.bind(el, binding.value)
    }
    // console.log('after', directive)
    if (!seed.scope.hasOwnProperty(key)) {
        bindAccessors(seed, key, binding)
        console.log(binding)
    }
}

function bindAccessors (seed, key, binding) {
    Object.defineProperty(seed.scope, key, {
        get: function () {
            return binding.value
        },
        set: function (value) {
            binding.value = value
            binding.directives.forEach(function (directive) {
                var filteredValue = value && directive.filters
                ? applyFilters(value, directive)
                : value
                
                directive.update(
                    directive.el,
                    filteredValue,
                    directive.argument,
                    directive,
                    seed
                )
            })
        }
    })
}

function parseDirective (attr) {

    // {name: "class", value: "button"}
    // {name: "sd-text", value: "name | capitalize"}

    if (attr.name.indexOf(prefix) === -1) return
    
    // parse directive name and argument
    var noprefix = attr.name.slice(prefix.length + 1);
    // text class-red


    var argIndex = noprefix.indexOf('-');

    // text class
    var dirname  = argIndex === -1
    ? noprefix
    : noprefix.slice(0, argIndex);

    var def = Directives[dirname];
    var arg = argIndex === -1
            ? null
            : noprefix.slice(argIndex + 1);
    // null red

    // parse scope variable key and pipe filters

    // changeMessage | .button
    // something
    var exp = attr.value;
    var pipeIndex = exp.indexOf('|');
    var key = pipeIndex === -1
            ? exp.trim()
            : exp.slice(0, pipeIndex).trim();
            // changeMessage
            // something
            
    var filters = pipeIndex === -1
            ? null
            : exp.slice(pipeIndex + 1).split('|').map(function (filter) {
                return filter.trim()
            });
            // null
            // [".button"]

    return def
        ? {
            attr: attr,
            key: key,
            filters: filters,
            definition: def,
            argument: arg,
            update: typeof def === 'function'
                ? def
                : def.update
        }
        : null
}

function applyFilters (value, directive) {
    if (directive.definition.customFilter) {
        // value: changeMessage函数
        return directive.definition.customFilter(value, directive.filters)
    } else {
        directive.filters.forEach(function (filter) {
            if (Filters[filter]) {
                value = Filters[filter](value)
            }
        })
        return value
    }
}

module.exports = {
    create: function (opts) {
        return new Seed(opts)
    },
    filters: Filters,
    directives: Directives
}