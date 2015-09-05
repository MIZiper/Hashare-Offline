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