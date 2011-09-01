<%@ Import Namespace="Microsoft.SharePoint.ApplicationPages" %>
<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls"
    Assembly="Microsoft.SharePoint, Version=14.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=14.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="asp" Namespace="System.Web.UI" Assembly="System.Web.Extensions, Version=3.5.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35" %>
<%@ Import Namespace="Microsoft.SharePoint" %>
<%@ Assembly Name="Microsoft.Web.CommandUI, Version=14.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<%@ Page Language="C#" Inherits="Microsoft.SharePoint.WebControls.LayoutsPageBase"
    DynamicMasterPageFile="~masterurl/default.master" %>

<asp:Content ID="PageHead" ContentPlaceHolderID="PlaceHolderAdditionalPageHead" runat="server">
    <script type="text/javascript" src="/_layouts/CamlBuilder/CamlBuilder.js"></script>
</asp:Content>
<asp:Content ID="Main" ContentPlaceHolderID="PlaceHolderMain" runat="server">
    <script type="text/javascript">
        function test() {
            var camlBuilder = new CamlBuilder();

            var caml = camlBuilder
                .IntegerField("AssignedTo").EqualTo("{UserID}")
                .Or()
                .UserField("AssignedTo").Membership.CurrentUserGroups()
                .OrderBy("Priority").ThenBy("Title")
                .ToString();

            alert(caml);

            caml = camlBuilder
                .LookupIdField("Category").In([2, 3, 10])
                .And()
                .DateField("ExpirationDate").LessThanOrEqualTo("{Now}")
                .OrderByDesc("ExpirationDate")
                .ToString()

            alert(caml);

            //document.getElementById("caml").innerHTML = SP.Utilities.HttpUtility.htmlEncode(s);

        }
        ExecuteOrDelayUntilScriptLoaded(test, 'sp.core.js');
    </script>
    <div id="caml">
    </div>
</asp:Content>
<asp:Content ID="PageTitle" ContentPlaceHolderID="PlaceHolderPageTitle" runat="server">
    CamlBuilder Test Page
</asp:Content>
<asp:Content ID="PageTitleInTitleArea" ContentPlaceHolderID="PlaceHolderPageTitleInTitleArea"
    runat="server">
    Test page
</asp:Content>
