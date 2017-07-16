var EditemManager = {
    Editems:[],
    CurrentEditem:null,
    SwitchToEditem:function(type,val){
        var itemTypeObj = this.Editems[type];
        if (!itemTypeObj) {
            var c = ItemType.GetTypeClass(type+"-edit");
            itemTypeObj = new c(new ItemStringClass(""));
            var editemZone = document.getElementById("editem-zone");
            editemZone.insertBefore(itemTypeObj.ItemDomObject,editemZone.lastElementChild);
            this.Editems[type] = itemTypeObj;
        }
        if (this.CurrentEditem && this.CurrentEditem!=itemTypeObj) {
            this.CurrentEditem.ItemDomObject.style.display = "none";
        }
        this.CurrentEditem = itemTypeObj;
        itemTypeObj.SetValue(val);
        itemTypeObj.ItemDomObject.style.display = "block";
    }
}

var EventManager = {
    CurrentLevel:0,
    CanContinue:function(lv){
        return lv>=this.CurrentLevel;
    },
    SetLevel:function(lv){
        this.CurrentLevel = lv;
    }
}

var SomeManager = (function(){
    function C(id,set,get){
        this.id = id;
        this.dom = document.getElementById(id);
        this.SetValue = set;
        this.GetValue = get;
    }
    
    C.prototype.Hide = function(){this.dom.style.display="none";}
    C.prototype.Show = function(){this.dom.style.display="block";}
    
    C.List = [];
    C.Add = function(obj){
        this.List[obj.id] = obj;
    }
    C.Get = function(type){
        return this.List[type];
    }
    
    return C;
})();

var MoveManager = {
    /*I don't like this*/
    _fromEle:null,
    MoveStart:function(srcEle){
        document.getElementById("hash-zone").addEventListener("click",MoveManager.MoveToHash,false);
        document.getElementById("item-zone").addEventListener("click",MoveManager.MoveBeforeItem,false);
        document.body.addEventListener("contextmenu",MoveManager.MoveEnd,false);
        MoveManager._fromEle = srcEle;
        document.getElementById("table-blk").classList.add("moving");
        EventManager.SetLevel(1);
    },
    MoveEnd:function(evt){
        if (evt) evt.preventDefault();
        document.getElementById("hash-zone").removeEventListener("click",MoveManager.MoveToHash,false);
        document.getElementById("item-zone").removeEventListener("click",MoveManager.MoveBeforeItem,false);
        document.body.removeEventListener("contextmenu",MoveManager.MoveEnd,false);
        MoveManager._fromEle = null;
        document.getElementById("table-blk").classList.remove("moving");
        EventManager.SetLevel(0);
    },
    MoveBeforeItem:function(evt){
        var itemDom = evt.target.MizUpTo("item");
        if (!itemDom) return;
        ItemDom.MoveBefore(MoveManager._fromEle,itemDom);
        MoveManager.MoveEnd();
    },
    MoveToHash:function(evt){
        var hashDom = evt.target.MizUpTo("hash");
        if (!hashDom) return;
        HashDom.MoveTo(MoveManager._fromEle,hashDom);
        MoveManager.MoveEnd();
    }
}



var MizUI = {
    Message:{
        _timeout:0,
        _hintPara:document.getElementById("hint-message").children[0],
        _hintDiv:document.getElementById("hint-message"),
        _hint:function(str){
            clearTimeout(MizUI.Message._timeout);
            MizUI.Message._hintPara.textContent = str;
            MizUI.Message._hintDiv.style.display = "block";
            MizUI.Message._timeout = setTimeout(function(){MizUI.Message._hintDiv.style.display="none";},3000);
        },
        Progress:function(total,success,fail){
            var format = MizLang.GetDefaultLang("sys-progressformat"),
                arr = [total,success,fail],
                str = format.replace(/{(\d)}/g,function(wholeMatch,firstSub){
                /*& secondSub,thirdSub..OriginString*/
                return arr[firstSub];
            });
            MizUI.Message._hint(str);
        },
        Hint:function(msgKey){
            MizUI.Message._hint(MizLang.GetDefaultLang(msgKey));
        }
    },
    Display:{
        _yesCallback:null,
        _noCallback:null,
        _displayDom:document.getElementById("display-zone"),
        _lastSome:null,
        _keyShortCut:function(evt){
            if (evt.which==27)
                MizUI.Display.Close();
        },
        _show:function(type,val,yesCallback,noCallback){
            MizUI._openSome(MizUI.Display,type,val,yesCallback,noCallback);
            document.body.addEventListener("keydown",MizUI.Display._keyShortCut,false);
            MizUI.Display._displayDom.style.display = "block";
        },
        Down:function(val,yesCallback,noCallback){
            MizUI.Display._show("down-display",val,yesCallback,noCallback);
        },
        Image:function(val,yesCallback,noCallback){
            MizUI.Display._show("image-display",val,yesCallback,noCallback);
        },
        Close:function(evt){
            if (MizUI.Display._yesCallback) MizUI.Display._yesCallback(MizUI.Display._lastSome.GetValue());
            MizUI.Display._displayDom.style.display = "none";
            document.body.removeEventListener("keydown",MizUI.Display._keyShortCut,false);
        }
    },
    Picker:{
        _yesCallback:null,
        _noCallback:null,
        _lastSome:null,
        _pickerDom:document.getElementById("picker-zone"),
        _keyShortCut:function(evt){
            if (evt.which==27)
                MizUI.Picker.No();
            else if (evt.which==13)
                MizUI.Picker.Yes();
        },
        _show:function(type,evt,val,yesCallback,noCallback){
            MizUI._openSome(MizUI.Picker,type,val,yesCallback,noCallback);
            MizUI._showFrame(MizUI.Picker._pickerDom,evt);
            document.body.addEventListener("keydown",MizUI.Picker._keyShortCut,false);
            EventManager.SetLevel(2);
        },
        _close:function(){
            document.body.removeEventListener("keydown",MizUI.Picker._keyShortCut,false);
            MizUI.Picker._pickerDom.style.display = "none";
            EventManager.SetLevel(1);
        },
        Date:function(evt,mizDate,yesCallback,noCallback){
            MizUI.Picker._show("date-picker",evt,mizDate,yesCallback,noCallback);
        },
        Image:function(evt,val,yesCallback,noCallback){
            MizUI.Picker._show("image-picker",evt,val,yesCallback,noCallback);
        },
        Yes:function(evt){
            var func = MizUI.Picker._yesCallback;
            var val = MizUI.Picker._lastSome.GetValue();
            MizUI.Picker._close();
            func(val);
        },
        No:function(evt){
            MizUI.Picker._close();
            if (MizUI.Picker._noCallback) MizUI.Picker._noCallback();
        }
    },
    Editem:{
        _editemDom:document.getElementById("editem-zone"),
        _yesCallback:null,
        _noCallback:null,
        _keyShortCut:function(evt){
            if (evt.which==27)
                MizUI.Editem.No();
            else if (evt.which==13 && evt.target.nodeName!="TEXTAREA")
                MizUI.Editem.Yes();
        },
        _close:function(){
            document.body.removeEventListener("keydown",MizUI.Editem._keyShortCut,false);
            MizUI.Editem._editemDom.style.display = "none";
            EventManager.SetLevel(0);
        },
        Show:function(itemTypeName,evt,itemStr,yesCallback,noCallback){
            EditemManager.SwitchToEditem(itemTypeName,itemStr);
            MizUI._showFrame(MizUI.Editem._editemDom,evt);
            
            var e = EditemManager.CurrentEditem.ItemDomObject.querySelector("input,textarea,select,button");
            if (e) e.focus();
            
            document.body.addEventListener("keydown",MizUI.Editem._keyShortCut,false);
            EventManager.SetLevel(1);
            MizUI.Editem._yesCallback = yesCallback;
            MizUI.Editem._noCallback = noCallback;
        },
        Yes:function(evt){
            if (!EventManager.CanContinue(1)) return;
            var func = MizUI.Editem._yesCallback;
            var val = EditemManager.CurrentEditem.GetValue(true);
            func(val);
            MizUI.Editem._close();
        },
        No:function(evt){
            if (!EventManager.CanContinue(1)) return;
            if (MizUI.Editem._noCallback) MizUI.Editem._noCallback();
            MizUI.Editem._close();
        }
    },
    _showFrame:function(frame,evt){
        frame.style.display = "block";
        MizUI._frame_frame_ = frame;
        MizUI._frame_evt_ = evt;
        var H = window.innerHeight,
            W = window.innerWidth,
            h = frame.clientHeight,
            w = frame.clientWidth,
            x = evt.clientX,
            y = evt.clientY,
            X = 0,
            Y = 0;
        if (W>800) {
            if (x+w>W) X=x-w; else X=x;
            if (y+h>H) Y=y-h; else Y=y;
        } else {
            X = 0;
            Y = (H-h)/2|0;
        }
        frame.style.top = Y+"px";
        frame.style.left = X+"px";
    },
    _frame_frame_: null,
    _frame_evt_: null,
    RefreshFrame:function(evt){
        if (MizUI._frame_frame_!=null && MizUI._frame_frame_.style.display=='block') {
            MizUI._showFrame(MizUI._frame_frame_, MizUI._frame_evt_);
        }
    },
    _openSome:function(scope,type,value,yes,no){
        var thisSome = SomeManager.Get(type);
        var thatSome = scope._lastSome;
        thisSome.SetValue(value);
        scope._yesCallback = yes;
        scope._noCallback = no;
        if (thatSome && thatSome!=thisSome) thatSome.Hide();
        thisSome.Show();
        scope._lastSome = thisSome;
    }
}