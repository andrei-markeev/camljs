Sys = window.Sys || {};
Sys.StringBuilder = function Sys$StringBuilder(initialText) {
    this._parts = (typeof(initialText) !== 'undefined' && initialText !== null && initialText !== '') ?
        [initialText.toString()] : [];
    this._value = {};
    this._len = 0;
}

function Sys$StringBuilder$append(text) {
    this._parts[this._parts.length] = text;
}
function Sys$StringBuilder$appendLine(text) {
    this._parts[this._parts.length] =
        ((typeof(text) === 'undefined') || (text === null) || (text === '')) ?
        '\r\n' : text + '\r\n';
}
function Sys$StringBuilder$clear() {
    this._parts = [];
    this._value = {};
    this._len = 0;
}
function Sys$StringBuilder$isEmpty() {
    if (this._parts.length === 0) return true;
    return this.toString() === '';
}
function Sys$StringBuilder$toString(separator) {
    separator = separator || '';
    var parts = this._parts;
    if (this._len !== parts.length) {
        this._value = {};
        this._len = parts.length;
    }
    var val = this._value;
    if (typeof(val[separator]) === 'undefined') {
        if (separator !== '') {
            for (var i = 0; i < parts.length;) {
                if ((typeof(parts[i]) === 'undefined') || (parts[i] === '') || (parts[i] === null)) {
                    parts.splice(i, 1);
                }
                else {
                    i++;
                }
            }
        }
        val[separator] = this._parts.join(separator);
    }
    return val[separator];
}

Sys.StringBuilder.prototype = {
    append: Sys$StringBuilder$append,
    appendLine: Sys$StringBuilder$appendLine,
    clear: Sys$StringBuilder$clear,
    isEmpty: Sys$StringBuilder$isEmpty,
    toString: Sys$StringBuilder$toString
}


SP = window.SP || {};
function SP_ScriptUtility$isNullOrEmptyString(str) {
    var strNull = null;

    return str === strNull || typeof str === 'undefined' || !str.length;
};
SP.XmlWriter = function SP_XmlWriter($p0) {
    this.$f_0 = [];
    this.$1_0 = $p0;
    this.$V_0 = true;
};
SP.XmlWriter.create = function SP_XmlWriter$create(sb) {
    return new SP.XmlWriter(sb);
};
SP.XmlWriter.prototype = {
    $1_0: null,
    $11_0: null,
    $V_0: false,
    $k_0: false,
    writeStartElement: function SP_XmlWriter$writeStartElement(tagName) {
        this.$1R_0();
        this.$1A_0();
        this.$f_0.push(tagName);
        this.$11_0 = tagName;
        this.$1_0.append('<');
        this.$1_0.append(tagName);
        this.$V_0 = false;
        this.$k_0 = false;
    },
    writeElementString: function SP_XmlWriter$writeElementString(tagName, value) {
        this.$1R_0();
        this.$1A_0();
        this.writeStartElement(tagName);
        this.writeString(value);
        this.writeEndElement();
    },
    writeEndElement: function SP_XmlWriter$writeEndElement() {
        this.$1R_0();
        if (SP_ScriptUtility$isNullOrEmptyString(this.$11_0)) {
            throw "Invalid operation";
        }
        if (!this.$V_0) {
            this.$1_0.append(' />');
            this.$V_0 = true;
        }
        else {
            this.$1_0.append('</');
            this.$1_0.append(this.$11_0);
            this.$1_0.append('>');
        }
        this.$f_0.pop();
        if (this.$f_0.length > 0) {
            this.$11_0 = this.$f_0[this.$f_0.length - 1];
        }
        else {
            this.$11_0 = null;
        }
    },
    $1A_0: function SP_XmlWriter$$1A_0() {
        if (!this.$V_0) {
            this.$1_0.append('>');
            this.$V_0 = true;
        }
    },
    writeAttributeString: function SP_XmlWriter$writeAttributeString(localName, value) {
        if (this.$V_0) {
            throw "Invalid operation";
        }
        this.$1_0.append(' ');
        this.$1_0.append(localName);
        this.$1_0.append('=\"');
        this.$1T_0(value, true);
        this.$1_0.append('\"');
    },
    writeStartAttribute: function SP_XmlWriter$writeStartAttribute(localName) {
        if (!this.$V_0) {
            throw "Invalid operation";
        }
        this.$k_0 = true;
        this.$1_0.append(' ');
        this.$1_0.append(localName);
        this.$1_0.append('=\"');
    },
    writeEndAttribute: function SP_XmlWriter$writeEndAttribute() {
        if (!this.$k_0) {
            throw "Invalid operation";
        }
        this.$1_0.append('\"');
        this.$k_0 = false;
    },
    writeString: function SP_XmlWriter$writeString(value) {
        if (this.$k_0) {
            this.$1T_0(value, true);
            this.$1_0.append(value);
        }
        else {
            this.$1A_0();
            this.$1T_0(value, false);
        }
    },
    writeRaw: function SP_XmlWriter$writeRaw(xml) {
        this.$1R_0();
        this.$1A_0();
        this.$1_0.append(xml);
    },
    $1R_0: function SP_XmlWriter$$1R_0() {
        if (this.$k_0) {
            throw "Invalid operation";
        }
    },
    $1T_0: function SP_XmlWriter$$1T_0($p0, $p1) {
        if (SP_ScriptUtility$isNullOrEmptyString($p0)) {
            return;
        }
        for (var $v_0 = 0; $v_0 < $p0.length; $v_0++) {
            var $v_1 = $p0.charCodeAt($v_0);

            if ($v_1 === 62) {
                this.$1_0.append('&gt;');
            }
            else if ($v_1 === 60) {
                this.$1_0.append('&lt;');
            }
            else if ($v_1 === 38) {
                this.$1_0.append('&amp;');
            }
            else if ($v_1 === 34 && $p1) {
                this.$1_0.append('&quot;');
            }
            else if ($v_1 === 39 && $p1) {
                this.$1_0.append('&apos;');
            }
            else if ($v_1 === 9 && $p1) {
                this.$1_0.append('&#09;');
            }
            else if ($v_1 === 10) {
                this.$1_0.append('&#10;');
            }
            else if ($v_1 === 13) {
                this.$1_0.append('&#13;');
            }
            else {
                this.$1_0.append(($p0.charAt($v_0)).toString());
            }
        }
    },
    close: function SP_XmlWriter$close() {
    }
};
