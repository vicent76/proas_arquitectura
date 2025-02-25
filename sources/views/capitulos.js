import { JetView } from "webix-jet";
import { capituloService } from "../services/capitulo_service";
import { usuarioService } from "../services/usuario_service";
import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { languageService} from "../locales/language_service";



var editButton = "<span class='onEdit webix_icon wxi-pencil'></span>";
var deleteButton = "<span class='onDelete webix_icon wxi-trash'></span>";
var currentIdDatatableView;
var currentRowDatatableView
var isNewRow = false;

export default class Capitulos extends JetView {
    config() {
        const translate = this.app.getService("locale")._;
        var toolbarCapitulos = {
            view: "toolbar", padding: 3, elements: [
                { view: "icon", icon: "mdi mdi-account-key", width: 37, align: "left" },
                { view: "label", label: translate("Capitulos") }
            ]
        }
        var pagerCapitulos = {
            cols: [
                {
                    view: "button", type: "icon", icon: "wxi-plus", width: 37, align: "left", hotkey: "Ctrl+A",
                    tooltip: translate("Nuevo registro en formulario (Ctrl+A)"),
                    click: () => {
                        this.show('/top/capitulosForm?grupoArticuloId=0');
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
                        webix.toExcel($$("capitulosGrid"), {
                            filename: "capitulos",
                            name: "Capitulos",
                            rawValues: true,
                            ignore: { "actions": true }
                        });
                    }
                },
                {
                    view: "label", id: "CapitulosNReg", label: "NREG: "
                },
                {
                    view: "pager", id: "mypager", css: { "text-align": "right" },
                    template: "{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}",
                    size: 25,
                    group: 5
                }
            ]
        };
        var datatableCapitulos = {
            view: "datatable",
            id: "capitulosGrid",
            pager: "mypager",
            select: "row",
            columns: [
                { id: "grupoArticuloId", adjust: true, header: [translate("ID"), { content: "numberFilter" }], sort: "number" },
                { id: "nombre", fillspace: true, header: [translate("Nombre capitulo"), { content: "textFilter" }], sort: "string", editor: "text", minWidth: 200 },
                { id: "cuentaventas", fillspace: true, header: [translate("Cuenta ventas"), { content: "textFilter" }], sort: "string", editor: "text",  minWidth: 200 },
                { id: "actions", header: [{ text: translate("Acciones"), css: { "text-align": "center" } }], template: editButton + deleteButton, css: { "text-align": "center" } }
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
                    var cIndex = this.getColumnIndex(editor.column);
                    var length = this.config.columns.length;
                    if (isNewRow && cIndex != length - 2) return false;
                    if ((state.value != state.old) || isNewRow) {
                        isNewRow = false;
                        if (!this.validate(currentIdDatatableView)) {
                            messageApi.errorMessage("Valores incorrectos");
                        } else {
                            currentRowDatatableView = this.data.pull[currentIdDatatableView];
                            // id is not part of the row object
                            delete currentRowDatatableView.id;
                            var data = currentRowDatatableView;
                            if (data.grupoArticuloId == 0) {
                                capituloService.postCapitulo(data)
                                    .then((result) => {
                                        this.$scope.load(result.grupoArticuloId);
                                        $$('capitulosGrid').editStop();
                                    })
                                    .catch((err) => {
                                        var error = err.response;
                            var index = error.indexOf("Cannot delete or update a parent row: a foreign key constraint fails");
                            if(index != -1) {
                                messageApi.errorRestriccion()
                            } else {
                                messageApi.errorMessageAjax(err);
                            }
                                    });
                            } else {
                                capituloService.putCapitulo(data)
                                    .then((result) => {
                                    })
                                    .catch((err) => {
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
                    }
                },
                "onAfterFilter": function () {
                    var numReg = $$("capitulosGrid").count();
                    $$("CapitulosNReg").config.label = "NREG: " + numReg;
                    $$("CapitulosNReg").refresh();
                }
            }
        }
        var _view = {
            rows: [
                toolbarCapitulos,
                pagerCapitulos,
                datatableCapitulos
            ]
        }
        return _view;
    }
    urlChange(view, url) {
        usuarioService.checkLoggedUser();
        languageService.setLanguage(this.app, 'es');
        var id = null;
        if (url[0].params.grupoArticuloId) {
            id = url[0].params.grupoArticuloId;
        }
        webix.UIManager.addHotKey("Esc", function () {
            $$('capitulosGrid').remove(-1);
            return false;
        }, $$('capitulosGrid'));
        webix.extend($$("capitulosGrid"), webix.ProgressBar);
        this.load(id);
    }
    load(id) {
        capituloService.getCapitulos()
            .then((data) => {
                $$("capitulosGrid").clearAll();
                $$("capitulosGrid").parse(generalApi.prepareDataForDataTable("grupoArticuloId", data));
                if (id) {
                    $$("capitulosGrid").select(id);
                    $$("capitulosGrid").showItem(id);
                }
                var numReg = $$("capitulosGrid").count();
                $$("CapitulosNReg").config.label = "NREG: " + numReg;
                $$("CapitulosNReg").refresh();
                $$("capitulosGrid").hideProgress();
            })
            .catch((err) => {
                $$("capitulosGrid").hideProgress();
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
        this.show('/top/capitulosForm?grupoArticuloId=' + id);
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
                    capituloService.deleteCapitulo(id)
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
        $$("capitulosGrid").eachColumn(function (id, col) {
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