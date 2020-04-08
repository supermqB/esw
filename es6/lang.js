function mix(mainClass, ...mixins) {
    class mixedClass extends mainClass {}

    for (let mixin of mixins) {
        copyProperties(mixedClass, mixin);
        copyProperties(mixedClass.prototype, mixin.prototype);
    }

    return mixedClass;
}

function copyProperties(target, source) {
    for (let key of Reflect.ownKeys(source)) {
        if (key !== "constructor" && key !== "prototype" && key !== "name") {
            let desc = Object.getOwnPropertyDescriptor(source, key);
            Object.defineProperty(target, key, desc);
        }
    }
}

function parseKVPair(str) {
    str = str || '';
    return JSONParse(`{${str}}`);
}

/* JSON parser. */
function JSONParse(str) {
    return eval(`(${str})`);
}

/* Cache the property values in an instance of this Class to prevent calling the get method too many times.
 * Especially, when we defined complicated logic for calculating the property value.
 * with this help function, we escape from defining inner properties for each get method verbosely.
 */
function cachedClass(clazz) {
    let proto = clazz.prototype,
        descs = Object.getOwnPropertyDescriptors(proto);

    for(let [key, desc] of Object.entries(descs)) {

        if(desc.get == null) {continue;}

        Object.defineProperty(proto, key, Object.assign({}, desc, {get: function() {
            let innerKey = `_ik_${key}`;
            if(this[innerKey] != null) {
                return this[innerKey];
            }
            return this[innerKey] = desc.get.apply(this);
        }}));
    }
}

function clone(obj) {
    return JSONParse(JSON.stringify(obj));
}

const container = document.createElement('div');

export function nodeFromHTML(html) {
    container.innerHTML = html;
    return container.removeChild(container.firstElementChild);
}

const loadfuncs = [];
function addOnload(f) {
    loadfuncs.push(f)
}

window.onload = function() {
    loadfuncs.forEach(f => {
        f();
    });
}

function getDOMBox(domNode) {
    let box = domNode.getBoundingClientRect();
    if(!box.height || !box.width){
        box = this.clone(box);
        box.height = box.bottom - box.top;
        box.width = box.right - box.left;
    }
    return box;
}

function getScrollPos(domNode) {
    return {t: domNode.scrollTop, l: domNode.scrollLeft, h: domNode.scrollHeight, w: domNode.scrollWidth};
}

export default {
    mix,
    clone,
    copyProperties,
    JSONParse,
    parseKVPair,
    cachedClass,
    nodeFromHTML,
    addOnload,
    getDOMBox,
    getScrollPos
}

export function on(target, eventType, func, options) {
    let opts = !!options && options;
    target.addEventListener(eventType, func, opts);
    return {
        remove: function() {
            target.removeEventListener(eventType, func, opts);
        }
    }
}
