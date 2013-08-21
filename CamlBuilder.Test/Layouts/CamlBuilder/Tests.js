var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="CamlBuilder.ts" />
/// <reference path="tsUnit.ts" />
var CUI;
var ExecuteOrDelayUntilScriptLoaded;

var TestsHelper = (function () {
    function TestsHelper() {
    }
    TestsHelper.XmlToJson = function (xml) {
        function elementToObject(el) {
            var o = [];
            var i = 0;
            if (el.attributes) {
                for (i; i < el.attributes.length; i++) {
                    o[el.attributes[i].name] = el.attributes[i].value;
                }
            }

            var children = el.childNodes;
            if (children.length) {
                i = 0;
                for (i; i < children.length; i++) {
                    if (children[i].nodeName == '#text')
                        o.push({ '#text': children[i].nodeValue });
else {
                        var ch = {};
                        ch[children[i].nodeName] = elementToObject(children[i]);
                        o.push(ch);
                    }
                }
            }
            return o;
        }

        var domElement = CUI.NativeUtility.createXMLDocFromString("<root>" + xml + "</root>");
        var obj = elementToObject(domElement);
        return JSON.stringify(obj.root, undefined, 2);
    };
    return TestsHelper;
})();

var Tests = (function (_super) {
    __extends(Tests, _super);
    function Tests() {
        _super.apply(this, arguments);
    }
    Tests.prototype.Test1 = function () {
        var caml = new CamlBuilder().Where().Any(CamlBuilder.Expression().TextField("Email").EqualTo("support@google.com"), CamlBuilder.Expression().TextField("Email").EqualTo("plus@google.com"), CamlBuilder.Expression().TextField("Title").BeginsWith("[Google]"), CamlBuilder.Expression().TextField("Content").Contains("Google")).ToString();

        this.areIdentical(TestsHelper.XmlToJson('<Where>\
                    <Or>\
                        <Eq><FieldRef Name="Email" /><Value Type="Text">support@google.com</Value></Eq>\
                        <Or>\
                            <Eq><FieldRef Name="Email" /><Value Type="Text">plus@google.com</Value></Eq>\
                            <Or>\
                                <BeginsWith><FieldRef Name="Title" /><Value Type="Text">[Google]</Value></BeginsWith>\
                                <Contains><FieldRef Name="Content" /><Value Type="Text">Google</Value></Contains>\
                            </Or>\
                        </Or>\
                    </Or>\
                </Where>'), TestsHelper.XmlToJson(caml));
    };

    Tests.prototype.Test2 = function () {
        var caml = new CamlBuilder().Where().UserField("AssignedTo").EqualToCurrentUser().Or().UserField("AssignedTo").IsInCurrentUserGroups().GroupBy("Category").OrderBy("Priority").ThenBy("Title").ToString();

        this.areIdentical(TestsHelper.XmlToJson('<Where>\
                    <Or>\
                        <Eq><FieldRef Name="AssignedTo" LookupId="True" /><Value Type="Integer"><UserID /></Value></Eq>\
                        <Membership Type="CurrentUserGroups"><FieldRef Name="AssignedTo" /></Membership>\
                    </Or>\
                </Where>\
                <GroupBy>\
                    <FieldRef Name="Category" />\
                </GroupBy>\
                <OrderBy>\
                    <FieldRef Name="Priority" /><FieldRef Name="Title" />\
                </OrderBy>'), TestsHelper.XmlToJson(caml));
    };

    Tests.prototype.Test3 = function () {
        var caml = new CamlBuilder().Where().All(CamlBuilder.Expression().All(CamlBuilder.Expression().BooleanField("Enabled").IsTrue(), CamlBuilder.Expression().UserMultiField("TargetAudience").EqualTo("55").Or().UserMultiField("TargetAudience").EqualTo("66")), CamlBuilder.Expression().Any(CamlBuilder.Expression().TextField("NotificationScope").EqualTo("77"), CamlBuilder.Expression().TextField("NotificationScope").EqualTo("88").And().TextField("ScopeWebRelativeUrl").EqualTo("99"))).ToString();

        this.areIdentical(TestsHelper.XmlToJson('<Where>\
                    <And>\
                        <And>\
                            <Eq><FieldRef Name="Enabled" /><Value Type="Integer">1</Value></Eq>\
                            <Or>\
                                <Eq><FieldRef Name="TargetAudience" /><Value Type="UserMulti">55</Value></Eq>\
                                <Eq><FieldRef Name="TargetAudience" /><Value Type="UserMulti">66</Value></Eq>\
                            </Or>\
                        </And>\
                        <Or>\
                            <Eq><FieldRef Name="NotificationScope" /><Value Type="Text">77</Value></Eq>\
                            <And>\
                                <Eq><FieldRef Name="NotificationScope" /><Value Type="Text">88</Value></Eq>\
                                <Eq><FieldRef Name="ScopeWebRelativeUrl" /><Value Type="Text">99</Value></Eq>\
                            </And>\
                        </Or>\
                    </And>\
                </Where>'), TestsHelper.XmlToJson(caml));
    };

    Tests.prototype.Test4 = function () {
        var caml = new CamlBuilder().Where().LookupField("Category").Id().In([2, 3, 10]).And().DateField("ExpirationDate").LessThanOrEqualTo(CamlBuilder.CamlValues.Now).OrderByDesc("ExpirationDate").ToString();

        this.areIdentical(TestsHelper.XmlToJson('<Where>\
                  <And>\
                    <In>\
                      <FieldRef Name="Category" LookupId="True" />\
                      <Values>\
                        <Value Type="Integer">2</Value>\
                        <Value Type="Integer">3</Value>\
                        <Value Type="Integer">10</Value>\
                      </Values>\
                    </In>\
                    <Leq>\
                      <FieldRef Name="ExpirationDate" />\
                      <Value Type="Date">\
                        <Now />\
                      </Value>\
                    </Leq>\
                  </And>\
                </Where>\
                <OrderBy>\
                  <FieldRef Name="ExpirationDate" Ascending="False" />\
                </OrderBy>'), TestsHelper.XmlToJson(caml));
    };

    Tests.prototype.Test5 = function () {
        var caml = new CamlBuilder().Where().NumberField("ID").In([1, 2, 3]).ToString();

        this.areIdentical(TestsHelper.XmlToJson('<Where>\
                <In>\
                    <FieldRef Name="ID" />\
                    <Values>\
                        <Value Type="Integer">1</Value>\
                        <Value Type="Integer">2</Value>\
                        <Value Type="Integer">3</Value>\
                    </Values>\
                </In>\
            </Where>'), TestsHelper.XmlToJson(caml));
    };

    Tests.prototype.Test6 = function () {
        var caml = new CamlBuilder().Where().LookupIdField("Category").In([2, 3, 10]).And().DateField("ExpirationDate").LessThanOrEqualTo("{Now}").OrderByDesc("ExpirationDate").ToString();

        this.areIdentical(TestsHelper.XmlToJson('<Where>\
                  <And>\
                    <In>\
                      <FieldRef Name="Category" LookupId="True" />\
                      <Values>\
                        <Value Type="Integer">2</Value>\
                        <Value Type="Integer">3</Value>\
                        <Value Type="Integer">10</Value>\
                      </Values>\
                    </In>\
                    <Leq>\
                      <FieldRef Name="ExpirationDate" />\
                      <Value Type="Date">\
                        <Now />\
                      </Value>\
                    </Leq>\
                  </And>\
                </Where><OrderBy>\
                  <FieldRef Name="ExpirationDate" Ascending="False" />\
                </OrderBy>'), TestsHelper.XmlToJson(caml));
    };

    Tests.prototype.Test7 = function () {
        var caml = new CamlBuilder().Where().DateRangesOverlap("EventDate", "EndDate", "RecurrenceID", CamlBuilder.CamlValues.Today).And().UserField("BroadcastTo").IsInCurrentUserGroups().Or().UserField("BroadcastTo").EqualToCurrentUser().OrderByDesc("EventDate").ToString();

        this.areIdentical(TestsHelper.XmlToJson('<Where>\
                 <And>\
                   <Geq>\
                     <FieldRef Name="BroadcastExpires"/>\
                     <Value IncludeTimeValue="FALSE" Type="DateTime">\
                       <Today/>\
                     </Value>\
                   </Geq>\
                   <Or>\
                     <Membership Type = "CurrentUserGroups" >\
                       <FieldRef Name="BroadcastTo"/>\
                     </Membership>\
                     <Eq>\
                       <FieldRef Name="BroadcastTo"></FieldRef>\
                       <Value Type="User">UserName</Value>\
                     </Eq>\
                   </Or>\
                </And>\
                <DateRangesOverlap>\
                 <FieldRef Name="EventDate"/>\
                 <FieldRef Name="EndDate"/>\
                 <FieldRef Name="RecurrenceID"/>\
                 <Value Type="DateTime">\
                   <Today/>\
                 </Value>\
               </DateRangesOverlap>\
           </Where>\
           <OrderBy>\
             <FieldRef Name="Created" Ascending="FALSE" />\
           </OrderBy>'), TestsHelper.XmlToJson(caml));
    };
    return Tests;
})(tsUnit.TestClass);

ExecuteOrDelayUntilScriptLoaded(function () {
    var test = new tsUnit.Test();
    test.addTestClass(new Tests());
    test.showResults(document.getElementById('caml'), test.run());
}, 'sp.runtime.js');
//@ sourceMappingURL=Tests.js.map
