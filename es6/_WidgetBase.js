import _BaseClass from './_BaseClass';
import {default as lang, on} from './lang';

const DOM_ATTATCH_POINT_PROPNAME = 'data-dom-point';

/*
 *  data-dom-event="click:onClick,dbclick:onDbclick"
 *  https://developer.mozilla.org/en-US/docs/Web/Events
 */
const DOM_ATTATCH_EVENT_PROPNAME = 'data-dom-event';

export default class _WidgetBase extends _BaseClass {

    static fillContent(wgt, ref) {
        let dest = wgt.containerNode;
        if(dest){
            while(ref.hasChildNodes()){
                dest.appendChild(ref.firstChild);
            }
        }
    }

    constructor(params, domPos) {
        super(params);/* postscript is invoked here by parent class. */
        this.postCreate();
        domPos && this.placeAt(domPos);
    }

    postscript() {
        this.buildRendering();
        this.buildDomPoints();
        super.postscript();
        this.bindEvents();
    }

    postCreate() {}

    startup() {

    }

    buildRendering() {
        if (this._domnode != null) {return;}
        this._domnode = lang.nodeFromHTML(this.template);
    }

    buildDomPoints() {
        let domPoints = this.domPoints = {};

        [...this.domNode.querySelectorAll(`[${DOM_ATTATCH_POINT_PROPNAME}]`)].forEach(p => {
            let propName = p.getAttribute(DOM_ATTATCH_POINT_PROPNAME);
            domPoints[propName] = p;
        });
    }

    bindEvents() {
        [...this.domNode.querySelectorAll(`[${DOM_ATTATCH_EVENT_PROPNAME}]`)].forEach(p => {
            let eventString = p.getAttribute(DOM_ATTATCH_EVENT_PROPNAME),
                eventsConfig = lang.parseKVPair(eventString);
            for(let eventType in eventsConfig) {
                let cb = this[eventsConfig[eventType]].bind(this);
                this.own(on(p, eventType, e => {
                    cb(e);
                }));
            }
        });
    }

    onWidgetReady() {
        this._processPlugin((plugin) => {
            plugin.onWidgetReady();
        }, '_afterDomReadyLoaded');
    }

    get __isNewWidget() {
        return true;
    }

    get domNode() {
        if (!this._domnode) {
            console.log('Widget lifecycle order is broken by retrieving domNode before buildRendering.');
            this.buildRendering();
        }

        return this._domnode;
    }

    get template() {
        return '';
    }

    placeAt(ref, position) {
        if (position == 'replace') {
            this.replaceAt(ref);
        } else {
            ref.appendChild(this.domNode);
        }
        this.onWidgetReady();
    }

    replaceAt(ref) {
        _WidgetBase.fillContent(this, ref);

        ref.parentNode.replaceChild(this.domNode, ref);
    }

    destroy() {
        let node = this.domNode;
        node.parentNode && node.parentNode.removeChild(node);
        super.destroy();
    }

}
