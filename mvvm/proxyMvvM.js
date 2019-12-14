window.proxyMvvm = class Mvvm {
    constructor({
        elInfoList, watch,
        beforeCreate, created, beforeMount, mounted
    }) {
        // 依赖项
        let deps = {};

        beforeCreate && beforeCreate.call(this);
        let _proxyThis = window.proxyObj(this, (oldValue, value, key)=>{
            console.log(oldValue, value, key)

            deps[key] = deps[key] || [];
            deps[key].forEach((dep) => {
                dep(value, oldValue);
            });
        });
        created && created.call(this);

        beforeMount && beforeMount.call(this);
        initElInfo(deps, _proxyThis, elInfoList);
        mounted && mounted.call(this);

        initWatch(deps, watch, _proxyThis);

        return _proxyThis;
    }
}

function initElInfo(deps, _proxyThis, elInfoList) {
    elInfoList.forEach((elInfo) => {
        let element = elInfo.el;
        let key = elInfo.value;
    
        _set(_proxyThis[key]);
    
        deps[key] = deps[key] || [];
        deps[key].push(function(val, oldVal) {
            if (val === oldVal) {
                return;
            }
            _set(val);
        }.bind(_proxyThis));

        function _set(val) {
            if (element.tagName === 'INPUT') {
                element.value = val;
                element.addEventListener('input', function(e) {
                    _proxyThis[key] = e.target.value;
                });
            } else {
                element.innerHTML = val;
            }
        }
    });
}

function initWatch(deps, watch, _this) {
    for(let key in watch) {
        deps[key] = deps[key] || [];
        deps[key].push(watch[key].bind(_this));
    }
}
