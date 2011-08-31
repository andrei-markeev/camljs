/// <reference name="MicrosoftAjax.js" /> 
/// <reference path="file://C:/Program Files/Common Files/Microsoft Shared/Web Server Extensions/14/TEMPLATE/LAYOUTS/SP.core.debug.js" />
/// <reference path="file://C:/Program Files/Common Files/Microsoft Shared/Web Server Extensions/14/TEMPLATE/LAYOUTS/SP.debug.js" />


CamlBuilder = function () {
    this.tree = new Array();
    this.unclosedTags = 0;
};

CamlBuilder.prototype = {

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
    }

};

CamlFieldRef = function (camlBuilder, name, valueType) {

    var startIndex = camlBuilder.tree.length;

    camlBuilder.tree.push({ Element: 'FieldRef', Name: name });

    var simpleComparison = function (operation, value) {

        camlBuilder.tree.splice(camlBuilder.tree.length - 1, 0, { Element: "Start", Name: operation });
        camlBuilder.tree.push({ Element: "Value", ValueType: valueType, Value: value });
        camlBuilder.tree.push({ Element: "End" });

        return new CamlToken(camlBuilder, startIndex);
    };

    this.In = function (arrayOfValues) {
        camlBuilder.tree.splice(startIndex, 0, { Element: "Start", Name: "In" });

        camlBuilder.tree.push({ Element: "Start", Name: "Values" });

        for (var i = 0; i < arrayOfValues.length; i++) {
            camlBuilder.tree.push({ Element: "Value", ValueType: valueType, Value: arrayOfValues[i] });
        }

        camlBuilder.tree.push({ Element: "End" });
        camlBuilder.tree.push({ Element: "End" });

        return new CamlToken(camlBuilder, startIndex);
    };
    this.EqualTo = function (value) {
        return simpleComparison("Eq", value);
    };
    this.GreaterThan = function (value) {
        return simpleComparison("Gt", value);
    };
    this.LessThan = function (value) {
        return simpleComparison("Lt", value);
    };
    this.GreaterOrEqualThan = function (value) {
        return simpleComparison("Geq", value);
    };
    this.LessOrEqualThan = function (value) {
        return simpleComparison("Leq", value);
    };
    this.NotEqualTo = function (value) {
        return simpleComparison("Neq", value);
    };
    this.NotIncludes = function (value) {
        return simpleComparison("NotIncludes", value);
    };
    this.Includes = function (value) {
        return simpleComparison("Includes", value);
    };
    this.Contains = function (value) {
        return simpleComparison("Contains", value);
    };
    this.BeginsWith = function (value) {
        return simpleComparison("BeginsWith", value);
    }

};

CamlToken = function (parent, startIndex) {
    var camlBuilder = parent;
    var startIndex = startIndex;

    this.And = function () {
        camlBuilder.tree.splice(startIndex, 0, { Element: "Start", Name: "And" });
        camlBuilder.unclosedTags++;
        return camlBuilder;
    };
    
    this.Or = function () {
        camlBuilder.tree.splice(startIndex, 0, { Element: "Start", Name: "Or" });
        camlBuilder.unclosedTags++;
        return camlBuilder;
    };
    
    this.ToString = function () {
        var sb = new Sys.StringBuilder();
        var writer = new SP.XmlWriter.create(sb);
        for (var i = 0; i < camlBuilder.tree.length; i++) {
            if (camlBuilder.tree[i].Element == "FieldRef") {
                writer.writeStartElement("FieldRef");
                writer.writeAttributeString("Name", camlBuilder.tree[i].Name);
                writer.writeEndElement();
            } else if (camlBuilder.tree[i].Element == "Start") {
                writer.writeStartElement(camlBuilder.tree[i].Name);
            } else if (camlBuilder.tree[i].Element == "Value") {
                writer.writeStartElement("Value");
                writer.writeAttributeString("Type", camlBuilder.tree[i].ValueType);
                writer.writeString(camlBuilder.tree[i].Value.toString());
                writer.writeEndElement();
            } else if (camlBuilder.tree[i].Element == "End") {
                writer.writeEndElement();
            }
        }

        while (camlBuilder.unclosedTags > 0) {
            camlBuilder.unclosedTags--;
            writer.writeEndElement();
        }

        writer.close();
        return sb.toString();
    }
}
