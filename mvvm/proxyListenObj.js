window.proxyObj = function(obj, cb, _k) {
    for (let key in obj) {
        if (typeof obj[key] === 'object') {
            obj[key] = proxyObj(obj[key], cb, _k || key);
        }
    }

    return new Proxy(obj, {
        get: function(target, key, receiver) {
            return Reflect.get(target, key, receiver);
        },
        set: function(target, key, val, receiver) {
            if (target[key] === val) {
                return target;
            }

            if (typeof val === 'object') {
                val = proxyObj(val, cb, _k || key);
            }

            cb(target[key], val, _k || key);
            return Reflect.set(target, key, val, receiver);
        }
    })
}
