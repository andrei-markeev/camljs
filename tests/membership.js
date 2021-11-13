/// @ts-check

var assert = require("uvu/assert");
var test = require("uvu").test;
var CamlBuilder = require("../dist/camljs");
var vkbeautify = require("./vkbeautify");

test("Membership", () => {

    var caml = new CamlBuilder().Where()
        .UserField("AssignedTo").EqualToCurrentUser()
        .Or()
        .UserField("AssignedTo").IsInCurrentUserGroups()
        .GroupBy("Category")
        .OrderBy("Priority").ThenBy("Title")
        .ToString();

    assert.equal(
        vkbeautify.xml(caml),
        vkbeautify.xml(
            '<Where>\
                <Or>\
                    <Eq><FieldRef Name="AssignedTo" LookupId="TRUE" /><Value Type="Integer"><UserID /></Value></Eq>\
                    <Membership Type="CurrentUserGroups"><FieldRef Name="AssignedTo" /></Membership>\
                </Or>\
            </Where>\
            <GroupBy>\
                <FieldRef Name="Category" />\
            </GroupBy>\
            <OrderBy>\
                <FieldRef Name="Priority" /><FieldRef Name="Title" />\
            </OrderBy>')
    );


});

test("GroupMembership", () => {

    var caml = new CamlBuilder().Where()
        .UserField("AssignedTo").IsInSPGroup(10)
        .ToString();

    assert.equal(
        vkbeautify.xml(caml),
        vkbeautify.xml(
            `<Where>
                <Membership Type="SPGroup" ID="10">
                    <FieldRef Name="AssignedTo" />
                </Membership>
            </Where>`
        )
    );


});


test.run();
