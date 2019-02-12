/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var grida = {};
var gridToolBar = {};

var refresh = function () {
    ///////////////////////////////////////refresh
    $$(tableName).clearAll();
    $.ajax({
        type: "post",
        async: false,
        url: "/table/" + tableName + "/action/get",
        success: function (data) {


            $$(tableName).parse(JSON.parse(data));

        }
    });
    ///////////////////////////////////////
};
function refresh_col(columnsNames) {
    $.ajax({
        type: "post",
        async: false,
        url: "/table/" + tableName + "/action/get",
        success: function (data) {


            grida.data = JSON.parse(data);
            for (var i = 0; i < grida.columns.length; i++) {

                grida.columns[i].adjust = true;
                if (grida.columns[i].id !== 'id') {
                    grida.columns[i].editor = 'text';
                }


            }

            if (columnsNames !== null) {

                for (var i = 0; i < grida.columns.length; i++) {
                    grida.columns[i].hidden = true;



                }
                for (var i = 0; i < columnsNames.length; i++) {

                    grida.columns[columnsNames[i].idx].hidden = false;
                    grida.columns[columnsNames[i].idx].header = columnsNames[i].name;
                    //grida.columns[columnsNames[i].idx].width = columnsNames[i].width;




                }
            }



        }
    });
}
function parseColumnsInfo(data) {
    var columns = [];

    var result = JSON.parse(data);
    for (var i = 0; i < result.length; i++) {
        var col_el = {};
        col_el.id = result[i].Field;
        col_el.header = result[i].Field;
        var type_f = result[i].Type;
        if (type_f.indexOf('int') >= 0) {
            col_el.width = 100;
        } else {
            col_el.width = 200;
        }
        columns.push(col_el);

    }
    return columns;
}
function create() {
    if (!$$(tableName).getItem('*')) {
        $$(tableName).add({id: '*'}, 0);
    } else {
        alert('У вас уже есть строка которую вы создаете! Сохраните или удалите ее...');
    }
}

function delete_row() {

    webix.confirm({
        title: "Удаление строки",
        ok: "Да", cancel: "Отмена",

        text: "Подтверждаете удаление?",
        callback: function (result) {
            var selId = $$(tableName).getSelectedId(true)[0];

            if (result) {


                if (selId == '*') {

                    $$(tableName).remove(selId);
                } else {

                    var parcel = {};
                    parcel.id = selId.id;

                    $.ajax({
                        type: "post",
                        async: false,
                        url: "/table/" + tableName + "/action/delete",
                        data: parcel,
                        success: function (data) {
                            var parcel = JSON.parse(data);
                            if (parcel.serverStatus === 2) {

                                refresh();


                            } else {
                                alert(data);
                            }
                        }
                    });
                }

            }
        }
    });
}

function edit_row() {
    var selId = $$(tableName).getSelectedId(true)[0];
    var item = $$(tableName).getItem(selId);
    if (selId != '*') {



        $.ajax({
            type: "post",
            async: false,
            url: "/table/" + tableName + "/action/put",
            data: item,
            success: function (data) {
                var parcel = JSON.parse(data);
                if (parcel.serverStatus === 2) {

//                                    refresh();


                } else {
                    alert(data);
                }
            }
        });
    } else {

        delete item['id'];
        $.ajax({
            type: "post",
            async: false,
            url: "/table/" + tableName + "/action/post",
            data: item,
            success: function (data) {
                var parcel = JSON.parse(data);
                if (parcel.serverStatus === 2) {

                    refresh();


                } else {
                    alert(data);
                }
            }
        });

    }
}
function buildCRUDTable(tableName, columnsNames) {
    //columnsNames = [{idx(Index of column), name(Name of column)},...]


    $.ajax({
        type: "post",
        async: false,
        url: "/table/" + tableName + "/action/get_columns",
        success: function (data) {

            grida = {

                view: "datatable",
                select: 'row',
                editable: true,
                editaction: "dblclick",
                id: tableName,
                columns: (parseColumnsInfo(data))
            };
            gridToolBar = {
                view: "toolbar",
                elements: [
//                    { gravity: 4},
                    {view: "button", id: tableName + '_create', type: "icon", icon: "mdi mdi-file", label: "Создать", width: 120, click: create},
                    {view: "button", id: tableName + '_save', type: "icon", icon: "mdi mdi-content-save", label: "Сохранить", width: 120, click: edit_row},
                    {view: "button", id: tableName + '_delete', type: "icon", icon: "mdi mdi-delete", label: "Удалить", width: 120, click: delete_row}
                ]
            };

            refresh_col(columnsNames);


        }
    });

    var obj = [gridToolBar, grida];
    return obj;
}


