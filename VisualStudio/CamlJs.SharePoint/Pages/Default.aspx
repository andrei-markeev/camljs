<%-- The following 4 lines are ASP.NET directives needed when using SharePoint components --%>

<%@ Page Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" MasterPageFile="~masterurl/default.master" Language="C#" %>

<%@ Register TagPrefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<%-- The markup and script in the following Content element will be placed in the <head> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderAdditionalPageHead" runat="server">
    <script type="text/javascript" src="/_layouts/15/sp.runtime.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.js"></script>
    <meta name="WebPartPageExpansion" content="full" />

    <!-- Add your JavaScript to the following file -->
	<script type="text/javascript" src="../Scripts/vkbeautify.js"></script>
	<script type="text/javascript" src="../Scripts/camljs.js"></script>
    <script type="text/javascript" id="script">
        function execute() {
            var ctx = SP.ClientContext.get_current();
            var query = new SP.CamlQuery();

            var select = document.getElementById("querySelect");
            var viewXml = new CamlBuilder().View().Query().Where().TextField("Title").BeginsWith(select.options[select.selectedIndex].value).ToString();

            query.set_viewXml(viewXml);

            document.getElementById("camljs").innerHTML = '<pre>new CamlBuilder().View().Query().Where().TextField("Title").BeginsWith("' + select.options[select.selectedIndex].value + '").ToString();';
            document.getElementById("caml").innerHTML = "<pre>" + vkbeautify.xml(viewXml).replace(/</g, "&lt;") + "</pre>";
            document.getElementById("code").innerHTML = "<pre>" + document.getElementById("script").innerHTML.replace(/</g, "&lt;") + "</pre>";

            var list = ctx.get_web().get_lists().getByTitle("Data");
            var items = list.getItems(query);

            ctx.load(items);

            ctx.executeQueryAsync(function () {
                var html = "";
                var enumerator = items.getEnumerator();
                while (enumerator.moveNext()) {
                    var item = enumerator.get_current();
                    html += "<li>" + item.get_item("Title") + "</li>"
                }
                document.getElementById("preview").innerHTML = "<ul>" + html + "</ul>";
            },
            function (sender, args) {
                document.getElementById("preview").innerHTML = "<div class='error'>ERROR: " + args.get_message() + "</div>";
            });
        }
    </script>
    <style type="text/css">
        del {
            background-color: #f77;
        }
        ins {
            background-color: #af9;
        }
        pre {
            margin: 5px;
            padding: 9px;
            border: 1px solid #eee;
        }
        h2 {
            margin-top: 17px;
            margin-bottom: 9px;
        }
        .error {
            color: #f30;
        }
    </style>

</asp:Content>

<%-- The markup in the following Content element will be placed in the TitleArea of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderPageTitleInTitleArea" runat="server">
    CamlJs Test App
</asp:Content>

<%-- The markup and script in the following Content element will be placed in the <body> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderMain" runat="server">

    <h2>Select a query:</h2>
    <div class="searchBox">
        <select id="querySelect" onchange="execute()">
            <option value="">Select...</option>
            <option value="A">Countries with first letter A</option>
            <option value="B">Countries with first letter B</option>
            <option value="C">Countries with first letter C</option>
            <option value="D">Countries with first letter D</option>
            <option value="E">Countries with first letter E</option>
            <option value="F">Countries with first letter F</option>
        </select>
    </div>

    <h2>CamlJs code:</h2>
    <div id="camljs">
        <pre>Please select a query first...</pre>
    </div>

    <h2>The generated CAML query XML:</h2>
	<div id="caml">
        <pre>Please select a query first...</pre>
    </div>

    <h2>Output from <a href="/CamlJsTestApp/Lists/Data/AllItems.aspx">this list</a>:</h2>
	<div id="preview">
        <pre>Please select a query first...</pre>
    </div>

    <h2>Full code:</h2>
	<div id="code">
        <pre>Please select a query first...</pre>
    </div>

</asp:Content>
