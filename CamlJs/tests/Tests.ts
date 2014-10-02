/// <reference path="../camljs.ts" />
/// <reference path="tsUnit.ts" />

var CUI: any;
var vkbeautify: { xml: (xml: string) => string };

class Tests extends tsUnit.TestClass {

    TestAny() {

        var caml = new CamlBuilder().Where()
            .Any(
            CamlBuilder.Expression().TextField("Email").EqualTo("support@google.com"),
            CamlBuilder.Expression().TextField("Email").EqualTo("plus@google.com"),
            CamlBuilder.Expression().TextField("Title").BeginsWith("[Google]"),
            CamlBuilder.Expression().TextField("Content").Contains("Google")
            )
            .ToString();

        this.areIdentical(
            vkbeautify.xml(
                '<Where>\
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
                </Where>'),
            vkbeautify.xml(caml)
            );

    }

    TestMembership() {

        var caml = new CamlBuilder().Where()
            .UserField("AssignedTo").EqualToCurrentUser()
            .Or()
            .UserField("AssignedTo").Membership.CurrentUserGroups()
            .GroupBy("Category")
            .OrderBy("Priority").ThenBy("Title")
            .ToString();

        this.areIdentical(
            vkbeautify.xml(
                '<Where>\
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
                </OrderBy>'),
            vkbeautify.xml(caml)
            );


    }

    TestDynamicBracketExpressions() {
        var categories = ["Platform Support", "Research and Strategy"];
        var purposes = ["Application and User Lists", "How To", "Support Information"];

        var categoriesExpressions = [];
        for (var i = 0; i < categories.length; i++) {
            categoriesExpressions.push(CamlBuilder.Expression().TextField("ContentCategory").EqualTo(categories[i]));
        }
        var purposesExpressions = [];
        for (var i = 0; i < purposes.length; i++) {
            purposesExpressions.push(CamlBuilder.Expression().TextField("ContentPurpose").EqualTo(purposes[i]));
        }

        var caml = new CamlBuilder().Where()
            .All(
                CamlBuilder.Expression().Any(categoriesExpressions),
                CamlBuilder.Expression().Any(purposesExpressions)
            )
            .ToString();

        this.areIdentical(
            vkbeautify.xml(
                '<Where>\
                    <And>\
                        <Or>\
                            <Eq>\
                                <FieldRef Name="ContentCategory" />\
                                <Value Type="Text">Platform Support</Value>\
                            </Eq>\
                            <Eq>\
                                <FieldRef Name="ContentCategory" />\
                                <Value Type="Text">Research and Strategy</Value>\
                            </Eq>\
                        </Or>\
                        <Or>\
                            <Eq>\
                                <FieldRef Name="ContentPurpose" />\
                                <Value Type="Text">Application and User Lists</Value>\
                            </Eq>\
                            <Or>\
                                <Eq>\
                                    <FieldRef Name="ContentPurpose" />\
                                    <Value Type="Text">How To</Value>\
                                </Eq>\
                                <Eq>\
                                    <FieldRef Name="ContentPurpose" />\
                                    <Value Type="Text">Support Information</Value>\
                                </Eq>\
                            </Or>\
                        </Or>\
                    </And>\
                </Where>'),
            vkbeautify.xml(caml)
            );

    }

    TestNestedBracketExpressions() {

        var caml = new CamlBuilder().Where()
            .All(
            CamlBuilder.Expression().All(
                CamlBuilder.Expression().BooleanField("Enabled").IsTrue(),
                CamlBuilder.Expression().UserMultiField("TargetAudience").EqualTo("55").Or().UserMultiField("TargetAudience").EqualTo("66")
                ),
            CamlBuilder.Expression().Any(
                CamlBuilder.Expression().TextField("NotificationScope").EqualTo("77"),
                CamlBuilder.Expression().TextField("NotificationScope").EqualTo("88").And().TextField("ScopeWebRelativeUrl").EqualTo("99")
                )
            )
            .ToString();

        this.areIdentical(
            vkbeautify.xml(
                '<Where>\
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
                </Where>'),
            vkbeautify.xml(caml)
            );

    }

    TestLookupIdAndOrderBy() {
        var caml = new CamlBuilder().Where()
            .LookupField("Category").Id().In([2, 3, 10])
            .And()
            .DateField("ExpirationDate").GreaterThan(CamlBuilder.CamlValues.Now)
            .OrderBy("ExpirationDate")
            .ToString()

        this.areIdentical(
            vkbeautify.xml(
                '<Where>\
                  <And>\
                    <In>\
                      <FieldRef Name="Category" LookupId="True" />\
                      <Values>\
                        <Value Type="Integer">2</Value>\
                        <Value Type="Integer">3</Value>\
                        <Value Type="Integer">10</Value>\
                      </Values>\
                    </In>\
                    <Gt>\
                      <FieldRef Name="ExpirationDate" />\
                      <Value IncludeTimeValue="False" Type="DateTime">\
                        <Now />\
                      </Value>\
                    </Gt>\
                  </And>\
                </Where>\
                <OrderBy>\
                  <FieldRef Name="ExpirationDate" />\
                </OrderBy>'),
            vkbeautify.xml(caml)
            );
    }

    TestIdInValues() {
        var caml = new CamlBuilder().Where().CounterField("ID").In([1, 2, 3]).ToString();

        this.areIdentical(
            vkbeautify.xml(
            '<Where>\
                <In>\
                    <FieldRef Name="ID" />\
                    <Values>\
                        <Value Type="Counter">1</Value>\
                        <Value Type="Counter">2</Value>\
                        <Value Type="Counter">3</Value>\
                    </Values>\
                </In>\
            </Where>'),
            vkbeautify.xml(caml)
            );
    }

    TestDateRangesOverlap() {
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

        this.areIdentical(
            vkbeautify.xml(
            '<And>\
                <Geq>\
                    <FieldRef Name="BroadcastExpires" />\
                    <Value IncludeTimeValue="False" Type="DateTime">\
                        <Today />\
                    </Value>\
                </Geq>\
                <And>\
                    <Or>\
                        <Membership Type="CurrentUserGroups">\
                        <FieldRef Name="BroadcastTo" />\
                        </Membership>\
                        <Eq>\
                        <FieldRef Name="BroadcastTo" LookupId="True" />\
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
            vkbeautify.xml(caml));
    }

    TestJsDateFormat() {
        var caml = new CamlBuilder().Where().DateTimeField("Created").GreaterThan(new Date(Date.UTC(2013,0,1))).ToString();

        this.areIdentical(
            vkbeautify.xml(
                '<Where>\
                <Gt>\
                    <FieldRef Name="Created" />\
                    <Value Type="DateTime">2013-01-01T00:00:00.000Z</Value>\
                </Gt>\
            </Where>'),
            vkbeautify.xml(caml)
            );
    }

    TestJoins() {
        var query = new CamlBuilder()
            .View(["Title", "Country", "Population"])
            .LeftJoin("Country", "Country").Select("y4r6", "Population")
            .Query()
            .Where()
            .NumberField("Population").LessThan(10)
            .ToString();


        this.areIdentical(
            vkbeautify.xml(
            '<View>\
                <ViewFields>\
                    <FieldRef Name="Title" />\
                    <FieldRef Name="Country" />\
                    <FieldRef Name="Population" />\
                </ViewFields>\
                <Joins>\
                    <Join Type="LEFT" ListAlias="Country">\
                        <Eq>\
                            <FieldRef Name="Country" RefType="ID" />\
                            <FieldRef Name="ID" List="Country" />\
                        </Eq>\
                    </Join>\
                </Joins>\
                <ProjectedFields>\
                    <Field ShowField="y4r6" Type="Lookup" Name="Population" List="Country" />\
                </ProjectedFields>\
                <Query>\
                    <Where>\
                        <Lt>\
                            <FieldRef Name="Population" />\
                            <Value Type="Number">10</Value>\
                        </Lt>\
                    </Where>\
                </Query>\
            </View>'),
            vkbeautify.xml(query)
            );

    }


}
