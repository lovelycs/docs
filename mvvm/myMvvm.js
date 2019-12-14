window.myMvvm = class Mvvm {
    constructor({
        data, elInfoList, watch,
        beforeCreate, created, beforeMount, mounted
    }) {
        // 依赖项
        this.deps = {};

        beforeCreate && beforeCreate.call(this);
        initData(this, data);
        created && created.call(this);

        beforeMount && beforeMount.call(this);
        initElInfo(this, elInfoList);
        mounted && mounted.call(this);

        initWatch(this, watch);
    }
}

function initData(_this, data) {
    for(let key in data) {
        _this[key] = data[key];
        _this.deps[key] = [];

        Object.defineProperty(_this, key, {
            enumerable: false,
            configurable: false,
            get: () => {
                return data[key];
            },
            set: (val) => {
                if (val === data[key]) {
                    return;
                }

                _this.deps[key].forEach((dep) => {
                    dep(val, data[key]);
                });
                data[key] = val;
            }
        });
    }
}

function initElInfo(_this, elInfoList) {
    elInfoList.forEach((elInfo) => {
        let element = elInfo.el;
        let key = elInfo.value;
    
        _set(_this[key]);
    
        _this.deps[key] = _this.deps[key] || [];
        _this.deps[key].push(function(val, oldVal) {
            if (val === oldVal) {
                return;
            }
            _set(val);
        }.bind(_this));

        function _set(val) {
            if (element.tagName === 'INPUT') {
                element.value = val;
                element.addEventListener('input', function(e) {
                    _this[key] = e.target.value;
                });
            } else {
                element.innerHTML = val;
            }
        }
    });
}

function initWatch(_this, watch) {
    for(let key in watch) {
        _this.deps[key] = _this.deps[key] || [];
        _this.deps[key].push(watch[key].bind(_this));
    }
}
