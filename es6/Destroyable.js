import aspect from './aspect';
export default class Destroyable {
    destroy() {
        this._destroyed = true;
    }

    own(...args) {
        [...args].forEach((handle) => {
            var destroyMethodName =
                "destroyRecursive" in handle ? "destroyRecursive" :
                "destroy" in handle ? "destroy" :
                "remove";

            var odh = aspect.before(this, "destroy", function(preserveDom) {
                handle[destroyMethodName](preserveDom);
            });

            var hdh = aspect.after(handle, destroyMethodName, function() {
                odh.remove();
                hdh.remove();
            }, true);
        }, this);

        return args;
    }
}
