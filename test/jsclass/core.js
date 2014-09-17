(function () {
    var a = (typeof this.global === 'object') ? this.global : this;
    a.JS = a.JS || {};
    JS.ENV = a
})();
JS.END_WITHOUT_DOT = /([^\.])$/;
JS.array = function (a) {
    var b = [], c = a.length;
    while (c--)b[c] = a[c];
    return b
};
JS.bind = function (a, b) {
    return function () {
        return a.apply(b, arguments)
    }
};
JS.extend = function (a, b, c) {
    if (!a || !b)return a;
    for (var d in b) {
        if (a[d] === b[d])continue;
        if (c === false && a.hasOwnProperty(d))continue;
        a[d] = b[d]
    }
    return a
};
JS.indexOf = function (a, b) {
    if (a.indexOf)return a.indexOf(b);
    var c = a.length;
    while (c--) {
        if (a[c] === b)return c
    }
    return-1
};
JS.isType = function (a, b) {
    if (typeof b === 'string')return typeof a === b;
    if (a === null || a === undefined)return false;
    return(typeof b === 'function' && a instanceof b) || (a.isA && a.isA(b)) || a.constructor === b
};
JS.makeBridge = function (a) {
    var b = function () {
    };
    b.prototype = a.prototype;
    return new b()
};
JS.makeClass = function (a) {
    a = a || Object;
    var b = function () {
        return this.initialize ? this.initialize.apply(this, arguments) || this : this
    };
    b.prototype = JS.makeBridge(a);
    b.superclass = a;
    b.subclasses = [];
    if (a.subclasses)a.subclasses.push(b);
    return b
};
JS.match = function (a, b) {
    if (b === undefined)return false;
    return typeof a.test === 'function' ? a.test(b) : a.match(b)
};
JS.Method = JS.makeClass();
JS.extend(JS.Method.prototype, {initialize: function (a, b, c) {
    this.module = a;
    this.name = b;
    this.callable = c;
    this._1 = {};
    if (typeof c !== 'function')return;
    this.arity = c.length;
    var d = c.toString().match(/\b[a-z\_\$][a-z0-9\_\$]*\b/ig), e = d.length;
    while (e--)this._1[d[e]] = true
}, setName: function (a) {
    this.callable.displayName = this.displayName = a
}, contains: function (a) {
    return this._1.hasOwnProperty(a)
}, call: function () {
    return this.callable.call.apply(this.callable, arguments)
}, apply: function (a, b) {
    return this.callable.apply(a, b)
}, compile: function (h) {
    var i = this, j = i.module.__trace__ || h.__trace__, k = i.callable, q = i._1, n = JS.Method._3, o = n.length, l = [], m;
    while (o--) {
        m = n[o];
        if (q[m.name])l.push(m)
    }
    if (l.length === 0 && !j)return k;
    var p = function () {
        var a = l.length, b = a, c = {}, d, e, f;
        while (b--) {
            d = l[b];
            e = this[d.name];
            if (e && !e.__kwd__)continue;
            c[d.name] = {_2: e, _4: this.hasOwnProperty(d.name)};
            f = d.filter(i, h, this, arguments);
            f.__kwd__ = true;
            this[d.name] = f
        }
        var g = k.apply(this, arguments), b = a;
        while (b--) {
            d = l[b];
            if (!c[d.name])continue;
            if (c[d.name]._4)this[d.name] = c[d.name]._2; else delete this[d.name]
        }
        return g
    };
    if (j)return JS.StackTrace.wrap(p, i, h);
    return p
}, toString: function () {
    var a = this.displayName || (this.module.toString() + '#' + this.name);
    return'#<Method:' + a + '>'
}});
JS.Method.create = function (a, b, c) {
    if (c && c.__inc__ && c.__fns__)return c;
    var d = (typeof c !== 'function') ? c : new this(a, b, c);
    this.notify(d);
    return d
};
JS.Method.compile = function (a, b) {
    return a && a.compile ? a.compile(b) : a
};
JS.Method.__listeners__ = [];
JS.Method.added = function (a, b) {
    this.__listeners__.push([a, b])
};
JS.Method.notify = function (a) {
    var b = this.__listeners__, c = b.length, d;
    while (c--) {
        d = b[c];
        d[0].call(d[1], a)
    }
};
JS.Method._3 = [];
JS.Method.keyword = function (a, b) {
    this._3.push({name: a, filter: b})
};
JS.Method.tracing = function (c, d, e) {
    JS.require('JS.StackTrace', function () {
        var a = JS.StackTrace.logger, b = a.active;
        c = [].concat(c);
        this.trace(c);
        a.active = true;
        d.call(e);
        this.untrace(c);
        a.active = b
    }, this)
};
JS.Method.trace = function (a) {
    var b = a.length;
    while (b--) {
        a[b].__trace__ = true;
        a[b].resolve()
    }
};
JS.Method.untrace = function (a) {
    var b = a.length;
    while (b--) {
        a[b].__trace__ = false;
        a[b].resolve()
    }
};
JS.Module = JS.makeClass();
JS.Module.__queue__ = [];
JS.extend(JS.Module.prototype, {initialize: function (a, b, c) {
    if (typeof a !== 'string') {
        c = arguments[1];
        b = arguments[0];
        a = undefined
    }
    c = c || {};
    this.__inc__ = [];
    this.__dep__ = [];
    this.__fns__ = {};
    this.__tgt__ = c._5;
    this.__anc__ = null;
    this.__mct__ = {};
    this.setName(a);
    this.include(b, {_0: false});
    if (JS.Module.__queue__)JS.Module.__queue__.push(this)
}, setName: function (a) {
    this.displayName = a || '';
    for (var b in this.__fns__)this.__name__(b);
    if (a && this.__meta__)this.__meta__.setName(a + '.')
}, __name__: function (a) {
    if (!this.displayName)return;
    var b = this.__fns__[a];
    if (!b)return;
    a = this.displayName.replace(JS.END_WITHOUT_DOT, '$1#') + a;
    if (typeof b.setName === 'function')return b.setName(a);
    if (typeof b === 'function')b.displayName = a
}, define: function (a, b, c) {
    var d = JS.Method.create(this, a, b), e = (c || {})._0;
    this.__fns__[a] = d;
    this.__name__(a);
    if (e !== false)this.resolve()
}, include: function (a, b) {
    if (!a)return this;
    var b = b || {}, c = b._0 !== false, d = a.extend, e = a.include, f, g, h, i, j, k;
    if (a.__fns__ && a.__inc__) {
        this.__inc__.push(a);
        if ((a.__dep__ || {}).push)a.__dep__.push(this);
        if (f = b._6) {
            if (typeof a.extended === 'function')a.extended(f)
        } else {
            if (typeof a.included === 'function')a.included(this)
        }
    } else {
        if (this.shouldIgnore('extend', d)) {
            i = [].concat(d);
            for (j = 0, k = i.length; j < k; j++)this.extend(i[j])
        }
        if (this.shouldIgnore('include', e)) {
            i = [].concat(e);
            for (j = 0, k = i.length; j < k; j++)this.include(i[j], {_0: false})
        }
        for (g in a) {
            if (!a.hasOwnProperty(g))continue;
            h = a[g];
            if (this.shouldIgnore(g, h))continue;
            this.define(g, h, {_0: false})
        }
        if (a.hasOwnProperty('toString'))this.define('toString', a.toString, {_0: false})
    }
    if (c)this.resolve();
    return this
}, alias: function (a) {
    for (var b in a) {
        if (!a.hasOwnProperty(b))continue;
        this.define(b, this.instanceMethod(a[b]), {_0: false})
    }
    this.resolve()
}, resolve: function (a) {
    var a = a || this, b = a.__tgt__, c = this.__inc__, d = this.__fns__, e, f, g, h;
    if (a === this) {
        this.__anc__ = null;
        this.__mct__ = {};
        e = this.__dep__.length;
        while (e--)this.__dep__[e].resolve()
    }
    if (!b)return;
    for (e = 0, f = c.length; e < f; e++)c[e].resolve(a);
    for (g in d) {
        h = JS.Method.compile(d[g], a);
        if (b[g] !== h)b[g] = h
    }
    if (d.hasOwnProperty('toString'))b.toString = JS.Method.compile(d.toString, a)
}, shouldIgnore: function (a, b) {
    return(a === 'extend' || a === 'include') && (typeof b !== 'function' || (b.__fns__ && b.__inc__))
}, ancestors: function (a) {
    var b = !a, a = a || [], c = this.__inc__;
    if (b && this.__anc__)return this.__anc__.slice();
    for (var d = 0, e = c.length; d < e; d++)c[d].ancestors(a);
    if (JS.indexOf(a, this) < 0)a.push(this);
    if (b)this.__anc__ = a.slice();
    return a
}, lookup: function (a) {
    var b = this.__mct__[a];
    if (b && b.slice)return b.slice();
    var c = this.ancestors(), d = [], e;
    for (var f = 0, g = c.length; f < g; f++) {
        e = c[f].__fns__;
        if (e.hasOwnProperty(a))d.push(e[a])
    }
    this.__mct__[a] = d.slice();
    return d
}, includes: function (a) {
    if (a === this)return true;
    var b = this.__inc__;
    for (var c = 0, d = b.length; c < d; c++) {
        if (b[c].includes(a))return true
    }
    return false
}, instanceMethod: function (a) {
    return this.lookup(a).pop()
}, instanceMethods: function (a, b) {
    var c = b || [], d = this.__fns__, e;
    for (e in d) {
        if (!JS.isType(this.__fns__[e], JS.Method))continue;
        if (JS.indexOf(c, e) >= 0)continue;
        c.push(e)
    }
    if (a !== false) {
        var f = this.ancestors(), g = f.length;
        while (g--)f[g].instanceMethods(false, c)
    }
    return c
}, match: function (a) {
    return a && a.isA && a.isA(this)
}, toString: function () {
    return this.displayName
}});
JS.Kernel = new JS.Module('Kernel', {__eigen__: function () {
    if (this.__meta__)return this.__meta__;
    var a = this.toString() + '.';
    this.__meta__ = new JS.Module(a, null, {_5: this});
    return this.__meta__.include(this.klass, {_0: false})
}, equals: function (a) {
    return this === a
}, extend: function (a, b) {
    var c = (b || {})._0;
    this.__eigen__().include(a, {_6: this, _0: c});
    return this
}, hash: function () {
    return JS.Kernel.hashFor(this)
}, isA: function (a) {
    return(typeof a === 'function' && this instanceof a) || this.__eigen__().includes(a)
}, method: function (a) {
    var b = this.__mct__ = this.__mct__ || {}, c = b[a], d = this[a];
    if (typeof d !== 'function')return d;
    if (c && d === c._2)return c._7;
    var e = JS.bind(d, this);
    b[a] = {_2: d, _7: e};
    return e
}, methods: function () {
    return this.__eigen__().instanceMethods()
}, tap: function (a, b) {
    a.call(b || null, this);
    return this
}, toString: function () {
    if (this.displayName)return this.displayName;
    var a = this.klass.displayName || this.klass.toString();
    return'#<' + a + ':' + this.hash() + '>'
}});
(function () {
    var b = 1;
    JS.Kernel.hashFor = function (a) {
        if (a.__hash__ !== undefined)return a.__hash__;
        a.__hash__ = (new Date().getTime() + b).toString(16);
        b += 1;
        return a.__hash__
    }
})();
JS.Class = JS.makeClass(JS.Module);
JS.extend(JS.Class.prototype, {initialize: function (a, b, c, d) {
    if (typeof a !== 'string') {
        d = arguments[2];
        c = arguments[1];
        b = arguments[0];
        a = undefined
    }
    if (typeof b !== 'function') {
        d = c;
        c = b;
        b = Object
    }
    JS.Module.prototype.initialize.call(this, a);
    d = d || {};
    var e = JS.makeClass(b);
    JS.extend(e, this);
    e.prototype.constructor = e.prototype.klass = e;
    e.__eigen__().include(b.__meta__, {_0: d._0});
    e.setName(a);
    e.__tgt__ = e.prototype;
    var f = (b === Object) ? {} : (b.__fns__ ? b : new JS.Module(b.prototype, {_0: false}));
    e.include(JS.Kernel, {_0: false}).include(f, {_0: false}).include(c, {_0: false});
    if (d._0 !== false)e.resolve();
    if (typeof b.inherited === 'function')b.inherited(e);
    return e
}});
(function () {
    var e = function (a) {
        var b = {}, c = a.prototype;
        for (var d in c) {
            if (!c.hasOwnProperty(d))continue;
            b[d] = JS.Method.create(a, d, c[d])
        }
        return b
    };
    var f = function (a, b) {
        var c = JS[a], d = JS[b];
        c.__inc__ = [];
        c.__dep__ = [];
        c.__fns__ = e(c);
        c.__tgt__ = c.prototype;
        c.prototype.constructor = c.prototype.klass = c;
        JS.extend(c, JS.Class.prototype);
        c.include(d || JS.Kernel);
        c.setName(a);
        c.constructor = c.klass = JS.Class
    };
    f('Method');
    f('Module');
    f('Class', 'Module');
    var g = JS.Kernel.instanceMethod('__eigen__');
    g.call(JS.Method).resolve();
    g.call(JS.Module).resolve();
    g.call(JS.Class).include(JS.Module.__meta__)
})();
JS.NotImplementedError = new JS.Class('NotImplementedError', Error);
JS.Method.keyword('callSuper', function (c, d, e, f) {
    var g = d.lookup(c.name), h = g.length - 1, i = JS.array(f);
    return function () {
        var a = arguments.length;
        while (a--)i[a] = arguments[a];
        h -= 1;
        var b = g[h].apply(e, i);
        h += 1;
        return b
    }
});
JS.Method.keyword('blockGiven', function (a, b, c, d) {
    var e = Array.prototype.slice.call(d, a.arity), f = (typeof e[0] === 'function');
    return function () {
        return f
    }
});
JS.Method.keyword('yieldWith', function (a, b, c, d) {
    var e = Array.prototype.slice.call(d, a.arity);
    return function () {
        if (typeof e[0] !== 'function')return;
        return e[0].apply(e[1] || null, arguments)
    }
});
JS.Interface = new JS.Class('Interface', {initialize: function (d) {
    this.test = function (a, b) {
        var c = d.length;
        while (c--) {
            if (typeof a[d[c]] !== 'function')return b ? d[c] : false
        }
        return true
    }
}, extend: {ensure: function () {
    var a = JS.array(arguments), b = a.shift(), c, d;
    while (c = a.shift()) {
        d = c.test(b, true);
        if (d !== true)throw new Error('object does not implement ' + d + '()');
    }
}}});
JS.Singleton = new JS.Class('Singleton', {initialize: function (a, b, c) {
    return new (new JS.Class(a, b, c))
}});
//@ sourceMappingURL=core.js.map