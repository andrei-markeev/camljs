CUI = window.CUI || {};
CUI.NativeUtility = CUI.NativeUtility || {};
CUI.NativeUtility.createXMLDocFromString = CUI.NativeUtility.createXMLDocFromString || function (xml, newObj) {
    function GetActiveXObject(progIDs) {
        for (var i = 0; i < progIDs.length; i++) {
            try {
                var xmlDoc = new ActiveXObject(progIDs[i]);
                return xmlDoc;
            }
            catch (ex) {

            }
        }
        return null;
    }

    if (window.ActiveXObject) {
        var msxmlDomDoc = newObj ? null : window.g_cuiXMLDOMDocument;
        if (!msxmlDomDoc) {
            try {
                msxmlDomDoc = GetActiveXObject(['Msxml2.DOMDocument.6.0', 'Msxml2.DOMDocument']);
                if (!newObj)
                    g_cuiXMLDOMDocument = msxmlDomDoc;
            }
            catch (e) {

            }
        }
        if (msxmlDomDoc != null)
            msxmlDomDoc.loadXML(xml);
        return msxmlDomDoc;
    }
    else if (DOMParser) {
        var domParser = newObj ? null : window.g_cuiXMLParser;
        if (!domParser) {
            domParser = new DOMParser();
            if (!newObj)
                g_cuiXMLParser = domParser;
        }
        return domParser.parseFromString(xml, "text/xml");
    }
    else if (window.XMLHttpRequest) {

        var request = new XMLHttpRequest();

        request.open("GET", "data:text/xml;charset=utf-8," + xml, false);
        request.send(null);
        return request.responseXML();
    }

    return null;
}
