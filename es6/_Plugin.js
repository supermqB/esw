import _BaseClass from './_BaseClass';
import aspect from './aspect';

export default class _Plugin extends _BaseClass {
    init() {
        for(let [name, overrideFunc] of Object.entries(this.overrides)) {
            if (this.host[name] == null) {
                console.log(`function ${name} is not declared in current class, a placeholder is using.`);
                this.host[name] = function () {};
            }

            let originalFunc = this.host[name].bind(this.host);

            overrideFunc = overrideFunc.bind(this.host);

            this.host[name] = (...args) => {
                return overrideFunc(originalFunc, ...args);
            }
        }
    }

    load() {
        this.exposedFuncs.forEach(([pluginFunc, hostFunc]) => this.own(aspect.after(this.host, hostFunc, this[pluginFunc].bind(this), true)));
    }

    get overrides() {
        return {};
        /*{onClose: function (hostFunc, args) { //arrow function can't be used here, because it can't be change scope by bind.
            // some logic
            hostFunc(...args);
            // some logic
        }}*/
    }

    /* defined the function name here for exposing to host instance. data structure is like this:
     *   [
     *      ['plugin_f1', 'host_f1'],
     *      ['plugin_f2', 'host_f2']
     *   ]
     */
    get exposedFuncs() {
        return [];
    }
}

export class _WidgetPlugin extends _Plugin {
    /* The interface after postcreate. */
    onWidgetReady() {

    }
}

export class _WrapperPlugin extends _Plugin {

    get host() {
        return this._host.getRealHost();
    }

    set host(val) {
        this._host = val;
    }
}
