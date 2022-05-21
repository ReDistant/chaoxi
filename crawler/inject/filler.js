let fill = function () {
    DEFAULT = "12345678"

    let TYPES = {
        email: 'lghn@163.com',
        password: 'd7jh@WsX3a',
        color: '#ff0000',
        'datetime-local': (new Date).toISOString().substr(0, 16),
        date: (new Date).toISOString().substr(0, 10),
        month: (new Date).toISOString().substr(0, 7),
        time: (new Date).toTimeString().substr(0, 5),
        week: (new Date).getUTCFullYear() + '-W01',
        tel: '13012345678',
        url: location.href
    }

    let HINTS = {
        CIDR: {
            hints: /(ip)|(^(\d{1}|[1-9]{1}\d{1}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1}|[1-9]{1}\d{1}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1}|[1-9]{1}\d{1}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1}|[1-9]{1}\d{1}|1\d\d|2[0-4]\d|25[0-5]))/i,
            attr_hints: /(ip)/i,
            value: "192.168.2.3"
        },
        COMPANY: {
            hints: /(企\s*业)|(公\s*司)|(company)/i,
            attr_hints: /(company)/i,
            value: "example"
        },
        NAME: {
            hints: /(名)|(说\s*明)|(称\s*呼)|(name)/i,
            attr_hints: /(username)|(name)|(user)|(usr)/i,
            value: "admin"
        },
        PHONE: {
            hints: /(手\s*机)|(电\s*话)|(号\s*码)|(座\s*机)|(phone)|(mobile)|(cell)/i,
            attr_hints: /(phone)|(mobile)|(cell)/i,
            value: TYPES.tel
        },
        EMAIL: {
            hints: /(邮\s*件)|(邮\s*箱)|(mail)/i,
            attr_hints: /(mail)/i,
            value: TYPES.email
        },
        PASSWORD: {
            hints: /(密\s*码)|(passw)/i,
            attr_hints: /(passw)/i,
            value: TYPES.password
        },
        NUMBER: {
            hints: /(长\s*度)|(时\s*间)|(大\s*小)|(值)|(数)|(端\s*口)|(length)|(size)|(time)|(number)|(digit)/i,
            attr_hints: /(length)|(size)|(time)|(number)|(digit)/i,
            value: 8
        },
        ADDRESS: {
            hints: /(地\s*址)|(位\s*置)|(addr)|(location)/i,
            attr_hints: /(addr)|(location)/i,
            value: "rock street"
        },
        ID: {
            hints: /(身\s*份\s*证)/i,
            attr_hints: /(身\s*份\s*证)/i,
            value: "110104199411127132"
        },
        ATTACHMENT: {
            hints: /(附\s*件)|(文\s*件)/i,
            attr_hints: /(attachment)/i,
            value: "admin.pdf"
        },
        DATE: {
            hints: /(日\s*期)/i,
            attr_hints: /(date)/i,
            value: "2019-09-12"
        },
        TIME: {
            hints: /(时\s*间)/i,
            attr_hints: /(time)/i,
            value: "2019-09-05 13:41:08"
        }
    }

    function setInput(element, text) {
        element.value = text;
        ["input", "click", "change", "blur"].forEach((event) => {
            const changeEvent = new Event(event, { bubbles: true, cancelable: true });
            element.dispatchEvent(changeEvent);
        });
    }

    function match(hint) {
        if (!hint) {
            return
        }
        hint = hint.toLowerCase()
        for (let input_type in HINTS) {
            let type = HINTS[input_type]
            if (-1 !== hint.search(type.hints) || -1 !== hint.search(type.attr_hints)) {
                return type.value;
            }
        }
    }

    function findLabel(el, max) {
        for (let i = 0; i < max && el; i++) {
            el = el.parentNode
            let labels = el.getElementsByTagName("label");
            if (labels.length == 1) {
                return labels[0];
            } else if (labels.length > 1) {
                return
            }
        }
    }

    function guess(el) {
        for (let tag of [el.id, el.name, el.placeholder, el.innerHTML]) {
            let value = match(tag);
            if (value != null) {
                return value
            }
        }

        let label = findLabel(el, 5)
        if (label != null) {
            for (let tag of [label.getAttribute('for'), label.innerHTML]) {
                let value = match(tag);
                if (value != null) {
                    return value
                }
            }
        }
        return DEFAULT
    }

    function fill(el) {
        if (el.type == 'checkbox') {
            el.checked || el.click()
            return
        }
        if (el.readOnly || el.value) {
            return
        }
        if (el.type == 'number' || el.type == 'range') {
            setInput(el, el.min || el.max || "123456")
        } else {
            let text = TYPES[el.type] || guess(el)
            setInput(el, text)
        }
    }
    return fill
}()

function fillInputs() {
    for (let el of document.getElementsByTagName("input")) {
        fill(el)
    }
    for (let el of document.getElementsByTagName("textarea")) {
        fill(el)
    }
}