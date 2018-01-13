var MizLang = (function () {
    function mizlang() {
        
    }

    mizlang.AddLangsPack = function (langsPack) {
        
    }
    mizlang.AddLangPack = function (langPack) {
        
    }
    mizlang.AddLangs = function (langs, key, values) {
        
    }
    mizlang.AddLang = function (lang, key, value) {
        
    }
    mizlang.AddDefaultLang = function (key, value) {
        
    }
    mizlang.GetLang = function (lang, key) {
        
    }
    mizlang.GetDefaultLang = function (key) {
        
    }
    mizlang.SetDefaultLang = function (lang) {
        
    }

    return mizlang;
})();

var MizGuid = function (bit) {
    var b = bit || 8,
        a = [],
        STR = "0123456789abcdef";
        for (var i=0; i<b; i++) {
            a.push(STR[Math.random()*16|0]);
        }
        return a.join("");
}

String.prototype.MizEncode = function () {
    return this.replace(
        /[\r\n\|\\;]/g,
        function (m) {
            return {"\r": "\\n", "\n": "\\n", "|": "\\d", "\\": "\\m", ";": "\\D"}[m];
        }
    );
}
String.prototype.MizDecode = function () {
    return this.replace(
        /\\[nDmd]/g,
        function (m) {
            return {"\\n": "\n", "\\D": ";", "\\m": "\\", "\\d": "|"}[m];
        }
    );
}
String.prototype.MizSplit = function (callback, num) {
    // ;
}
String.prototype.MizDelimiter = function (callback, num) {
    // |
}
Array.prototype.MizTilps = function () {
    
}
Array.prototype.MizRetimiled = function () {
    
}

Element.prototype.MizBind = function (mizObject) {
    this.MizObject = mizObject;
}
Element.prototype.MizUnbind = function () {
    this.MizObject = null;
}
Element.prototype.MizUpTo = function (className) {
    if (this.classList.contains(className))
        return this;
    else
        return this.parentElement ? this.parentElement.MizUpTo(className) : false;
}
Node.prototype.ChainAppend = function (ele) {
    this.appendChild(ele);
    var t = document.createTextNode(" ");
    this.appendChild(t);
    return this;
}