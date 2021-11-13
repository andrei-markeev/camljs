/// @ts-check

var assert = require("uvu/assert");
var test = require("uvu").test;
var CamlBuilder = require("../dist/camljs");
var vkbeautify = require("./vkbeautify");

test("ContentTypeIdField", () => {
    var query = new CamlBuilder()
        .Where()
        .TextField("Title").EqualTo("Document")
        .And()
        .ContentTypeIdField().BeginsWith("0x101")
        .ToString();

    assert.equal(
        vkbeautify.xml(query),
        vkbeautify.xml(
        `<Where>
            <And>
                <Eq>
                    <FieldRef Name="Title" />
                    <Value Type="Text">Document</Value>
                </Eq>
                <BeginsWith>
                    <FieldRef Name="ContentTypeId" />
                    <Value Type="ContentTypeId">0x101</Value>
                </BeginsWith>
            </And>
        </Where>`)
    );

});

test.run();
