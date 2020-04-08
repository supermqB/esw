import Destroyable from './Destroyable';

export default class _BaseClass extends Destroyable {
    constructor(params) {
        super();
        this._setParams(params);
        this._initPlugin(this.params);
        this.postscript();
        this._loadPlugin();
    }

    defineParams() {
        return {};
    }

    _setParams(params) {
        let classParams = this.defineParams();
        this.params = Object.assign({}, classParams, params);
    }

    postscript() {
        Object.assign(this, this.params);
    }

    get pluginDefs() {
        return {
            plugins: [],
            'static': [],
            dependencies: {/*pName: []*/}
        };
    }

    _initPlugin(params) {
        let plugins = this.plugins = {},
            defs = this.pluginDefs;

        (defs.plugins || defs).forEach((pClass) => {
            plugins[pClass.name] = new pClass(params);
        });

        this._processPlugin((plugin) => {
            plugin.host = this;
            plugin.init();
        }, '_initilaized');
    }

    _loadPlugin() {
        this._processPlugin((plugin) => {
            plugin.load();
        }, '_loaded');
    }

    _processPlugin(process/*function*/, flagName) {
        let plugins = this.plugins,
            defs = this.pluginDefs,
            staticLoads = defs.static || [],
            depends = defs.dependencies || {};

        staticLoads.map((pName) => plugins[pName]).forEach(plugin => processPClass(plugin));

        for(let pName in plugins) {
            processPClass(plugins[pName]);
        }

        function processPClass(plugin) {
            let pName = plugin.constructor.name,
                pDepends = depends[pName];

            if(pDepends) {
                pDepends.forEach((_pName) => {
                    let p = plugins[_pName];
                    !p[flagName] && processPClass(p);
                });
            }
            process(plugin);
            plugin[flagName] = true;
        }
    }

    destroy() {
        let plugins = this.plugins;
        for(let pName in plugins) {
            plugins[pName].destroy();
        }
        this.plugins = null;
        super.destroy();
    }
}
