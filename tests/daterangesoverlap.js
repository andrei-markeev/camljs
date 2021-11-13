/// @ts-check

var assert = require("uvu/assert");
var test = require("uvu").test;
var CamlBuilder = require("../dist/camljs");
var vkbeautify = require("./vkbeautify");

test("DateRangesOverlap", () => {
    var caml = CamlBuilder.Expression()
        .All(
            CamlBuilder.Expression().DateField("BroadcastExpires").GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today),
            CamlBuilder.Expression().Any(
                CamlBuilder.Expression().UserField("BroadcastTo").IsInCurrentUserGroups(),
                CamlBuilder.Expression().UserField("BroadcastTo").EqualToCurrentUser()
            ),
            CamlBuilder.Expression().DateRangesOverlap(CamlBuilder.DateRangesOverlapType.Year, new Date().toISOString())
        )
        .ToString();

    assert.equal(
        vkbeautify.xml(caml),
        vkbeautify.xml(
        '<And>\
            <Geq>\
                <FieldRef Name="BroadcastExpires" />\
                <Value Type="DateTime">\
                    <Today />\
                </Value>\
            </Geq>\
            <And>\
                <Or>\
                    <Membership Type="CurrentUserGroups">\
                    <FieldRef Name="BroadcastTo" />\
                    </Membership>\
                    <Eq>\
                    <FieldRef Name="BroadcastTo" LookupId="TRUE" />\
                    <Value Type="Integer"><UserID /></Value>\
                    </Eq>\
                </Or>\
                <DateRangesOverlap>\
                    <FieldRef Name="EventDate" />\
                    <FieldRef Name="EndDate" />\
                    <FieldRef Name="RecurrenceID" />\
                    <Value Type="DateTime">\
                    <Year />\
                    </Value>\
                </DateRangesOverlap>\
            </And>\
        </And>'),
    );
});

test.run();