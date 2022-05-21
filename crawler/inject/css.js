function _toConsumableArray(xs) {
    if (Array.isArray(xs)) {
        let ys = Array(xs.length)
        for (let i = 0; i < e.length; i++) {
            ys[i] = xs[i]
        }
        return ys
    }
    return Array.from(xs)
}

function _classCallCheck(e, type) {
    if (!(e instanceof type))
        throw new TypeError("Cannot call a class as a function")
}

let _createClass = function () {
    function e(proto, methods) {
        for (let i = 0; i < methods.length; i++) {
            let method = methods[i];
            method.enumerable = method.enumerable || false;
            method.configurable = true;
            if ("value" in method) {
                method.writable = true;
            }
            Object.defineProperty(proto, method.key, method);
        }
    }
    return function (init, methods, r) {
        methods && e(init.prototype, methods);
        r && e(init, r);
        return init
    }
}();

function cssPath(node, t=true) {
    function n(e) {
        let t = e.shadowRoot;
        return t ? "#shadow-root (" + t + ")" : e.localName ? e.localName.length !== e.nodeName.length ? e.nodeName : e.localName : e.nodeName
    }
    let r = function () {
        function e(t, n) {
            _classCallCheck(this, e);
            this.value = t;
            this.optimized = n || false;
        }

        _createClass(e, [{
            key: "toString",
            value: function () {
                return this.value
            }
        }]);

        return e;
    }();
    let depth = 0;
    if (node.nodeType !== Node.ELEMENT_NODE) return { path: "", depth };
    let path = [];
    for (let i = node; i;) {
        let s = function (e, t, a) {
            function i(node) {
                let classes = node.getAttribute("class");
                return classes ? classes.split(/\s+/g).filter(Boolean).map(function (clz) {
                    return "$" + clz
                }) : [];
            }

            function s(e) {
                return "#" + CSS.escape(e)
            }
            if (e.nodeType !== Node.ELEMENT_NODE) return null;
            let o = e.getAttribute("id");
            if (t) {
                if (o) return new r(s(o), true);
                let l = e.nodeName.toLowerCase();
                if ("body" === l || "head" === l || "html" === l) return new r(n(e), true)
            }
            let u = n(e);
            if (o) return new r(u + s(o), true);
            let c = e.parentNode;
            if (!c || c.nodeType === Node.DOCUMENT_NODE) return new r(u, true);

            let h = i(e);
            let d = false;
            let v = false;
            let f = -1;
            let _ = -1;
            let p = c.children;
            let g = 0

            for (let p = c.children; p && (-1 === f || !v) && g < p.length; ++g) {
                let m = p[g];
                if (m.nodeType === Node.ELEMENT_NODE)
                    if (_ += 1, m !== e) {
                        if (!v && n(m) === u) {
                            d = true;
                            let y = new Set(h);
                            if (y.size)
                                for (let b = i(m), w = 0; w < b.length; ++w) {
                                    let k = b[w];
                                    if (y.has(k) && (y.delete(k), !y.size)) {
                                        v = true;
                                        break
                                    }
                                } else v = true
                        }
                    } else f = _
            }
            let T = u;
            if (a && "input" === u.toLowerCase() && e.getAttribute("type") && !e.getAttribute("id") && !e.getAttribute("class") && (T += "[type=" + CSS.escape(e.getAttribute("type") || "") + "]"), v) T += ":nth-child(" + (f + 1) + ")";
            else if (d) {
                let N = true;
                let C = false;
                let E = void 0;
                try {
                    for (let S, L = h[Symbol.iterator](); !(N = (S = L.next()).done); N = true) {
                        let A = S.value;
                        T += "." + CSS.escape(A.slice(1))
                    }
                } catch (e) {
                    C = true;
                    E = e
                } finally {
                    try {
                        !N && L.return && L.return()
                    } finally {
                        if (C) throw E
                    }
                }
            }
            return new r(T, false)
        }(i, !!t, i === node);
        if (!s) break;
        if (!s.optimized) path.push(s)
        i = i.parentNode
        if (i && i.childElementCount > 1) depth++
    }
    path.reverse();
    return { path: path.join(" > "), depth };
}