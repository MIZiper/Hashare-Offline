var ControlTypeBase = (function(){
    function C(ctrlString,itemTypeObj,ctrlType){
        this.ControlString = ctrlString;
        this.ParentItemTypeObject = itemTypeObj;
        
        var div = document.createElement("div");
        div.className = "ctrl ctrl-" + ctrlType;
        this.ControlDomObject = div;
        div.MizBind(this);
        
        this.eleLabel = document.createElement("label");
        div.appendChild(this.eleLabel);
    }
    
    C.prototype.SetLabel = function(labelKey){
        this.eleLabel.textContent = MizLang.GetDefaultLang(labelKey);
    }
    C.prototype.Tini = function(){
        this.ParentItemTypeObject = null;
        this.ControlDomObject.MizUnbind();
        this.ControlDomObject = null;
        this.eleLabel = null;
        /*
            In order to define only one Tini,
            this.Elements can be used?
            BTW, is there only one element in every control?
            And, seems some elements need to unbind event.
        */
    }
    C.prototype.GetValue = function(){
        return this.ControlString;
    }
    
    C.GetProto = function(childClass){
        var P = Object.create(C.prototype);
        childClass.prototype = P;
        P.constructor = childClass;
        return P;
    }
    
    return C;
})();



var CtrlShow_Inputbox = (function(){
    function C(ctrlString,itemTypeObj){
        ControlTypeBase.call(this,ctrlString,itemTypeObj,C.TYPENAME);
        /*
            Not sure what will happen caused by "C.TYPENAME" here.
            Might be the same to use CtrlShow_Inputbox or this.constructor.
        */
        this.eleP = document.createElement("p");
        this.ControlDomObject.appendChild(this.eleP);
        this.SetValue(ctrlString,true);
    }
    var P = ControlTypeBase.GetProto(C);
    
    C.TYPENAME = "inputbox-show";
    
    P.SetValue = function(ctrlString,inner){
        if (!inner) {
            this.ControlString = ctrlString;
        }
        this.eleP.textContent = ctrlString.MizDecode();
    }
    /*
    P.GetValue = function(){
        return this.ControlString;
        //Seems same for most cases, especially CtrlShow_Type, so put it to ControlTypeBase
    }
    
    P.Tini = function(){
        this.eleP = null;
        ControlTypeBase.prototype.Tini.call(this);
        //No need to manually disconnect with element.
    }
    */
    
    return C;
})();

var CtrlEdit_Inputbox = (function(){
    function C(ctrlString,itemTypeObj){
        ControlTypeBase.call(this,ctrlString,itemTypeObj,C.TYPENAME);
        
        var input = document.createElement("input");
        input.type = "text";
        this.eleInput = input;
        this.ControlDomObject.appendChild(input);
        this.SetValue(ctrlString,true);
    }
    var P = ControlTypeBase.GetProto(C);
    
    C.TYPENAME = "inputbox-edit";
    
    P.SetValue = function(ctrlString,inner){
        if (!inner) this.ControlString = ctrlString;
        /*the para 'inner' here is of no use for this control*/
        this.eleInput.value = ctrlString.MizDecode();
    }
    P.GetValue = function(){
        /*this.ControlString = this.eleInput.value.MizEncode(); ???*/
        return this.eleInput.value.MizEncode();
    }
    
    return C;
})();

var CtrlShow_RawInput = (function(){
    function C(ctrlString,itemTypeObj){
        ControlTypeBase.call(this,ctrlString,itemTypeObj,C.TYPENAME);
        
        this.eleP = document.createElement("p");
        this.ControlDomObject.appendChild(this.eleP);
        this.SetValue(ctrlString,true);
    }
    var P = ControlTypeBase.GetProto(C);
    
    C.TYPENAME = "rawinput-show";
    
    P.SetValue = function(ctrlString,inner){
        if (!inner) {
            this.ControlString = ctrlString;
        }
        this.eleP.textContent = ctrlString;
    }
    
    return C;
})();

var CtrlEdit_RawInput = (function(){
    function C(ctrlString,itemTypeObj){
        ControlTypeBase.call(this,ctrlString,itemTypeObj,C.TYPENAME);
        
        this.eleInput = document.createElement("textarea");
        this.ControlDomObject.appendChild(this.eleInput);
        this.SetValue(ctrlString,true);
    }
    var P = ControlTypeBase.GetProto(C);
    
    C.TYPENAME = "rawinput-edit";
    
    P.SetValue = function(ctrlStr,inner){
        if (!inner) this.ControlString = ctrlStr;
        this.eleInput.value = ctrlStr;
    }
    P.GetValue = function(){
        return this.eleInput.value.split("\n").join("");
    }
    
    return C;
})();

var CtrlShow_Link = (function(){
    function C(ctrlString,itemTypeObj){
        ControlTypeBase.call(this,ctrlString,itemTypeObj,C.TYPENAME);
        
        this.eleP = document.createElement("p");
        this.eleA = null;
        this.ControlDomObject.appendChild(this.eleP);
        this.SetValue(ctrlString,true);
    }
    var P = ControlTypeBase.GetProto(C);
    
    C.TYPENAME = "link-show";
    
    P.SetValue = function(ctrlStr,inner){
        if (!inner) this.ControlString = ctrlStr;
        var a = ctrlStr.split("|");
        if (!a[1]) {
            if (this.eleA) {
                this.eleP.removeChild(this.eleA);
                this.eleA = null;
            }
            this.eleP.textContent = a[0].MizDecode();
        } else {
            if (!this.eleA) {
                this.eleP.textContent = "";
                this.eleA = document.createElement("a");
                this.eleP.appendChild(this.eleA);
            }
            this.eleA.textContent = a[0].MizDecode();
            this.eleA.href = a[1].MizDecode();
        }
    }
    
    return C;
})();

var CtrlEdit_Link = (function(){
    function C(ctrlStr,itemTypeObj){
        ControlTypeBase.call(this,ctrlStr,itemTypeObj,C.TYPENAME);
        
        var inputTitle = document.createElement("input");
        inputTitle.placeholder = MizLang.GetDefaultLang("ctrl-link-title");
        inputTitle.type = "text";
        var inputLink = document.createElement("input");
        inputLink.placeholder = MizLang.GetDefaultLang("ctrl-link-link");
        inputLink.type = "url";
        this.ControlDomObject.appendChild(inputTitle);
        this.ControlDomObject.appendChild(inputLink);
        this.eleTitle = inputTitle;
        this.eleLink = inputLink;
        this.SetValue(ctrlStr,true);
    }
    var P = ControlTypeBase.GetProto(C);
    
    C.TYPENAME = "link-edit";
    var langsPack = {
        langs:["zh-cn","en"],
        pack:{
            "ctrl-link-title":["\u6807\u9898","Title"],
            "ctrl-link-link":["\u94FE\u63A5","Link Address"]
        }
    }
    MizLang.AddLangsPack(langsPack);
    
    P.SetValue = function(ctrlStr,inner){
        if (!inner) this.ControlString = ctrlStr;
        var a = ctrlStr.split("|");
        this.eleTitle.value = a[0].MizDecode();
        this.eleLink.value = a[1] ? a[1].MizDecode() : "";
    }
    P.GetValue = function(){
        return this.eleTitle.value.MizEncode() + "|" + this.eleLink.value.MizEncode();
    }
    
    return C;
})();

var CtrlShow_Text = (function(){
    function C(ctrlStr,itemTypeObj){
        ControlTypeBase.call(this,ctrlStr,itemTypeObj,C.TYPENAME);
        
        this.eleP = document.createElement("p");
        this.ControlDomObject.appendChild(this.eleP);
        this.SetValue(ctrlStr,true);
    }
    var P = ControlTypeBase.GetProto(C);
    
    C.TYPENAME = "text-show";
    
    P.SetValue = function(ctrlStr,inner){
        if (!inner) this.ControlString = ctrlStr;
        var a = ctrlStr.MizDecode().split("\n");
        var e,
            p = this.eleP,
            frag = document.createDocumentFragment();
        while (e=p.firstChild) p.removeChild(e);
        for (var i in a) {
            var t = document.createTextNode(a[i]);
            frag.appendChild(t);
            var br = document.createElement("br");
            frag.appendChild(br);
        }
        p.appendChild(frag);
    }
    
    return C;
})();

var CtrlEdit_Text = (function(){
    function C(ctrlStr,itemTypeObj){
        ControlTypeBase.call(this,ctrlStr,itemTypeObj,C.TYPENAME);
        
        this.eleText = document.createElement("textarea");
        this.ControlDomObject.appendChild(this.eleText);
        this.SetValue(ctrlStr,true);
    }
    var P = ControlTypeBase.GetProto(C);
    
    C.TYPENAME = "text-edit";
    
    P.SetValue = function(ctrlStr,inner){
        if (!inner) this.ControlString = ctrlStr;
        this.eleText.value = ctrlStr.MizDecode();
    }
    P.GetValue = function(){
        return this.eleText.value.MizEncode();
    }
    
    return C;
})();

var CtrlShow_Toggle = (function(){
    function C(ctrlString,itemTypeObj){
        ControlTypeBase.call(this,ctrlString,itemTypeObj,C.TYPENAME);
        
        var input = document.createElement("input");
        input.type = "checkbox";
        input.addEventListener("change",C.EvtValueChange,false);
        this.eleInput = input;
        
        this.ControlDomObject.appendChild(input);
        this.SetValue(ctrlString,true);
    }
    var P = ControlTypeBase.GetProto(C);
    
    C.TYPENAME = "toggle-show";
    C.EvtValueChange = function(e){
        /*
            'this' is the same as e.target here,
            but not always if the event bubbles
            
            !!!!!
            Here's a question:
            will this event fired by the 'SetValue'
            instead of mouse event?
        */
        var ctrlObj = this.MizUpTo("ctrl").MizObject;
        var ctrlStr = (this.checked ? "1" : "0");
        ctrlObj.SetValue(ctrlStr,false,true);
    }
    
    P.SetValue = function(ctrlString,inner,notify){
        /*I hate such way! function paras are not united.*/
        if (!inner) this.ControlString = ctrlString;
        if (notify) this.ParentItemTypeObject.CollectValue();
        this.eleInput.checked = !!parseInt(ctrlString);
    }
    P.Tini = function(){
        this.eleInput.removeEventListener("change",C.EvtValueChange,false);
        this.eleInput = null;
        ControlTypeBase.prototype.Tini.call(this);
    }
    
    return C;
})();

var CtrlEdit_Toggle = (function(){
    function C(ctrlStr,itemTypeObj){
        ControlTypeBase.call(this,ctrlStr,itemTypeObj,C.TYPENAME);
        var input = document.createElement("input");
        input.type = "checkbox";
        this.eleInput = input;
        this.ControlDomObject.appendChild(input);
        this.SetValue(ctrlStr,true);
    }
    var P = ControlTypeBase.GetProto(C);
    
    C.TYPENAME = "toggle-edit";
    
    P.SetValue = function(ctrlStr,inner){
        if (!inner) this.ControlString = ctrlStr;
        this.eleInput.checked = !!parseInt(ctrlStr);
    }
    P.GetValue = function(){
        return this.eleInput.checked ? "1" : "0";
    }
    
    return C;
})();

var CtrlShow_Select = (function(){
    function C(ctrlStr,itemTypeObj){
        ControlTypeBase.call(this,ctrlStr,itemTypeObj,C.TYPENAME);
        this.Options = [];
        this.eleP = document.createElement("p");
        this.ControlDomObject.appendChild(this.eleP);
    }
    var P = ControlTypeBase.GetProto(C);
    
    C.TYPENAME = "select-show";
    
    P.SetValue = function(ctrlStr,inner){
        if (!inner) this.ControlString = ctrlStr;
        var i = parseInt(ctrlStr);
        var t = this.Options[i] || "";
        this.eleP.textContent = t;
    }
    P.SetOptions = function(options){
        this.Options = options;
        this.SetValue(this.ControlString,true);
    }
    
    return C;
})();

var CtrlEdit_Select = (function(){
    function C(ctrlStr,itemTypeObj){
        ControlTypeBase.call(this,ctrlStr,itemTypeObj,C.TYPENAME);
        this.Options = [];
        this.eleSelect = document.createElement("select");
        this.ControlDomObject.appendChild(this.eleSelect);
    }
    var P = ControlTypeBase.GetProto(C);
    
    C.TYPENAME = "select-edit";
    
    P.SetValue = function(ctrlStr,inner){
        if (!inner) this.ControlString = ctrlStr;
        var i = parseInt(ctrlStr);
        if (isNaN(i)) i=-1;
        this.eleSelect.selectedIndex = i;
    }
    P.GetValue = function(){
        if (this.eleSelect.selectedIndex==-1) {
            return this.ControlString;
        } else {
            return this.eleSelect.selectedIndex.toString();
        }
    }
    P.SetOptions = function(options){
        this.Options = options;
        var e,
            s = this.eleSelect;
        while (e=s.firstChild) s.removeChild(e);
        for (var i in options) {
            (function(t,p){
                var e = document.createElement("option");
                e.textContent = t;
                p.appendChild(e);
            })(options[i],s);
        }
        this.SetValue(this.ControlString,true);
    }
    
    return C;
})();

var CtrlShow_Image = (function(){
    function C(ctrlStr,itemTypeObj){
        ControlTypeBase.call(this,ctrlStr,itemTypeObj,C.TYPENAME);
        
        var i = document.createElement("img");
        i.addEventListener("click",C.EvtShowImage,false);
        i.height = ImageManager.THUMBLENGTH;
        i.width = ImageManager.THUMBLENGTH;
        this.ControlDomObject.appendChild(i);
        this.eleI = i;
        this.SetValue(ctrlStr,true);
    }
    var P = ControlTypeBase.GetProto(C);
    
    C.TYPENAME = "image-show";
    C.EvtShowImage = function(evt) {
        var ctrlObj = this.MizUpTo("ctrl").MizObject;
        MizUI.Display.Image(ctrlObj.GetValue(),function(val){
            URL.revokeObjectURL(val);
        },null);
    }
    
    P.SetValue = function(ctrlStr,inner){
        if (!inner) this.ControlString = ctrlStr;
        ImageManager.GetThumbURL(ctrlStr,(function(ele){
            return function(url) {
                if (url) {
                    ele.src = url;
                    ele.classList.remove("hideme");
                } else {
                    ele.src = "";
                    ele.classList.add("hideme");
                }
            }
        })(this.eleI));
    }
    P.Tini = function(){
        this.eleI.removeEventListener("click",C.EvtShowImage,false);
        this.eleI = null;
        ControlTypeBase.prototype.Tini.call(this);
    }
    
    return C;
})();

var CtrlEdit_Image = (function(){
    function C(ctrlStr,itemTypeObj){
        ControlTypeBase.call(this,ctrlStr,itemTypeObj,C.TYPENAME);
        
        var i = document.createElement("img");
        i.addEventListener("click",C.EvtPickImage,false);
        i.height = ImageManager.THUMBLENGTH;
        i.width = ImageManager.THUMBLENGTH;
        this.ControlDomObject.appendChild(i);
        this.eleI = i;
        this.SetValue(ctrlStr,true);
    }
    var P = ControlTypeBase.GetProto(C);
    
    C.TYPENAME = "image-edit";
    C.EvtPickImage = function(evt){
        var ctrlObj = this.MizUpTo("ctrl").MizObject;
        MizUI.Picker.Image(evt,ctrlObj.GetValue(),(function(ctrl){
            return function(val){ctrl.SetValue(val);}
        })(ctrlObj),null);
    }
    
    P.SetValue = function(ctrlStr,inner){
        if (!inner) this.ControlString = ctrlStr;
        ImageManager.GetThumbURL(ctrlStr,(function(ele){
            return function(url){
                if (url) {
                    ele.src = url;
                } else {
                    ele.src = ImageManager.DEFAUTLIMAGE;
                }
            }
        })(this.eleI));
    }
    P.Tini = function(){
        this.eleI.removeEventListener("click",C.EvtPickImage,false);
        this.eleI = null;
        ControlTypeBase.prototype.Tini.call(this);
    }
    
    return C;
})();

var CtrlShow_Date = (function(){
    function C(ctrlString,itemTypeObj){
        ControlTypeBase.call(this,ctrlString,itemTypeObj,C.TYPENAME);
        
        var p = document.createElement("p");
        this.ControlDomObject.appendChild(p);
        this.eleP = p;
        this.SetValue(ctrlString,true);
    }
    var P = ControlTypeBase.GetProto(C);
    
    C.TYPENAME = "date-show";
    
    P.SetValue = function(ctrlString,inner){
        if (!inner) this.ControlString = ctrlString;
        var d = new MizDate(ctrlString);
        this.eleP.textContent = d.toString();
    }
    
    return C;
})();

/*
var CtrlShow_Hiddendate = (function(){
    Any Difference between this and CtrlShow_Date?
})();
*/

var CtrlEdit_Date = (function(){
    function C(ctrlString,itemTypeObj){
        ControlTypeBase.call(this,ctrlString,itemTypeObj,C.TYPENAME);
        
        var ctrl = null;
        if (C.SupportDateInput) {
            ctrl = document.createElement("input");
            ctrl.type = "date";
        } else {
            ctrl = document.createElement("button");
            ctrl.type = "button";
            ctrl.addEventListener("click",C.EvtPickDate,false);
        }
        
        this.ControlDomObject.appendChild(ctrl);
        this.eleCtrl = ctrl;
        this.SetValue(ctrlString,true);
    }
    var P = ControlTypeBase.GetProto(C);
    
    C.TYPENAME = "date-edit";
    C.EvtPickDate = function(evt) {
        var ctrlObj = this.MizUpTo("ctrl").MizObject;
        MizUI.Picker.Date(evt,ctrlObj.GetValue(),(function(ctrl){
            return function(val){ctrl.SetValue(val);}
        })(ctrlObj),null);
    }
    
    var testInput = document.createElement("input");
    testInput.setAttribute("type","date");
    C.SupportDateInput = (testInput.type=="date");
    
    P.SetValue = function(ctrlStr,inner){
        if (!inner) this.ControlString = ctrlStr;
        var d = new MizDate(ctrlStr);
        if (C.SupportDateInput)
            this.eleCtrl.value = d.toString4Input();
        else
            this.eleCtrl.textContent = d.toString();
    }
    P.GetValue = function(){
        if (C.SupportDateInput)
            return MizDate.ConvertInput2CtrlString(this.eleCtrl.value);
        else
            return this.ControlString;
    }
    P.Tini = function(){
        if (!C.SupportDateInput) this.eleCtrl.removeEventListener("click",C.EvtPickDate,false);
        this.eleCtrl = null;
        ControlTypeBase.prototype.Tini.call(this);
    }
    
    return C;
})();

var CtrlEdit_HiddenDate = (function(){
    function C(ctrlString,itemTypeObj){
        ControlTypeBase.call(this,ctrlString,itemTypeObj,C.TYPENAME);
        
        this.eleP = document.createElement("p");
        this.ControlDomObject.appendChild(this.eleP);
        this.SetValue(ctrlString,true);
    }
    var P = ControlTypeBase.GetProto(C);
    
    C.TYPENAME = "hiddendate-edit";
    
    P.SetValue = function(ctrlStr,inner){
        if (!inner) this.ControlString = ctrlStr;
        if (ctrlStr=="") this.ControlString = MizDate.Today;
        var d = new MizDate(this.ControlString);
        this.eleP.textContent = d.toString();
    }
    
    C.GetProto = function(childClass){
        var P = Object.create(C.prototype);
        childClass.prototype = P;
        P.constructor = childClass;
        return P;
    }
    
    return C;
})();

var CtrlEdit_HiddenDateUpdate = (function(){
    function C(ctrlStr,itemTypeObj){
        CtrlEdit_HiddenDate.call(this,ctrlStr,itemTypeObj);
    }
    var P = CtrlEdit_HiddenDate.GetProto(C);
    
    P.SetValue = function(ctrl,inner){
        CtrlEdit_HiddenDate.prototype.SetValue.call(this,"",inner);
    }
    
    return C;
})();





var ItemTypeBase = (function(){
    function C(itemStringObj,itemType) {
        this.ItemStringObject = itemStringObj;
        
        var div = document.createElement("div");
        div.className = "item item-" + itemType;
        var i = document.createElement("i");
        i.className = "font-btn btn-context";
        div.appendChild(i);
        this.ItemDomObject = div;
        div.MizBind(this);
        
        this.Controls = [];
    }
    
    C.prototype.Tini = function(){
        this.ItemDomObject.MizUnbind();
        this.ItemDomObject = null;
        for (var i in this.Controls) {
            this.Controls[i].Tini();
            this.Controls[i] = null;
        }
        this.ItemStringObject = null;
    }
    C.prototype.SetCtrls = function(){
        var ctrls = this.Controls;
        var itemDom = this.ItemDomObject;
        
        if (!ctrls.length) {
            var l = arguments.length-1;
            var ctrlStrs = this.ItemStringObject.GetCtrlStrs(l);
            var labelKeys = arguments[l];
            for (var i=0;i<l;i++) {
                var ctrlTypeClass = arguments[i];
                var ctrlTypeObject = new ctrlTypeClass(ctrlStrs[i],this);
                ctrls.push(ctrlTypeObject);
                ctrlTypeObject.SetLabel(labelKeys[i]);
                itemDom.appendChild(ctrlTypeObject.ControlDomObject);
            }
        }
    }
    C.prototype.SetValue = function(itemString){
        var itmStrObj = this.ItemStringObject;
        var l = this.Controls.length;
        
        if (itmStrObj.SetString(itemString)) {
            var ctrlStrs = itmStrObj.GetCtrlStrs(l);
            for (var i in this.Controls) {
                this.Controls[i].SetValue(ctrlStrs[i]);
            }
        }
    }
    C.prototype.GetValue = function(collect){
        if (collect) this.CollectValue();
        return this.ItemStringObject.GetString();
    }
    C.prototype.CollectValue = function(){
        var ctrlStrs = [];
        for (var i in this.Controls) {
            ctrlStrs.push(this.Controls[i].GetValue());
        }
        this.ItemStringObject.MergeCtrlStrs(ctrlStrs);
    }
    
    C.GetProto = function(childClass){
        var P = Object.create(C.prototype);
        childClass.prototype = P;
        P.constructor = childClass;
        return P;
    }
    
    return C;
})();



var ItemShow_RawEditor = (function(){
    function C(itemStrObj){
        ItemTypeBase.call(this,itemStrObj,C.TYPENAME);
        
        var ctrlRaw = new CtrlShow_RawInput(itemStrObj.GetString(),this);
        ctrlRaw.SetLabel("item-raweditor-title");
        this.ItemDomObject.appendChild(ctrlRaw.ControlDomObject);
        this.Controls.push(ctrlRaw);
    }
    var P = ItemTypeBase.GetProto(C);
    
    var langsPack = {
        langs:["zh-cn","en"],
        pack:{
            "item-raweditor-intro":[
                "\u6E90\u7801\u7F16\u8F91;\u76F4\u63A5\u5BF9Item\u6E90\u5B57\u7B26\u4E32\u8FDB\u884C\u663E\u793A\u548C\u4FEE\u6539",
                "Raw Editor;Edit the raw string of Item"
            ],
            "item-raweditor-title":["\u6E90\u7801","Raw String"]
        }
    };
    MizLang.AddLangsPack(langsPack);
    C.TYPENAME = "raweditor-show";
    C.INTROKEY = "item-raweditor-intro";
    
    P.SetValue = function(itemStr){
        var itemStrObj = this.ItemStringObject;
        if(itemStrObj.SetString(itemStr)){
            this.Controls[0].SetValue(itemStr);
        }
    }
    //seems no need to rewrite GetValue
    
    ItemType.RegisterType(C);
    return C;
})();

var ItemEdit_RawEditor = (function(){
    function C(itemStrObj){
        ItemTypeBase.call(this,itemStrObj,C.TYPENAME);
        
        var ctrlRaw = new CtrlEdit_RawInput(itemStrObj.GetString(),this);
        ctrlRaw.SetLabel("item-raweditor-title");
        this.ItemDomObject.appendChild(ctrlRaw.ControlDomObject);
        this.Controls.push(ctrlRaw);
    }
    var P = ItemTypeBase.GetProto(C);
    
    var langsPack = {};
    C.TYPENAME = "raweditor-edit";
    C.INTROKEY = null;
    
    P.SetValue = function(itemStr){
        var itemStrObj = this.ItemStringObject;
        if(itemStrObj.SetString(itemStr)){
            this.Controls[0].SetValue(itemStr);
        }
    }
    
    ItemType.RegisterType(C);
    return C;
})();

var ItemShow_SimpleTask = (function(){
    function C(itemStringObj){
        ItemTypeBase.call(this,itemStringObj,C.TYPENAME);
        
        this.SetCtrls(CtrlShow_Inputbox,CtrlShow_Toggle,[
            "item-simpletask-desc","item-simpletask-done"
        ]);
    }
    var P = ItemTypeBase.GetProto(C);
    
    var langsPack = {
        langs:["zh-cn","en"],
        pack:{
            "item-simpletask-intro":[
                "\u7B80\u5355\u4EFB\u52A1;\u975E\u5E38\u7B80\u5355\u7684\u4EFB\u52A1\u5217\u8868",
                "Simple Task;A simple todo list"
            ],
            "item-simpletask-desc":["\u63CF\u8FF0","Description"],
            "item-simpletask-done":["\u5B8C\u6210","Done"]
        }
    };
    MizLang.AddLangsPack(langsPack);
    C.TYPENAME = "simpletask-show";
    C.INTROKEY = "item-simpletask-intro";
    
    ItemType.RegisterType(C);
    return C;
})();

var ItemEdit_SimpleTask = (function(){
    function C(itemStrObj){
        ItemTypeBase.call(this,itemStrObj,C.TYPENAME);
        
        this.SetCtrls(CtrlEdit_Inputbox,CtrlEdit_Toggle,[
            "item-simpletask-desc","item-simpletask-done"
        ]);
    }
    var P = ItemTypeBase.GetProto(C);
    
    var langsPack = {};
    C.TYPENAME = "simpletask-edit";
    C.INTROKEY = null;
    
    ItemType.RegisterType(C);
    return C;
})();

var ItemShow_Hashare = (function(){
    function C(itemStrObj){
        ItemTypeBase.call(this,itemStrObj,C.TYPENAME);
        this.SetCtrls(CtrlShow_Image,CtrlShow_Link,CtrlShow_Text,CtrlShow_Date,CtrlShow_Date,CtrlShow_Date,[
            "item-hashare-image","item-hashare-title","item-hashare-desc","item-hashare-idea","item-hashare-add","item-hashare-update"
        ]);
    }
    var P = ItemTypeBase.GetProto(C);
    
    var langsPack = {
        langs:["zh-cn","en"],
        pack:{
            "item-hashare-intro":[
                "Hashare;\u8FD9\u662FHashare\u6700\u521D\u7684Item\u7C7B\u578B\uFF0C\u7528\u6587\u5B57\u63CF\u8FF0\u4E00\u5207",
                "Hashare;This is the original ItemType of Hashare, that everything can be described using text"
            ],
            "item-hashare-title":["\u6807\u9898","Title"],
            "item-hashare-image":["\u56FE\u7247","Image"],
            "item-hashare-desc":["\u63CF\u8FF0","Description"],
            "item-hashare-idea":["\u60F3\u6CD5\u65E5\u671F","Idea Date"],
            "item-hashare-add":["\u6DFB\u52A0\u65E5\u671F","Added Date"],
            "item-hashare-update":["\u66F4\u65B0\u65E5\u671F","Update Date"]
        }
    }
    MizLang.AddLangsPack(langsPack);
    C.TYPENAME = "hashare-show";
    C.INTROKEY = "item-hashare-intro";
    
    ItemType.RegisterType(C);
    return C;
})();

var ItemEdit_Hashare = (function(){
    function C(itemStrObj){
        ItemTypeBase.call(this,itemStrObj,C.TYPENAME);
        this.SetCtrls(CtrlEdit_Image,CtrlEdit_Link,CtrlEdit_Text,CtrlEdit_Date,CtrlEdit_HiddenDate,CtrlEdit_HiddenDateUpdate,[
            "item-hashare-image","item-hashare-title","item-hashare-desc","item-hashare-idea","item-hashare-add","item-hashare-update"
        ]);
    }
    var P = ItemTypeBase.GetProto(C);
    
    var langsPack = {};
    C.TYPENAME = "hashare-edit";
    C.INTROKEY = null;
    
    ItemType.RegisterType(C);
    return C;
})();

var ItemShow_VerPlan = (function(){
    function C(itemStrObj){
        ItemTypeBase.call(this,itemStrObj,C.TYPENAME);
        this.SetCtrls(CtrlShow_Select,CtrlShow_Date,CtrlShow_Inputbox,
                      CtrlShow_Select,CtrlShow_Date,CtrlShow_Inputbox,CtrlShow_Inputbox,[
            "item-verplan-type","item-verplan-dateadded","item-verplan-desc","item-verplan-state",
            "item-verplan-dateclose","item-verplan-append","item-verplan-vernum"
        ]);
        this.Controls[0].SetOptions(C.OPTGRP.type);
        this.Controls[3].SetOptions(C.OPTGRP.state);
    }
    var P = ItemTypeBase.GetProto(C);
    
    var langsPack = {
        langs:["zh-cn","en"],
        pack:{
            "item-verplan-intro":[
                "\u7248\u672C\u8BA1\u5212;\u6211\u7528\u6765\u5199MIZip\u4EA7\u54C1\u540E\u7EED\u8BA1\u5212\uFF0C\u4EE5\u53CA\u8BB0\u5F55\u5B8C\u6210\u5386\u53F2\u7684",
                "Version Plan;To write down the features planned and turn to history when they're implemented"
            ],
            "item-verplan-type":["\u7C7B\u578B","Type"],
            "item-verplan-dateadded":["\u63D0\u51FA\u65E5\u671F","Date Proposed"],
            "item-verplan-desc":["\u63CF\u8FF0","Description"],
            "item-verplan-state":["\u72B6\u6001","State"],
            "item-verplan-dateclose":["\u7ED3\u675F\u65E5\u671F","Date Closed"],
            "item-verplan-append":["\u7ED3\u675F\u8BF4\u660E","Close Description"],
            "item-verplan-vernum":["\u7248\u672C\u53F7","Version Number"],
            "item-verplan-options-type":["0.0.0.1|0.0.1.0|0.1.0.0|1.0.0.0"],
            "item-verplan-options-state":["\u672A\u5F00\u59CB|\u8FDB\u884C\u4E2D|\u5DF2\u5B8C\u6210|\u5DF2\u53D6\u6D88","Not Start|On Going|Finished|Cancelled"]
        }
    };
    MizLang.AddLangsPack(langsPack);
    C.TYPENAME = "verplan-show";
    C.INTROKEY = "item-verplan-intro";
    C.OPTGRP = {
        "type":MizLang.GetDefaultLang("item-verplan-options-type").split("|"),
        "state":MizLang.GetDefaultLang("item-verplan-options-state").split("|")
    }
    
    ItemType.RegisterType(C);
    return C;
})();

var ItemEdit_VerPlan = (function(){
    function C(itemStrObj){
        ItemTypeBase.call(this,itemStrObj,C.TYPENAME);
        this.SetCtrls(CtrlEdit_Select,CtrlEdit_HiddenDate,CtrlEdit_Inputbox,
                     CtrlEdit_Select,CtrlEdit_Date,CtrlEdit_Inputbox,CtrlEdit_Inputbox,[
            "item-verplan-type","item-verplan-dateadded","item-verplan-desc","item-verplan-state",
            "item-verplan-dateclose","item-verplan-append","item-verplan-vernum"
        ]);
        this.Controls[0].SetOptions(ItemShow_VerPlan.OPTGRP.type);
        this.Controls[3].SetOptions(ItemShow_VerPlan.OPTGRP.state);
    }
    var P = ItemTypeBase.GetProto(C);
    
    var langsPack = {};
    C.TYPENAME = "verplan-edit";
    C.INTROKEY = null;
    
    ItemType.RegisterType(C);
    return C;
})();

/*
var ItemShow_CtrlTest = (function(){
    function C(itemStringObj){
        ItemTypeBase.call(this,itemStringObj,C.TYPENAME);
        
        this.SetCtrls(CtrlShow_Image,["item-ctrltest-desc"]);
    }
    var P = ItemTypeBase.GetProto(C);
    
    var langPack = {
        lang:"en",
        pack:{
            "item-ctrltest-intro":"Control Test;Test new control",
            "item-ctrltest-desc":"Description"
        }
    };
    MizLang.AddLangPack(langPack);
    C.TYPENAME = "ctrltest-show";
    C.INTROKEY = "item-ctrltest-intro";
    
    ItemType.RegisterType(C);
    return C;
})();

var ItemEdit_CtrlTest = (function(){
    function C(itemStrObj){
        ItemTypeBase.call(this,itemStrObj,C.TYPENAME);
        
        this.SetCtrls(CtrlEdit_Image,["item-ctrltest-desc"]);
    }
    var P = ItemTypeBase.GetProto(C);
    
    var langsPack = {};
    C.TYPENAME = "ctrltest-edit";
    C.INTROKEY = null;
    
    ItemType.RegisterType(C);
    return C;
})();
*/
