import { usuarioService } from "../services/usuario_service";
import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { usuarioDepartamentosWindow } from "../subviews/usuario_departamentos_window";
import { languageService} from "../locales/language_service";




var editButton = "<span class='onEdit webix_icon wxi-pencil'></span>";
var deleteButton = "<span class='onDelete webix_icon wxi-trash'></span>";
var currentIdDatatableView;
var currentRowDatatableView
var isNewRow = false;
var usuarioId;
var usuarioDepartamentoId;
export const usuariosDepartamentos = {
    getGrid: (app) => {
        const translate = app.getService("locale")._;
        usuarioDepartamentosWindow.getWindow(app);
        var toolbarUsuarioDepartamentos = {
            view: "toolbar", padding: 3, elements: [
                { view: "icon", icon: "mdi mdi-folder-network-outline", width: 37, align: "left" },
                { view: "label", label: translate("Departamentos asociados") }
            ]
        };
        var pagerUsuarioDepartamentos = {
            cols: [
                {
                    view: "button", id: "btnNew", type: "icon", icon: "wxi-plus", width: 37, align: "left", hotkey: "Ctrl+A",
                    tooltip: translate("Nuevo registro en formulario (Ctrl+A)"),
                    click: () => {
                        // Alta de una nueva relación
                        if (!usuarioId) {
                            // Hay que dar de alta previamente el concepto.
                            messageApi.errorMessage(translate("Debe dar de alta un usuario antes de poder asiganarle Departamentos"));
                            return;
                        } else {
                            usuarioDepartamentosWindow.loadWindow(usuarioId, null);
                        }

                    }
                },
                {
                    view: "pager", id: "mypager", css: { "text-align": "right" },
                    template: "{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}",
                    size: 25,
                    group: 5
                }
            ]
        };
        var actionsTemplate = editButton;
        // Control de permiso de borrado
        actionsTemplate += deleteButton;
        var gridusuarioDepartamentos = {
            
                cols: [
                   
                    {
                        view: "datatable",
                        id: "usuarioDepartamentosGrid",
                        pager: "mypager",
                        select: "row",
                        autoheight:true,
                        columns: [
                            { id: "usuarioDepartamentoId", adjust: true, header: [translate("ID"), { content: "numberFilter" }], sort: "number" },
                            { id: "departamentoId", adjust: true, header: [translate("departamentoId"), { content: "numberFilter" }], sort: "number", hidden: true },
                            { id: "nombreDepartamento", fillspace: true, header: [translate("Departamento"), { content: "textFilter" }], sort: "string", editor: "text", minWidth: 200 },
                            { id: "actions", header: [{ text: translate("Acciones"), css: { "text-align": "center" } }], template: editButton + deleteButton, css: { "text-align": "center" } }
                        ],
                        rules: {
                            "nombreDepartamento": webix.rules.isNotEmpty
                        },
                        onClick: {
                            "onDelete": function (event, id, node) {
                                var dtable = this;
                                var id = id.row;
                                var curRow = this.data.pull[id];
                                var name = curRow.nombreDepartamento;
                                usuariosDepartamentos.delete(id, name, app);
                            },
                            "onEdit": function (event, id, node) {
                                var curRow = this.data.pull[id.row];
                                usuarioDepartamentosWindow.loadWindow(usuarioId, curRow.departamentoId, curRow.usuarioDepartamentoId);
                            }
                        },
                        on: {
                            "onAfterFilter": function () {
                                var numReg = $$("usuarioDepartamentosGrid").count();
                                $$("usuarioDepartamentosNReg").config.label = "NREG: " + numReg;
                                $$("usuarioDepartamentosNReg").refresh();
                            }
                        }
                    
                },
                
            ]
        }

        var _view = {
            rows: [
                toolbarUsuarioDepartamentos,
                pagerUsuarioDepartamentos,
                gridusuarioDepartamentos
            ]
        }
        
        return _view;
    },

    loadDepartamentosGrid: (usuarioid, usuarioDepartamentoid) => {
        usuarioId = usuarioid;
        usuarioDepartamentoId = usuarioDepartamentoid;
        usuarioService.getDepartamentosAsociados(usuarioId)
            .then((data) => {
                $$("usuarioDepartamentosGrid").clearAll();
                $$("usuarioDepartamentosGrid").parse(generalApi.prepareDataForDataTable("usuarioDepartamentoId", data));
                if (usuarioDepartamentoId) {
                    $$("usuarioDepartamentosGrid").select(usuarioDepartamentoId);
                    $$("usuarioDepartamentosGrid").showItem(usuarioDepartamentoId);
                }
                var numReg = $$("usuarioDepartamentosGrid").count();
                $$("usuarioDepartamentosNReg").config.label = "NREG: " + numReg;
                $$("usuarioDepartamentosNReg").refresh();
                $$("usuarioDepartamentosGrid").hideProgress();
            })
            .catch((err) => {
                $$("usuarioDepartamentosGrid").hideProgress();
                var error = err.response;
                            var index = error.indexOf("Cannot delete or update a parent row: a foreign key constraint fails");
                            if(index != -1) {
                                messageApi.errorRestriccion()
                            } else {
                                messageApi.errorMessageAjax(err);
                            }
            });
    },

    delete: (id, name, app) => {
        const translate = app.getService("locale")._;
        var self = this;
        webix.confirm({
            title: translate("AVISO"),
            text: translate("Está seguro que desea eliminar *").replace('*', name),
            type: "confirm-warning",
            callback: (action) => {
                if (action === true) {
                    usuarioService.deleteUsuarioDepartamento(id)
                        .then(result => {
                            usuariosDepartamentos.loadDepartamentosGrid(usuarioId);
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
}