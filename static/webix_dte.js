/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
function parseColumnsInfo(data) {
    var columns = [];

    var result = JSON.parse(data);
    for (var i = 0; i < result.length; i++) {
        var col_el = {};
        col_el.id = result[i].Field;
        col_el.header = result[i].Field;
        var type_f = result[i].Type;
        if (type_f.indexOf('int') >= 0) {
            col_el.width = 50;
        } else {
            col_el.width = 200;
        }
        columns.push(col_el);

    }
    return columns;
}

function buildCRUDTable(tableName, columnsNames) {
    //columnsNames = [{idx(Index of column), name(Name of column)},...]
    var grida = {};
    var gridToolBar = {};

    $.ajax({
        type: "post",
        async: false,
        url: "/table/" + tableName + "/action/get_columns",
        success: function (data) {

            grida = {

                view: "datatable",
                select:'row',
                editable:true,
                editaction: "dblclick",
                id: tableName,
                columns: (parseColumnsInfo(data))
            };
            gridToolBar = {
                view: "toolbar",
                elements: [
//                    { gravity: 4},
                    {view: "button", id: tableName+'_create', type: "icon", icon: "webix_icon wxi-file", label: "Создать", width:120},
                    {view: "button", id: tableName+'_edit',type: "icon", icon: "webix_icon wxi-pencil", label: "Изменить", width:120},
                    {view: "button", id: tableName+'_delete',type: "icon", icon: "webix_icon wxi-trash", label: "Удалить", width:120}
                ]
            };

            $.ajax({
                type: "post",
                async: false,
                url: "/table/" + tableName + "/action/get",
                success: function (data) {


                    grida.data = JSON.parse(data);

                    if (columnsNames) {

                        for (var i = 0; i < grida.columns.length; i++) {
                            grida.columns[i].hidden = true;


                        }
                        for (var i = 0; i < columnsNames.length; i++) {

                            grida.columns[columnsNames[i].idx].hidden = false;
                            grida.columns[columnsNames[i].idx].header = columnsNames[i].name;
                            //grida.columns[columnsNames[i].idx].width = columnsNames[i].width;

                            grida.columns[columnsNames[i].idx].adjust = true;
                            grida.columns[columnsNames[i].idx].editor = 'text';
                            

                        }
                    }



                }
            });


        }
    });

    var obj = [gridToolBar, grida];
    return obj;
}


