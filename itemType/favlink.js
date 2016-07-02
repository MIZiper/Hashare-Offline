var ItemShow_FavLink = (function(){
    function C(itemStrObj){
        ItemTypeBase.call(this,itemStrObj,C.TYPENAME);
        this.SetCtrls(CtrlShow_Link,CtrlShow_Inputbox,CtrlShow_Tag,[
            "item-favlink-link","item-favlink-desc","item-favlink-tag"
        ]);
    }
    var P = ItemTypeBase.GetProto(C);
    
    var langsPack = {
        langs:["zh-cn","en"],
        pack:{
            "item-favlink-intro":[
                "\u94FE\u63A5\u6536\u85CF;\u4F7F\u7528\u6807\u7B7E\u7279\u6027\u8FDB\u884C\u94FE\u63A5\u7BA1\u7406\u7684\u7C7B\u578B",
                "Fav Link;This is a simple type that manage your favorite website links"
            ],
            "item-favlink-link":["\u94FE\u63A5","Link"],
            "item-favlink-tag":["\u6807\u7B7E","Tag"],
            "item-favlink-desc":["\u63CF\u8FF0","Description"]
        }
    };
    MizLang.AddLangsPack(langsPack);
    C.TYPENAME = "favlink-show";
    C.INTROKEY = "item-favlink-intro";
    
    ItemType.RegisterType(C);
    return C;
})();

var ItemEdit_VerPlan = (function(){
    function C(itemStrObj){
        ItemTypeBase.call(this,itemStrObj,C.TYPENAME);
        this.SetCtrls(CtrlEdit_Link,CtrlEdit_Inputbox,CtrlEdit_Tag,[
            "item-favlink-link","item-favlink-desc","item-favlink-tag"
        ]);
    }
    var P = ItemTypeBase.GetProto(C);
    
    var langsPack = {};
    C.TYPENAME = "favlink-edit";
    C.INTROKEY = null;
    
    ItemType.RegisterType(C);
    return C;
})();