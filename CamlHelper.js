/// <reference name="MicrosoftAjax.js" /> 
/// <reference path="file://C:/Program Files/Common Files/Microsoft Shared/Web Server Extensions/14/TEMPLATE/LAYOUTS/SP.core.debug.js" />
/// <reference path="file://C:/Program Files/Common Files/Microsoft Shared/Web Server Extensions/14/TEMPLATE/LAYOUTS/SP.debug.js" />


CamlHelper = function () {
    this.sb = new Sys.StringBuilder();
    this.writer = new SP.XmlWriter.create(this.sb);
}
CamlHelper.prototype = {
    writer: null,
    sb: null,
    tree: new Array(),
    unclosedTags: 0,
    includeTime: false,

    IntegerField: function (name) {
        return new CamlFieldRef(this, name, "Integer");
    },

    NumberField: function (name) {
        return new CamlFieldRef(this, name, "Number");
    },

    TextField: function (name) {
        return new CamlFieldRef(this, name, "Text");
    },

    DateField: function (name) {
        return new CamlFieldRef(this, name, "DateTime");
    },

    DateTimeField: function (name) {
        return new CamlFieldRef(this, name, "DateTime", true);
    },

    UserField: function (name) {
        return new CamlFieldRef(this, name, "User", true);
    },

    ToString: function () {
        for (var i = 0; i < this.tree.length; i++) {
            if (this.tree[i].Element == "FieldRef") {
                this.writer.writeStartElement("FieldRef");
                this.writer.writeAttributeString("Name", this.tree[i].Name);
                this.writer.writeEndElement();
            } else if (this.tree[i].Element == "Start") {
                this.writer.writeStartElement(this.tree[i].Name);
            } else if (this.tree[i].Element == "Value") {
                this.writer.writeStartElement("Value");
                this.writer.writeAttributeString("Type", this.tree[i].ValueType);
                this.writer.writeString(this.tree[i].Value.toString());
                this.writer.writeEndElement();
            } else if (this.tree[i].Element == "End") {
                this.writer.writeEndElement();
            }
        }

        while (this.unclosedTags > 0) {
            this.unclosedTags--;
            this.writer.writeEndElement();
        }

        this.writer.close();
        return this.sb.toString();
    }

}

CamlFieldRef = function (parent, name, valueType) {
    this.camlHelper = parent;
    this.valueType = valueType;
    this.startIndex = this.camlHelper.tree.length;
    this.camlHelper.tree.push({ Element: 'FieldRef', Name: name });
}
CamlFieldRef.prototype = {
    camlHelper: null,
    valueType: '',
    startIndex: 0,

    In: function (arrayOfValues) {
        this.camlHelper.tree.splice(this.startIndex, 0, { Element: "Start", Name: "In" });

        this.camlHelper.tree.push({ Element: "Start", Name: "Values" });

        for (var i = 0; i < arrayOfValues.length; i++) {
            this.camlHelper.tree.push({ Element: "Value", ValueType: this.valueType, Value: arrayOfValues[i] });
        }

        this.camlHelper.tree.push({ Element: "End" });
        this.camlHelper.tree.push({ Element: "End" });

        return new CamlToken(this.camlHelper, this.startIndex);
    },
    Eq: function (value) {

        this.camlHelper.tree.splice(this.camlHelper.tree.length - 1, 0, { Element: "Start", Name: "Eq" });
        this.camlHelper.tree.push({ Element: "Value", ValueType: this.valueType, Value: value });
        this.camlHelper.tree.push({ Element: "End" });

        return new CamlToken(this.camlHelper, this.startIndex);
    }

}

CamlToken = function (parent, startIndex) {
    this.camlHelper = parent;
    this.startIndex = startIndex;
}
CamlToken.prototype = {
    camlHelper: null,
    startIndex: 0,

    And: function () {
        this.camlHelper.tree.splice(this.startIndex, 0, { Element: "Start", Name: "And" });
        this.camlHelper.unclosedTags++;
        return this.camlHelper;
    },
    Or: function () {
        this.camlHelper.tree.splice(this.startIndex, 0, { Element: "Start", Name: "Or" });
        this.camlHelper.unclosedTags++;
        return this.camlHelper;
    },
    ToString: function () {
        return this.camlHelper.ToString();
    }
}

function test() {

    var caml = new CamlHelper()

    var s = caml
        .IntegerField("ID").In([10, 15, 19])
        .And()
        .TextField("Title").Eq("Hello")
        .ToString();

    alert(s);
}