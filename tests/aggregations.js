/// @ts-check

var assert = require("uvu/assert");
var test = require("uvu").test;
var CamlBuilder = require("../dist/camljs");
var vkbeautify = require("./vkbeautify");

test("Aggregations", () => {
    var query = new CamlBuilder()
        .View(["Category", { count: "ID" }, { sum: "Amount" }])
        .Query()
        .GroupBy("Category", true, 100)
        .ToString();


    assert.equal(
        vkbeautify.xml(query),
        vkbeautify.xml(
            '<View>\
                <ViewFields>\
                    <FieldRef Name="Category" />\
                </ViewFields>\
                <Aggregations Value=\"On\">\
                    <FieldRef Name="ID" Type="COUNT" />\
                    <FieldRef Name="Amount" Type="SUM" />\
                </Aggregations>\
                <Query>\
                    <GroupBy Collapse="TRUE" GroupLimit="100">\
                        <FieldRef Name="Category" />\
                    </GroupBy>\
                </Query>\
            </View>')
    );
});

test.run();
