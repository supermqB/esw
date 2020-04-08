const Utils = {
    rateLimitedFunc: function (func, interval) {
        let handler,
            rFunc = function (...args) {
                if (!handler) {
                    handler = setTimeout(() => {
                        func(...args);
                        handler = null;
                    }, interval);
                }
            }
        rFunc.remove = () => {
            handler && clearTimeout(handler);
        }

        return rFunc;
    },

    persist: function (key, val, expireTime) {
        if (expireTime != null) {
            let obj = {
                re: val,
                expiretimeStamp: Date.now() + expireTime
            }
            localStorage.setItem(key, JSON.stringify(obj));
        } else {
            let storedObj = localStorage.getItem(key);
            if (storedObj != null) {
                let parsedObj = JSON.parse(storedObj);
                if (parsedObj.expiretimeStamp > Date.now()) {
                    return parsedObj.re;
                }
            }
        }

    },

    buildURLParams: function (obj) {
        let ar = [];
        for (let key in obj) {
            ar.push(key + "=" + obj[key]);
        }
        return ar.join('&');
    },

    generateID: function(len){
        let arr = new Uint8Array((len || 40) / 2);
        window.crypto.getRandomValues(arr)
        return Array.from(arr, dec => ('0' + dec.toString(16)).substr(-2)).join('');
    },

    soccer: function(x, y, z) {
        for(let i = 0, j = arguments.length; i < j ; i++) {
            console.group("Strategy " + i);
            let ar = [...arguments],
                cath = ar.splice(i, 1);
            let result = 2 * cath - 4/* ar[0] - ar[1] */;
            if(result > 0) {
                console.log("profit: " + result * 50);
                let loss1 = ar[0] - 4,
                    loss2 = ar[1] - 4;

                let maxLose = Math.min(loss1, loss2);
                console.log("Maximum Lose: "+  maxLose * 50);

                let ratio = result / maxLose * -1,
                    winGap = result + maxLose;
                console.log("win ratio: "+ ratio);
                console.log("win winGap: "+ winGap * 50);
                //if(ratio > 2) {
                    console.error("Bet as this strategy:");
                    console.log("100 * [" + cath +"], " + "50 * ["+ ar[0]+"], 50 * ["+ ar[1]+"]");
                //}
            }
            console.groupEnd("Strategy " + i);
        }
    }
}

export default Utils;