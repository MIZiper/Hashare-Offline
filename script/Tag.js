var CtrlEdit_Tag = (function(){
    function C(ctrlString,itemTypeObj){
        ControlTypeBase.call(this,ctrlString,itemTypeObj,C.TYPENAME);
        var slt = document.createElement("select"),
            addBtn = document.createElement("button"),
            tagInput = document.createElement("input"),
            ctrlDom = this.ControlDomObject;
        tagInput.type = "text"; tagInput.placeholder = MizLang.GetDefaultLang("ctrl-tag-newtag");
        slt.multiple = true;
        addBtn.textContent = MizLang.GetDefaultLang("ctrl-tag-add");
        addBtn.addEventListener("click",C.EvtAddTag,false);
        ctrlDom.appendChild(slt); ctrlDom.appendChild(tagInput); ctrlDom.appendChild(addBtn);
        this.eleInput = tagInput;
        this.eleBtn = addBtn;
        this.eleList = slt;
        this.SessId = "";
        this.SetValue(ctrlString,true);
        // if(itemTypeObj.hasTagCtrl) {doNothing to prevent more tagCtrls in same Editem since tags shared in a Table}
    }
    var P = ControlTypeBase.GetProto(C);
    
    C.TYPENAME = "tag-edit";
    var langsPack = {
        langs:["zh-cn","en"],
        pack:{
            "ctrl-tag-newtag":["\u65B0\u6807\u7B7E","New Tag"],
            "ctrl-tag-add":["\u6DFB\u52A0","Add"]
        }
    }
    MizLang.AddLangsPack(langsPack);
    C.EvtAddTag = function(evt){
        var ctrlObj = this.MizUpTo("ctrl").MizObject;
        var eleInput = ctrlObj.eleInput,
            eleList = ctrlObj.eleList;
        tagum = TagManager.AddTag(eleInput.value);
        var o = document.createElement("option");
        o.value = tagum; o.textContent = eleInput.value;
        eleList.appendChild(o);
        ctrlObj.SessId = TagManager.SessId;
        eleInput.value = "";
        eleInput.focus();
    }
    
    P.SetValue = function(ctrlStr,inner){
        //MizTag|Tagum
        if (!inner) this.ControlString = ctrlStr;
        var slt = this.eleList,
            tagum = TagManager.GetTagum(ctrlStr), tagunit;
        if (this.SessId!=TagManager.SessId) {
            var frag = document.createDocumentFragment(),
                e,
                tags = TagManager.GetTags();
            while (e = slt.firstChild) slt.removeChild(e);
            for (var i in tags) {
                var o = document.createElement("option");
                o.value = tags[i].value;
                o.textContent = tags[i].name;
                frag.appendChild(o);
            }
            slt.appendChild(frag);
            this.SessId = TagManager.SessId;
        }
        slt.selectedIndex = -1;
        for (var i=0, l=slt.length; i<l; i++) {
            tagunit = parseInt(slt[i].value);
            if ((tagum & tagunit)>0) slt[i].selected = true;
        }
    }
    P.GetValue = function(){
        var arr = [],
            tagum = 0,
            tagunit,
            slt = this.eleList;
        for (var i=0, l=slt.length; i<l; i++) {
            if (slt[i].selected) {
                tagunit = parseInt(slt[i].value);
                tagum |= tagunit;
            }
        }
        return TagManager.Mark+"|"+tagum;
        // or empty string if tagum==0?
    }
    P.Tini = function(){
        this.eleBtn.removeEventListener("click",C.EvtAddTag,false);
        this.eleBtn = null;
        this.eleList = null;
        this.eleInput = null;
        ControlTypeBase.prototype.Tini.call(this);
    }
    
    return C;
})();
var CtrlShow_Tag = (function(){
    function C(ctrlStr,itemTypeObj){
        ControlTypeBase.call(this,ctrlStr,itemTypeObj,C.TYPENAME);
        this.eleList = document.createElement("ul");
        this.SetValue(ctrlStr,true);
        this.ControlDomObject.appendChild(this.eleList);
    }
    var P = ControlTypeBase.GetProto(C);
    
    C.TYPENAME = "tag-show";
    
    P.SetValue = function(ctrlStr,inner){
        if (inner || this.ControlString!=ctrlStr) {
            var ul = this.eleList,
                frag = document.createDocumentFragment(),
                e, tagum = TagManager.GetTagum(ctrlStr),
                tags = TagManager.GetTags();
            while (e = ul.firstChild) ul.removeChild(e);
            // tags = TagManager.DecodeTagum(tagum); for (var i in tags)..
            for (var i in tags) {
                if ((tags[i].value & tagum)>0) {
                    var li = document.createElement("li");
                    li.textContent = tags[i].name;
                    // li.setAttribute("data-value")
                    frag.appendChild(li);
                }
            }
            ul.appendChild(frag);
            this.ControlString = ctrlStr;
        }
    }
    return C;
})();

var TagManager = {
    Mark:"MizTag",
    SessId:"",
    _tags:[],
    GetTags:function(){
        return TagManager._tags;
    },
    Init:function(){
        TagManager.SessId = MizGuid();
        TagManager._tags = [];
        var tags = CurrentTableObject.Tag.Tags;
        for (var i in tags) {
            TagManager._tags.push({name:tags[i],value:1<<i});
        }
    },
    AddTag:function(tag){
        var tagunit = (1<<TagManager._tags.length);
        TagManager._tags.push({name:tag,value:tagunit});
        TagManager.SessId = MizGuid();
        CurrentTableObject.Tag.IsModified = true;
        CurrentTableObject.Tag.Tags.push(tag);
        return tagunit;
    },
    /*
    DecodeTagum:function(tagum){
        
    },
    */
    GetTagum:function(ctrlStr){
        var arr = ctrlStr.split("|"),
            tagum = 0;
        if (arr[0]==TagManager.Mark) {
            tagum = parseInt(arr[1]) || 0;
        }
        return tagum;
    },
    MatchLogic:function(tagum,logic){
        var flag = false;
        for (var i in logic) {
            switch (i) {
                case "one": {
                    flag = (tagum & logic[i])!=0;
                    break;
                }
                case "all": {
                    flag = (tagum & logic[i])==logic[i];
                    break;
                }
                case "notall": {
                    flag = (tagum & logic[i])!=logic[i];
                    break;
                }
                case "notone": {
                    flag = (tagum & logic[i])==0;
                    break;
                }
                default: {
                    flag = false;
                    break;
                }
            }
            if (!flag) break;
        }
        return flag;
    }
}


Picker.TagFilter = (function(){
    var eleContainer = document.getElementById("tag-filter-container"),
        eleEmptyBtn = document.getElementById("btn-emptyfilter"),
        eleLogic = document.getElementById("tag-filter-logic"),
        eleAddBtn = document.getElementById("btn-addfilter"),
        eleTagunit = document.getElementById("tag-filter-tagunit");
    
    function ClearFilter(){
        var e;
        while (e=eleContainer.firstChild) eleContainer.removeChild(e);
    }
    function DelFilter(ele) {
        eleContainer.removeChild(ele);
    }
    function AddFilter(evt){
        if (!(eleLogic.value && eleTagunit.value)) return;
        var li = document.createElement("li"),
            i = document.createElement("i"),
            sp = document.createElement("span");
        i.className = "font-btn btn-context";
        li.className = "tagfilter";
        li.setAttribute("data-value",eleTagunit.value);
        li.setAttribute("data-logic",eleLogic.value);
        sp.textContent = eleTagunit[eleTagunit.selectedIndex].textContent;
        li.appendChild(i); li.appendChild(sp);
        eleContainer.appendChild(li);
    }
    function tagContext(evt){
        var li = evt.target.MizUpTo("tagfilter");
        if (!li) return;
        evt.preventDefault();
        MizUI.Menu.Open("picker-tagfilter",evt,li);
    }
    
    MenuManager.AddMenu("picker-tagfilter",[{key:"sys-delete",func:DelFilter}]);
    eleContainer.addEventListener("contextmenu",tagContext,false);
    eleContainer.addEventListener("click",function(evt){
        if (evt.target.classList.contains("btn-context")) {
            tagContext(evt);
            evt.stopPropagation();
        }
    },false);
    eleAddBtn.addEventListener("click",AddFilter,false);
    eleEmptyBtn.addEventListener("click",ClearFilter,false);
    
    var sessid = "";
    var C = {
        GetValue:function(){
            var filters = eleContainer.querySelectorAll(".tagfilter"),
                val = [],
                newUnit;
            for (var i=0, l=filters.length; i<l; i++) {
                newUnit = parseInt(filters[i].getAttribute("data-value")) || 0;
                val[filters[i].getAttribute("data-logic")] |= newUnit;
            }
            return val;
        },
        SetValue:function(val){
            if (sessid!=TagManager.SessId) {
                var e,
                    frag = document.createDocumentFragment(),
                    tags = TagManager.GetTags();
                while (e=eleTagunit.firstChild) eleTagunit.removeChild(e);
                for (var i in tags) {
                    var o = document.createElement("option");
                    o.value = tags[i].value;
                    o.textContent = tags[i].name;
                    frag.appendChild(o);
                }
                eleTagunit.appendChild(frag);
                ClearFilter();
                sessid = TagManager.SessId;
            }
        }
    }
    return C;
})();

SomeManager.Add(new SomeManager("tag-filter",Picker.TagFilter.SetValue,Picker.TagFilter.GetValue));
MizUI.Picker.TagFilter = function(evt,val,yesCallback,noCallback){
    MizUI.Picker._show("tag-filter",evt,val,yesCallback,noCallback);
}
document.getElementById("btn-tagfilter").addEventListener("click",function(evt){
    if (!EventManager.CanContinue(0)) return;
    MizUI.Picker.TagFilter(evt,"",function(val){
        if (CurrentHashObject) CurrentHashObject.End();
        ItemDom.Clear();
        if (HashDom._lastEle) HashDom._lastEle.classList.remove("active");
        HashDom._lastEle = null;
        EventManager.SetLevel(0);
        
        var hashStoreObjs = CurrentTableObject.HashStoreObjects,
            frag = document.createDocumentFragment(),
            obj, result,
            regex = new RegExp(TagManager.Mark+"\\|(\\d+)");
        for (var i in hashStoreObjs) {
            if (hashStoreObjs[i].ItemStrings==null) continue;
            var itemStrings = hashStoreObjs[i].ItemStrings,
                t = ItemType.GetTypeClass(hashStoreObjs[i].type+"-show");
            // if (!t.supportTag) continue;
            for (var j in itemStrings) {
                result = regex.exec(itemStrings[j]);
                if (result && TagManager.MatchLogic(result[1],val)) {
                    obj = new t(new ItemStringClass(itemStrings[j]));
                    frag.appendChild(obj.ItemDomObject);
                }
            }
        }
        ItemDom._ELE.appendChild(frag);
        ItemDom._ELE.style.display = "block";
        CurrentHashObject = 0;
    },function(){
        EventManager.SetLevel(0);
    });
},false);