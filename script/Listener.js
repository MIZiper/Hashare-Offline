(function(){
    var tableContext = function(evt){
        var tblDom = evt.target.MizUpTo("table");
        if (!(EventManager.CanContinue(0) && tblDom)) return;
        evt.preventDefault();
        MizUI.Menu.Open("table",evt,tblDom);
    }
    var hashContext = function(evt){
        var hashDom = evt.target.MizUpTo("hash");
        if (!(EventManager.CanContinue(0) && hashDom)) return;
        evt.preventDefault();
        MizUI.Menu.Open("hash",evt,hashDom);
    }
    var itemContext = function(evt){
        var itemDom = evt.target.MizUpTo("item");
        if (!(EventManager.CanContinue(0) && itemDom)) return;
        evt.preventDefault();
        MizUI.Menu.Open("item",evt,itemDom);
    }
    document.getElementById("table-zone").addEventListener("click",function(evt){
        if (evt.target.classList.contains("btn-context")) {
            tableContext(evt);
            evt.stopPropagation();
            return;
        }
        var tblDom = evt.target.MizUpTo("table");
        if (!(EventManager.CanContinue(0) && tblDom)) return;
        if (!MizUI.Menu.MenuOn) {
            TableDom.SwitchTo(tblDom);
            ItemDom._ELE.style.display = "none";
        }
    },false);
    document.getElementById("table-zone").addEventListener("contextmenu",tableContext,false);
    document.getElementById("hash-zone").addEventListener("click",function(evt){
        if (evt.target.classList.contains("btn-context")) {
            hashContext(evt);
            evt.stopPropagation();
            return;
        }
        var hashDom = evt.target.MizUpTo("hash");
        if (!(EventManager.CanContinue(0) && hashDom)) return;
        if (!MizUI.Menu.MenuOn) {
            HashDom.SwtichTo(hashDom);
            ItemDom._ELE.style.display = "block";
        }
    },false);
    document.getElementById("hash-zone").addEventListener("contextmenu",hashContext,false);
    document.getElementById("item-zone").addEventListener("click",function(evt){
        if (evt.target.classList.contains("btn-context")) {
            itemContext(evt);
            evt.stopPropagation();
        }
    },false);
    document.getElementById("item-zone").addEventListener("contextmenu",itemContext,false);
})()

document.getElementById("btn-itemtype").addEventListener("click",function(evt){
    if (!EventManager.CanContinue(0)) return;
    MizUI.Menu.Open("itemType",evt,null);
    evt.stopPropagation();
},false);
document.getElementById("menu-zone").addEventListener("click",function(evt){
    var li = evt.target.MizUpTo("menu-item");
    if (li) {
        var func = li.MizObject;
        func(MizUI.Menu.LastDom,evt);
    }
    /*
        MizUI.Menu.Close();
        document.body.click will handle the close issue
    */
},false);

MenuManager.AddMenu("table",[
    {key:"sys-edit",func:TableDom.Edit},
    {key:"sys-delete",func:TableDom.Delete},
    {key:"sys-down",func:TableDom.Down}
]);
MenuManager.AddMenu("hash",[
    {key:"sys-edit",func:HashDom.Edit},
    {key:"sys-delete",func:HashDom.Delete},
    {key:"sys-copy",func:HashDom.Copy}
]);
MenuManager.AddMenu("itemType",{});
ItemType.AddTypeListener(function(info){
    var prefTypes = localStorage.getItem("preferred-types");
    if (!prefTypes || (prefTypes.indexOf(info.type)!=-1)) //caution that one typeName might be a subset of another
        MenuManager.AppendMenuItem("itemType",{
            title:info.name,
            func:(function(type){return function(){ItemDom.SwitchToType(type);}})(info.type)
        });
    /*Judge here whether the newly registered type is in user's favorite list*/
});
MenuManager.AddMenu("item",[
    {key:"sys-edit",func:ItemDom.Edit},
    {key:"sys-delete",func:ItemDom.Delete},
    {key:"sys-copy",func:ItemDom.Copy},
    {key:"sys-move",func:MoveManager.MoveStart}
]);

SomeManager.Add(new SomeManager("date-picker",Picker.Date.SetValue,Picker.Date.GetValue));
SomeManager.Add(new SomeManager("image-picker",Picker.Image.SetValue,Picker.Image.GetValue));
SomeManager.Add(new SomeManager("image-display",Display.Image.SetValue,Display.Image.GetValue));
SomeManager.Add(new SomeManager("down-display",function(val){
    var a = document.getElementById("down-display-anchor");
    a.href = val.link;
    a.download = val.filename;
    a.textContent = val.text;
},function(){
    var a = document.getElementById("down-display-anchor");
    return a.href;
}));

document.getElementById("btn-alert-yes").addEventListener("click",MizUI.Message.AlertYes,false);
document.getElementById("btn-alert-no").addEventListener("click",MizUI.Message.AlertNo,false);
document.getElementById("btn-picker-yes").addEventListener("click",MizUI.Picker.Yes,false);
document.getElementById("btn-picker-no").addEventListener("click",MizUI.Picker.No,false);
document.getElementById("btn-editem-yes").addEventListener("click",MizUI.Editem.Yes,false);
document.getElementById("btn-editem-no").addEventListener("click",MizUI.Editem.No,false);
document.getElementById("btn-closedisplay").addEventListener("click",MizUI.Display.Close,false);
document.getElementById("btn-backmain").addEventListener("click",TableDom.Back,false);
document.getElementById("btn-save").addEventListener("click",TableDom.Save,false);
document.getElementById("btn-pasteitem").addEventListener("click",ItemDom.Paste,false);
document.getElementById("btn-pastehash").addEventListener("click",HashDom.Paste,false);
document.getElementById("btn-tablefile").addEventListener("click",function(){
    document.getElementById("input-tablefile").click();
},false);
document.getElementById("btn-showhash").addEventListener("click",function(){
    ItemDom._ELE.style.display = "none";
},false);

document.getElementById("btn-addtable").addEventListener("click",function(evt){
    hsoUI.AddTable.Open(evt, "", TableDom.Add, null);
},false);
document.getElementById("btn-addhash").addEventListener("click",function(evt){
    hsoUI.AddHash.Open(evt, "", HashDom.Add, null);
},false);
document.getElementById("btn-additem").addEventListener("click",ItemDom.Add,false);
document.getElementById("input-tablefile").addEventListener("change",TableDom.AddViaFile,false);

window.addEventListener("resize",MizUI.RefreshFrame,false);
document.body.onbeforeunload = TableDom.BeforeLeave;