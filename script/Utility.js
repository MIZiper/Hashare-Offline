var MizLang = {
    _langs:[],
    _defaultLang:"",
    AddLangsPack:function(langsPack){
        /*
        {
            langs:["zh-cn","en"],
            pack:{
                "key1":["value1_zh-cn","value1_en"],
                "key2":["value2_zh-cn","value2_en"]
            }
        }
        */
        for (var i in langsPack.langs) {
            var lang = langsPack.langs[i];
            this._langs[lang] = this._langs[lang] || [];
            var pack = this._langs[lang];
            for (var j in langsPack.pack) {
                pack[j] = langsPack.pack[j][i] || null;
            }
        }
    },
    AddLangPack:function(langPack){
        /*
        {
            lang:"zh-cn",
            pack:{
                "key1":"value1",
                "key2":"value2"
            }
        }
        */
        var lang = langPack.lang;
        this._langs[lang] = this._langs[lang] || [];
        var pack = this._langs[lang];
        for (var j in langPack.pack) {
            pack[j] = langPack.pack[j];
        }
    },
    AddLangs:function(langs,key,values){
        /* langs:["zh-cn","en"], key:"key1", values:["value1_zh-cn","value1_en"] */
        for (var i in langs) {
            var lang = langs[i];
            this._langs[lang] = this._langs[lang] || [];
            var pack = this._langs[lang];
            pack[key] = values[i] || null;
        }
    },
    AddLang:function(lang,key,value){
        /* lang:"zh-cn", key:"key1", value:"value1" */
        this._langs[lang] = this._langs[lang] || [];
        var pack = this._langs[lang];
        pack[key] = value;
    },
    AddDefaultLang:function(key,value){
        /* key:"key1", value:"value1" */
        if (this._defaultLang) {
            var lang = this._defaultLang;
            this._langs[lang] = this._langs[lang] || [];
            var pack = this._langs[lang];
            pack[key] = value;
        }
    },
    GetLang:function(lang,key){
        /* lang:"zh-cn", key:"key1" */
        var pack = this._langs[lang];
        if (pack && pack[key]) {
            return pack[key];
        } else {
            for (var l in this._langs) {
                pack = this._langs[l];
                if (pack[key]) return pack[key];
            }
        }
        return "Value not defined by this key!";
    },
    GetDefaultLang:function(key){
        /* key:"key1" */
        return this.GetLang(this._defaultLang,key);
    },
    SetDefaultLang:function(lang){
        /* lang:"zh-cn" */
        this._defaultLang = lang;
    }
}

var MizDate = (function(){
    function C(dateStr){
        this.DateObj = new Date(dateStr);
        this.IsDate = !isNaN(this.DateObj.getDate());
    }
    
    var langsPack = {
        langs:["zh-cn","en"],
        pack:{
            "date-yesterday":["\u6628\u5929","Yesterday"],
            "date-today":["\u4ECA\u5929","Today"],
            "date-tomorrow":["\u660E\u5929","Tomorrow"],
            "date-notset":["\u672A\u8BBE\u7F6E","UnSet"],
        }
    }
    MizLang.AddLangsPack(langsPack);
    
    C.prototype.toString4Input = function(){
        return this.IsDate ? this.DateObj.toISOString().substr(0,10) : "";
    }
    C.prototype.toString = function(){
        var key;
        if (this.IsDate) {
            switch ((this.DateObj-new Date(C.Today))) {
                    case 0: key="date-today";break;
                    case -86400000: key="date-yesterday";break;
                    case 86400000: key="date-tomorrow";break;
                    default: return this.DateObj.toLocaleDateString();
            }
        } else {
            key = "date-notset";
        }
        return MizLang.GetDefaultLang(key);
    }
    C.Today = (function(d){
        return (function(y,m,d){
            return y+"-"+(m<10?"0"+m:m)+"-"+(d<10?"0"+d:d);
        })(d.getFullYear(),d.getMonth()+1,d.getDate());
    })(new Date());
    C.ConvertInput2CtrlString = function(dateStr){
        return dateStr;
    }
    
    return C;
}());

String.prototype.MizEncode = function(){
    return this.replace(
        /[\r\n\|\\;]/g,
        function(m){
            return {"\r":"\\n","\n":"\\n","|":"\\d","\\":"\\m",";":"\\D"}[m];
        }
    );
}
String.prototype.MizDecode = function(){
    return this.replace(
        /\\[nDmd]/g,
        function(m){
            return {"\\n":"\n","\\D":";","\\m":"\\","\\d":"|"}[m];
        }
    );
}

Element.prototype.MizBind = function(mizObject) {this.MizObject = mizObject;}
Element.prototype.MizUnbind = function() {this.MizObject = null;}
Element.prototype.MizUpTo = function(className) {
    // IEs<10 don't support classList
    if (this.classList.contains(className)) return this;
    else return this.parentElement ? this.parentElement.MizUpTo(className) : false;
}

var MizGuid = function(bt){
    var b = bt || 8;
    var a = [];
    var STR = "0123456789abcdef";
    for (var i=0; i<b; i++){
        a.push(STR[Math.random()*16|0]);
    }
    return a.join("");
}