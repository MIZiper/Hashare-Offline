var MenuManager = {
    _menuDom:document.getElementById("menu-zone"),
    Menus:[],
    AddMenu:function(type,menusInfo){
        /*[{key,func},{key,func}]*/
        var ul = document.createElement("ul");
        ul.className = "menu";
        var fragEle = document.createDocumentFragment();
        for (var i in menusInfo) {
            var li = document.createElement("li");
            li.textContent = MizLang.GetDefaultLang(menusInfo[i].key);
            li.className = "menu-item";
            li.MizBind(menusInfo[i].func);
            fragEle.appendChild(li);
        }
        ul.appendChild(fragEle);
        this._menuDom.appendChild(ul);
        this.Menus[type] = ul;
    },
    CurrentMenu:null,
    HideMenu:function(menu){
        if (menu) menu.style.display="none";
    },
    ShowMenu:function(menu){
        if (menu) menu.style.display="block";
    },
    SwitchToMenu:function(type){
        if (this.Menus[type]!=this.CurrentMenu) {
            this.HideMenu(this.CurrentMenu);
            this.ShowMenu(this.Menus[type]);
            this.CurrentMenu = this.Menus[type];
        }
    },
    AppendMenuItem:function(type,menuInfo){
        /*{title,func}*/
        if (this.Menus[type]) {
            var li = document.createElement("li");
            li.textContent = menuInfo.title;
            li.className = "menu-item";
            li.MizBind(menuInfo.func);
            this.Menus[type].appendChild(li);
        }
    }
}

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
        _alertPara:document.getElementById("alert-message").children[0],
        _alertDiv:document.getElementById("alert-message"),
        _alertYes:null,
        _alertNo:null,
        _alertKeyShortCut:function(evt){
            if (evt.which==27)
                MizUI.Message.AlertNo();
            else if (evt.which==13)
                MizUI.Message.AlertYes();
        },
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
        },
        Alert:function(msgKey,yesCallback,noCallback){
            MizUI.Message._alertPara.textContent = MizLang.GetDefaultLang(msgKey);
            MizUI.Message._alertDiv.style.display = "block";
            MizUI.Message._alertYes = yesCallback;
            MizUI.Message._alertNo = noCallback;
            document.body.addEventListener("keydown",MizUI.Message._alertKeyShortCut,false);
        },
        AlertYes:function(evt){
            MizUI.Message._alertYes();
            document.body.removeEventListener("keydown",MizUI.Message._alertKeyShortCut,false);
            MizUI.Message._alertDiv.style.display = "none";
        },
        AlertNo:function(evt){
            if (MizUI.Message._alertNo) MizUI.Message._alertNo();
            document.body.removeEventListener("keydown",MizUI.Message._alertKeyShortCut,false);
            MizUI.Message._alertDiv.style.display = "none";
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
    Menu:{
        MenuOn:false,
        _menuDom:document.getElementById("menu-zone"),
        Close:function(){
            MizUI.Menu.MenuOn = false;
            document.body.removeEventListener("click",MizUI.Menu.Close,false);
            if (MizUI.Menu.LastDom) MizUI.Menu.LastDom.classList.remove("hover");
            MizUI.Menu.LastDom = null;
            MizUI.Menu._menuDom.style.display = "none";
            /*
                Cannot use 'this' here 'cause 'this' refers to document.body
                when this function called by event
            */
        },
        Open:function(type,evt,newDom){
            MenuManager.SwitchToMenu(type);
            
            if (MizUI.Menu.LastDom!=newDom) {
                if (MizUI.Menu.LastDom) {
                    MizUI.Menu.LastDom.classList.remove("hover");
                }
                MizUI.Menu.LastDom = newDom;
                if (newDom) newDom.classList.add("hover");
            }
            if (!MizUI.Menu.MenuOn) {
                document.body.addEventListener("click",MizUI.Menu.Close,false);
                MizUI.Menu.MenuOn = true;
            }
            
            MizUI._showFrame(MizUI.Menu._menuDom,evt);
        },
        LastDom:null
    },
    Edit:{
        _yesCallback:null,
        _noCallback:null,
        _editDom:document.getElementById("edit-zone"),
        _lastSome:null,
        _keyShortCut:function(evt){
            if (evt.which==27)
                MizUI.Edit.No();
            else if (evt.which==13)
                MizUI.Edit.Yes();
        },
        _show:function(type,evt,val,yesCallback,noCallback){
            MizUI._openSome(MizUI.Edit,type,val,yesCallback,noCallback);
            MizUI._showFrame(MizUI.Edit._editDom,evt);
            document.body.addEventListener("keydown",MizUI.Edit._keyShortCut,false);
            EventManager.SetLevel(1);
        },
        _close:function(){
            document.body.removeEventListener("keydown",MizUI.Edit._keyShortCut,false);
            MizUI.Edit._editDom.style.display = "none";
            EventManager.SetLevel(0);
        },
        Table:function(evt,val,yesCallback,noCallback){
            MizUI.Edit._show("edit-table",evt,val,yesCallback,noCallback);
            document.getElementById("input-tablename").focus();
        },
        Hash:function(evt,val,yesCallback,noCallback){
            MizUI.Edit._show("edit-hash",evt,val,yesCallback,noCallback);
            document.getElementById("input-hashname").focus();
        },
        Yes:function(evt){
            var func = MizUI.Edit._yesCallback;
            var val = MizUI.Edit._lastSome.GetValue();
            func(val);
            MizUI.Edit._close();
        },
        No:function(evt){
            if (MizUI.Edit._noCallback) MizUI.Edit._noCallback();
            MizUI.Edit._close();
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
        var H = window.innerHeight,
            W = window.innerWidth,
            h = frame.clientHeight,
            w = frame.clientWidth,
            x = evt.clientX,
            y = evt.clientY,
            X = 0,
            Y = 0;
        if (W>800 || frame==MizUI.Menu._menuDom) {
            if (x+w>W) X=x-w; else X=x;
            if (y+h>H) Y=y-h; else Y=y;
        } else {
            X = 0;
            Y = (H-h)/2|0;
        }
        frame.style.top = Y+"px";
        frame.style.left = X+"px";
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