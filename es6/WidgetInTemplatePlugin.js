import lang from './lang';
import aspect from './aspect';
import {_WidgetPlugin} from './_Plugin';
import _WidgetBase from "./_WidgetBase";

const WIDGET_CLASS_PROPNAME = 'data-widget-class';
//const WIDGET_PROPS_PROPNAME = 'data-widget-props';
//const WIDGET_EVENTS_PROPNAME = 'data-widget-events';

export default class WidgetInTemplatePlugin extends _WidgetPlugin {
    /* create widgets. */
    init() {
        super.init();
        /* intend to create child widgets here. but query host domNode is needed, which will break widget lifecycle. */
    }

    createChildWidgets() {
        let host = this.host,
            candidateClasses = host.widgetClassesInTemplate,
            widgets = this.widgets = {};

        this.widgetConfigs.forEach(({className, params}) => {
            let classDef = candidateClasses[className],
                ref = params.widgetRef;

            widgets[ref] = host[ref] = new classDef(params);
        });
    }

    /* bind events and place widgets into host DOM tree.
     * widget replace position can be overridden with parameter widgetInTempReplace.
     */
    load() {
        super.load();
        this.createChildWidgets();

        this.widgetConfigs.forEach(({params, eventDefs, oDOM}) => {
            let w = this.widgets[params.widgetRef],
                host = this.host;

            for(let [evtName, handlerName] of Object.entries(eventDefs)) {
                let evtHandler = host[handlerName];
                if(evtHandler == null) {
                    console.error(`trying to attach event handler for event ${evtName}, but the handler ${handlerName} is not defined in host.`);
                }
                this.own(aspect.after(w, evtName, host[handlerName].bind(host), true));
            }

            !w.__isNewWidget && _WidgetBase.fillContent(w, oDOM);
            !params.globalAttach && w.placeAt(oDOM, this.widgetInTempReplace || 'replace');
        });
    }

    /* do something when host DOM is attached into document. */
    onWidgetReady() {
        this.widgetConfigs.forEach(({params}) => {
            let ref = params.widgetRef,
                w = this.widgets[ref];
            w.startup();
        });
    }

    get widgetDomNodes() {
        return [...this.host.domNode.querySelectorAll(`[${WIDGET_CLASS_PROPNAME}]`)];
    }

    get widgetConfigs() {
        return this.widgetDomNodes.map(wDefDom => ({
            className: wDefDom.dataset.widgetClass,
            params: lang.parseKVPair(wDefDom.dataset.widgetProps),
            eventDefs: lang.parseKVPair(wDefDom.dataset.widgetEvents),
            oDOM: wDefDom
        }));
    }
}

lang.cachedClass(WidgetInTemplatePlugin);
