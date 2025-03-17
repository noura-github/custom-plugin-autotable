(function($) {
    function __autotable($elem, options){
        var that = this;
        that.disabled = options.disabled || false;

        if(!options || !options.headDef || !options.emptyRow
            || !options.insertImageSrc || !options.removeImageSrc) {
            throw "Required options are missing";
        }
        if(!options.headDef.title) {
            throw "Required options are missing";
        }
        this.onInsert = function(currentRow, startup, prevRow) {
            let insert = options.onInsert || function() {};
            insert.call(currentRow, currentRow, startup, prevRow);
        }
        this.onRemove = options.onRemove || function(_, callback) {callback();};
        this.afterRemove = options.afterRemove || function() {};
        this.afterInsert = options.afterInsert || function() {};
        this.insertImageSrc = options.insertImageSrc;
        this.removeSrc = options.removeImageSrc;
        this.insertTitle = options.addImgTitle || "";
        this.removeTitle = options.removeImageTitle || "";
        this.tableClass = options.tableClass;
        if(typeof(options.emptyRow) === "function") {
            this._getEmptyRow = options.emptyRow;
        } else {
            this._getEmptyRow = function() {
               return options.emptyRow.clone(true, true)
            };
        }
        this.insert = function(currentRow, afterRow, existentRow) {
            let deleteRow = $("<td></td>");
            deleteRow.append("<img src='" + that.removeSrc + "' title='" + that.removeTitle + "' class='plugin_img'>");
            if (!that.disabled) {
                deleteRow.click(function(){that.deleteRow(currentRow);});
            } else {
                deleteRow.addClass("ui-state-disabled");
            }
            let insertRow = $("<td></td>");
            insertRow.append("<img src='" + that.insertImageSrc + "' title='" + that.insertTitle + "' class='plugin_img'>");
            if (!that.disabled) {
                insertRow.click(function(){that.insertEmptyRow(currentRow);});
            } else {
                insertRow.addClass("ui-state-disabled");
            }
            currentRow.prepend(insertRow);
            currentRow.append(deleteRow);
            if(!existentRow) {
                if(that.onInsert.call(currentRow, currentRow, false, afterRow) === false) {
                    return;
                }
            }
            if(afterRow) {
                afterRow.after(currentRow);
            } else {
                that.elem.append(currentRow);
            }         
            that.afterInsert(currentRow);
        }

        this.insertEmptyRow = function(row) {
            that.insert(that._getEmptyRow(), row);
        }
        this.deleteRow = function(row) {
            that.onRemove.call(row, row, function() {
                row.remove();
                that.afterRemove.call(row, row)
                if(!that.elem.find("tr").length) {
                    that.insertEmptyRow();
                }
            });
        }
        let table = $("<table></table>");
        if(that.tableClass) {
            table.addClass(that.tableClass)
        }

        let thead = $("<thead></thead>");
        let tr = $("<tr></tr>");
        tr.append("<th></th>");
        options.headDef.title.forEach(function(elem, i) {
            let th = $("<th></th>");
            th.html(elem);
            tr.append(th);
        });
        tr.append("<th></th>");
        thead.append(tr);
        table.append(thead);
        let tdata = $("<tbody></tbody>");
        this.elem = tdata;
        table.append(tdata);
        $elem.append(table);
        if(options.initialRows && options.initialRows.length) {
            options.initialRows.forEach(function(row) {
                that.insert(row, undefined, true);
                that.onInsert.call(row, row, true);
            });
        } else {
            this.insertEmptyRow();
        }
    }

    $.fn.autotable = function(data) {
        if(!this.data("autotable")) {
            this.data("autotable", new __autotable(this, data));
        }
        return this.data("autotable");
    };
}(jQuery));

