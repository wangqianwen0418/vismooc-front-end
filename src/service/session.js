'use strict'
var data = {};

export default {
    get(name){
        if(name) return data[name];
        return undefined;
    },
    set(name,value){
        data[name] = value;
    }
}