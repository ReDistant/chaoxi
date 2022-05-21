function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

class News {
    constructor() {
        this.mutations = new Array()
        this.eventNodes = new Map()
        this.clicks = new Map()
    }
}

function rgb(r, g, b) {
    return 255 - (0.30 * r + 0.59 * g + 0.11 * b)
}

function rgba(r, g, b, a) {
    return rgb(r, g, b) * a
}

class Target {
    constructor(node, context = "") {
        this._node = node
        let { path, depth } = cssPath(node)
        this.path = path
        this.depth = depth
        this.context = context
    }
    get node() {
        if (!this._node.parentNode)
            this._node = document.querySelector(this.path)
        return this._node
    }
    get tag() {
        return this.path + this.node.textContent.trim() + this.context
    }
    get area() {
        return this.node.offsetHeight * this.node.offsetWidth
    }
    get fg() {
        return eval(window.getComputedStyle(this.node).color)
    }
    get bg() {
        return eval(window.getComputedStyle(this.node).backgroundColor)
    }
    compare(o) {
        for (let a of ['depth', 'area', 'bg', 'fg']) {
            let v = this[a] - o[a]
            if (v != 0) return v
        }
        return 0
    }
}

class Analyzer {
    Events = ["click", "change", "blur", "dbclick", "focus", "keydown", "keypress", "keyup", "load", "mousedown", "mousemove", "mouseout", "mouseover", "mouseup", "reset", "resize", "select", "submit", "unload", "abort", "error"]
    getEventListeners = window.getEventListeners

    constructor() {
        this.news = new News()
    }

    lock(obj, field, func) {
        obj[field] = func
        Object.defineProperty(obj, field, {
            writable: false,
            configurable: false
        });
    }

    init() {
        let self = this

        this.lock(HTMLFormElement.prototype, 'reset', function () { });
        this.lock(window, 'close', function () { });
        this.lock(window, 'open', function (url) { window.location = url });

        let observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                self.news.mutations.push(mutation)
            });
        })

        window.addEventListener("load", function (e) {
            observer.observe(document.body, {
                // attributes: true,
                // attributeOldValue: true,
                characterData: true,
                // characterDataOldValue: true,
                childList: true,
                subtree: true,
            })
            self.iterDom(document.body)
        })

        Element.prototype._addEventListener = Element.prototype.addEventListener
        Element.prototype.addEventListener = function (type) {
            self.record(this, type)
            Element.prototype._addEventListener.apply(this, arguments)
        }

        Object.defineProperties(HTMLElement.prototype, {
            onclick: { set: function (val) { onclick = val; self.record(this, "click"); } },
            onchange: { set: function (val) { onchange = val; self.record(this, "change"); } },
            onblur: { set: function (val) { onblur = val; self.record(this, "blur"); } },
            ondblclick: { set: function (val) { ondblclick = val; self.record(this, "dbclick"); } },
            onfocus: { set: function (val) { onfocus = val; self.record(this, "focus"); } },
            onkeydown: { set: function (val) { onkeydown = val; self.record(this, "keydown"); } },
            onkeypress: { set: function (val) { onkeypress = val; self.record(this, "keypress"); } },
            onkeyup: { set: function (val) { onkeyup = val; self.record(this, "keyup"); } },
            // onload: { set: function (val) { onload = val; self.recordListener(this, "load"); } },
            onmousedown: { set: function (val) { onmousedown = val; self.record(this, "mousedown"); } },
            onmousemove: { set: function (val) { onmousemove = val; self.record(this, "mousemove"); } },
            onmouseout: { set: function (val) { onmouseout = val; self.record(this, "mouseout"); } },
            onmouseover: { set: function (val) { onmouseover = val; self.record(this, "mouseover"); } },
            onmouseup: { set: function (val) { onmouseup = val; self.record(this, "mouseup"); } },
            onreset: { set: function (val) { onreset = val; self.record(this, "reset"); } },
            onresize: { set: function (val) { onresize = val; self.record(this, "resize"); } },
            onselect: { set: function (val) { onselect = val; self.record(this, "select"); } },
            onsubmit: { set: function (val) { onsubmit = val; self.record(this, "submit"); } },
            onunload: { set: function (val) { onunload = val; self.record(this, "unload"); } },
            onabort: { set: function (val) { onabort = val; self.record(this, "abort"); } },
            onerror: { set: function (val) { onerror = val; self.record(this, "error"); } },
        })
    }

    record(node, type) {
        if (type === "click") {
            this.news.clicks.set(node, "")
        }
        var nodes = this.news.eventNodes.get(type)
        if (nodes === undefined) {
            nodes = new Set()
            this.news.eventNodes.set(type, nodes)
        }
        nodes.add(node)
    }

    iterDom(node) {
        let iterator = document.createNodeIterator(node, 1);
        let forms = []
        while (node) {
            let tag = node.localName
            if (tag === 'a') {
                node.removeAttribute('target')
                this.record(node, 'click')
            } else if (tag === 'input' && (node.type == 'radio' || node.type == 'submit')) {
                this.record(node, 'click')
            } else if (tag === 'form') {
                forms.push(node)
            }
            for (let type of this.Events) {
                if (node['on' + type] != undefined) {
                    this.record(node, type)
                }
            }
            node = iterator.nextNode();
        }
        for (let form of forms) {
            let ids = []
            let nodes = []
            iterator = document.createNodeIterator(form, 1);
            for (let node = void 0; node = iterator.nextNode();) {
                if (node.localName === 'label') {
                    ids.push(node.getAttribute('for') || node.textContent.trim())
                } else if (node.localName === 'input') {
                    ids.push(node.name || node.id || node.placeholder)
                }
                if (this.news.clicks.get(node) !== undefined || this.getEventListeners(node).click) {
                    nodes.push(node)
                }
            }
            let context = ids.join(',')
            for (let node of nodes) {
                this.news.clicks.set(node, context)
            }
        }
    }

    async analyze(level) {
        await sleep(100)

        for (let mutation of this.news.mutations) {
            mutation.addedNodes.forEach(node => this.iterDom(node))
            if (mutation.type == 'characterData') {
                let node = mutation.target
                while (node = node.parentNode && node.childElementCount == 1) {
                    if (this.getEventListeners(node).click) {
                        this.record(node, 'click')
                        break
                    }
                }
            }
        }
        let news = this.news
        this.news = new News()
        if (news.clicks.size == 0) {
            return
        }
        // await sleep(1000)

        let prioritized = Array.from(news.clicks.entries(), ([node, context]) => new Target(node, context))
        prioritized.sort((a, b) => b.compare(a))
        console.log("Level", level, news, prioritized)

        for (let t of prioritized) {
            let node = t.node
            if (node == null) {
                continue
            }
            let tag = t.tag
            let count = localStorage[tag] || 0
            localStorage[tag] = count + 1
            if (count > 0)
                continue
            fillInputs()
            console.log(node.textContent.trim(), t)
            node.click()
            await this.analyze(level + 1)
        }
    }
}

let analyzer = new Analyzer()
analyzer.init()
