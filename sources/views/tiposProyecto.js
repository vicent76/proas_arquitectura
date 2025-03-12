import { JetView } from "webix-jet";
import { tiposProyectoService } from "../services/tipos_proyecto_service";
import { usuarioService } from "../services/usuario_service";
import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { languageService} from "../locales/language_service";



var editButton = "<span class='onEdit webix_icon wxi-pencil'></span>";
var deleteButton = "<span class='onDelete webix_icon wxi-trash'></span>";
var currentIdDatatableView;
var currentRowDatatableView
var isNewRow = false;

export default class TiposProyecto extends JetView {
    config() {
        const translate = this.app.getService("locale")._;
        var toolbarTiposProyectos = {
            view: "toolbar", padding: 3, elements: [
                { view: "icon", icon: "mdi mdi-account-key", width: 37, align: "left" },
                { view: "label", label: translate("Tipos de proyecto") }
            ]
        }
        var pagerTiposProyectos = {
            cols: [
                {
                    view: "button", type: "icon", icon: "wxi-plus", width: 37, align: "left", hotkey: "Ctrl+A",
                    tooltip: translate("Nuevo registro en formulario (Ctrl+A)"),
                    click: function () {
                        let newId = webix.uid(); // Genera un ID único temporal
                        $$("tiposProyectoGrid").add({
                            id: newId,
                            tipoProyectoId: 0, // Temporal, se asignará al guardar
                            nombre: "",
                            abrev: "",
                            tipoMantenimientoId: 5,
                            esTecnico: 1
                        }, 0); // Agregar al inicio
                        $$("tiposProyectoGrid").edit(newId); // Editar automáticamente
                    }
                },
                {
                    view: "button", type: "icon", icon: "mdi mdi-refresh", width: 37, align: "left", hotkey: "Ctrl+R",
                    tooltip: translate("Refrescar la lista (Ctrl+R)"),
                    click: ()=>{
                        this.cleanAndload();
                    }
                },
                {
                    view: "button", type: "icon", icon: "wxi-download", width: 37, align: "right",
                    tooltip: translate("Descargar como Excel"),
                    click: () => {
                        webix.toExcel($$("tiposProyectoGrid"), {
                            filename: "tiposProyecto",
                            name: "TiposProyectos",
                            rawValues: true,
                            ignore: { "actions": true }
                        });
                    }
                },
                {
                    view: "label", id: "TiposProyectosNReg", label: "NREG: "
                },
                {
                    view: "pager", id: "mypager", css: { "text-align": "right" },
                    template: "{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}",
                    size: 25,
                    group: 5
                }
            ]
        };
        var datatableTiposProyectos = {
            view: "datatable",
            id: "tiposProyectoGrid",
            pager: "mypager",
            select: "row",
            columns: [
                { id: "tipoProyectoId", adjust: true, header: [translate("ID"), { content: "numberFilter" }], sort: "number" },
                { id: "nombre", fillspace: true, header: [translate("Nombre"), { content: "textFilter" }], sort: "string", editor: "text", minWidth: 200 },
                { id: "abrev", adjust: "header", header: [translate("Abreviatura"), { content: "textFilter" }], sort: "string", editor: "text" },
                { id: "tipoMantenimientoId", adjust: "header", header: [translate("Referencia"), { content: "textFilter" }], sort: "string", editor: "text", hidden: true},
                { id: "esTecnico", adjust: "header", header: [translate("Referencia"), { content: "textFilter" }], sort: "string", editor: "text" , hidden: true},
                { id: "actions", header: [{ text: translate("Acciones"), css: { "text-align": "center" } }], template: deleteButton, css: { "text-align": "center" } }
            ],
            rightSplit:1,
            onClick: {
                "onDelete": function (event, id, node) {
                    var dtable = this;
                    var curRow = this.data.pull[id.row];
                    var name = curRow.nombre;
                    this.$scope.delete(id.row, name);
                },
                "onEdit": function (event, id, node) {
                    this.$scope.edit(id.row);
                }
            },
            editable: true,
            editaction: "dblclick",
            rules: {
                "nombre": webix.rules.isNotEmpty,
            },
            on: {
                "onAfterEditStart": function (id) {
                    currentIdDatatableView = id.row;
                    currentRowDatatableView = this.data.pull[currentIdDatatableView];
                },
                "onAfterEditStop": function (state, editor, ignoreUpdate) {
                    var rowId = editor.row;
                    var rowData = this.getItem(rowId);
                    delete rowData.departamento

                    if ((state.value != state.old) || rowData.tipoProyectoId == 0) {
                        if (!this.validate(rowId)) {
                            messageApi.errorMessage("Valores incorrectos");
                        } else {
                            delete rowData.id; // Asegurar que no se envíe un ID incorrecto
                            if (rowData.tipoProyectoId == 0) {
                                tiposProyectoService.postTipoProyecto(rowData)
                                    .then((result) => {
                                        rowData.tipoProyectoId = result.tipoProyectoId; // Actualizar con el ID real
                                        $$("tiposProyectoGrid").updateItem(rowId, rowData);
                                        $$("tiposProyectoGrid").editStop();
                                    })
                                    .catch((err) => handleServerError(err));
                            } else {
                                tiposProyectoService.putTipoProyecto(rowData)
                                    .catch((err) => handleServerError(err));
                            }
                        }
                    }
                },
                "onAfterFilter": function () {
                    var numReg = $$("tiposProyectoGrid").count();
                    $$("TiposProyectosNReg").config.label = "NREG: " + numReg;
                    $$("TiposProyectosNReg").refresh();
                }
            }
        }
        var _view = {
            rows: [
                toolbarTiposProyectos,
                pagerTiposProyectos,
                datatableTiposProyectos
            ]
        }
        return _view;
    }
    urlChange(view, url) {
        usuarioService.checkLoggedUser();
        languageService.setLanguage(this.app, 'es');
        var id = null;
        if (url[0].params.tipoProyectoId) {
            id = url[0].params.tipoProyectoId;
        }
        webix.UIManager.addHotKey("Esc", function () {
            $$('tiposProyectoGrid').remove(-1);
            return false;
        }, $$('tiposProyectoGrid'));
        webix.extend($$("tiposProyectoGrid"), webix.ProgressBar);
        this.load(id);
    }
    load(id) {
        tiposProyectoService.getTiposProyecto()
            .then((data) => {
                $$("tiposProyectoGrid").clearAll();
                $$("tiposProyectoGrid").parse(generalApi.prepareDataForDataTable("tipoProyectoId", data));
                if (id) {
                    $$("tiposProyectoGrid").select(id);
                    $$("tiposProyectoGrid").showItem(id);
                }
                var numReg = $$("tiposProyectoGrid").count();
                $$("TiposProyectosNReg").config.label = "NREG: " + numReg;
                $$("TiposProyectosNReg").refresh();
                $$("tiposProyectoGrid").hideProgress();
            })
            .catch((err) => {
                $$("tiposProyectoGrid").hideProgress();
                var error = err.response;
                            var index = error.indexOf("Cannot delete or update a parent row: a foreign key constraint fails");
                            if(index != -1) {
                                messageApi.errorRestriccion()
                            } else {
                                messageApi.errorMessageAjax(err);
                            }
            });
    }
    edit(id) {
        this.show('/top/tiposProyectoForm?tipoProyectoId=' + id);
    }
    delete(id, name) {
        const translate = this.app.getService("locale")._;
        var self = this;
        
        webix.confirm({
            title: translate("AVISO"),
            text: translate("¿Desea realmente borrar este registro?").replace('*', name),
            type: "confirm-warning",
            callback: (action) => {
                if (action === true) {
                    tiposProyectoService.deleteTipoProyecto(id)
                        .then(result => {
                            self.load();
                        })
                        .catch(err => {
                            var error = err.response;
                            var index = error.indexOf("Cannot delete or update a parent row: a foreign key constraint fails");
                            if(index != -1) {
                                messageApi.errorRestriccion()
                            } else {
                                messageApi.errorMessageAjax(err);
                            }
                        });
                }
            }
        });
    }
    cleanAndload() {
        $$("tiposProyectoGrid").eachColumn(function (id, col) {
            if (col.id == 'actions') return;
            var filter = this.getFilter(id);
            if (filter) {
                if (filter.setValue) filter.setValue("")	// suggest-based filters 
                else filter.value = "";					// html-based: select & text
            }
        });
        this.load();
    }
}