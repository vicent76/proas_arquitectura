import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { contactosExpedienteService } from "../services/contactosExpediente_service";
import { ContactosExpedienteWindow } from "./contactosExpedienteWindow"




var editButton = "<span class='onEdit webix_icon wxi-pencil'></span>";
var deleteButton = "<span class='onDelete webix_icon wxi-trash'></span>";
var currentIdDatatableView;
var currentRowDatatableView
var isNewRow = false;

var expedienteId;


export const contactosExpediente = {
    getGrid: (app) => {
        const translate = app.getService("locale")._;
        ContactosExpedienteWindow.getWindow(app);
        var toolbarcontactosExpediente = {
            view: "toolbar", padding: 3, elements: [
                { view: "icon", icon: "mdi mdi-folder-network-outline", width: 37, align: "left" },
                { view: "label", label: translate("Contactos") }
            ]
        };
        var pagercontactosExpediente = {
            cols: [
                {
                    view: "button", id: "btnNew", type: "icon", icon: "wxi-plus", width: 37, align: "left", hotkey: "Ctrl+A",
                    tooltip: translate("Nuevo registro en formulario (Ctrl+A)"),
                    click: () => {
                        // Alta de una nueva relación
                        if (!expedienteId) {
                            // Hay que dar de alta previamente el concepto.
                            messageApi.errorMessage(translate("Debe dar de alta el expediente antes que los contactos"));
                            return;
                        } else {
                            ContactosExpedienteWindow.loadWindow(expedienteId);
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
        var datatablecontactosExpediente = {
            view: "datatable",
            scroll: "x",
            id: "contactosExpedienteGrid",
            pager: "mypager",
            select: "row",
            autoheight:true,
            columns: [
                { id: "contactoExpedienteId", header: [translate("Id"), { content: "textFilter" }], sort: "string", width: 50, hidden: true },
                { id: "contactoNombre", header: [translate("Contacto"), { content: "textFilter" }], sort: "string",  width: 300 },
                { id: "telefono1", header: [translate("Teléfono 1"), { content: "textFilter" }], sort: "string",  width: 100 },
                { id: "telefono2", header: [translate("Teléfono 2"), { content: "textFilter" }], sort: "string",width: 100 },
                { id: "correo", header: [translate("Correo"), { content: "textFilter" }], sort: "string", width: 200},
                { id: "observaciones", header: [translate("Observaciones"), { content: "textFilter" }], sort: "string", fillspace: true },
                { id: "actions", header: [{ text: translate("Acciones"), css: { "text-align": "center" } }], template: actionsTemplate, css: { "text-align": "center" } }
            ],
            rightSplit: 1,
            onClick: {
                "onDelete": function (event, id, node) {
                    var dtable = this;
                    var id = id.row;
                    var curRow = this.data.pull[id];
                    var name = curRow.contactoNombre;
                    contactosExpediente.delete(id, name, app);
                },
                "onEdit": function (event, id, node) {
                    var curRow = this.data.pull[id.row];
                    ContactosExpedienteWindow.loadWindow(curRow.expedienteId, curRow.contactoExpedienteId);
                }
            },
            editable: true,
            editaction: "dblclick",
            rules: {

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
                        }  else {
                            currentRowDatatableView = this.data.pull[currentIdDatatableView];
                            // id is not part of the row object
                            delete currentRowDatatableView.id;
                            var data = currentRowDatatableView;
                          
                            if (data.contactoExpedienteId == 0) {
                                contactosExpedienteService.postContactoExpediente(data)
                                    .then((result) => {
                                        this.$scope.loadGrid(expedienteId);
                                        $$('contactosExpedienteGrid').editStop();
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
                                contactosExpedienteService.putContactoExpediente(data)
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
                    var numReg = $$("contactosExpedienteGrid").count();
                    $$("ConceptosNReg").config.label = "NREG: " + numReg;
                    $$("ConceptosNReg").refresh();
                },
                "onItemDblClick": function(rowId, colId, state) {
                    var curRow = this.data.pull[rowId.row]
                    ContactosExpedienteWindow.loadWindow(curRow.expedienteId, curRow.contactoExpedienteId);
                }
            }
        }
        var _view = {
            rows: [
                toolbarcontactosExpediente,
                pagercontactosExpediente,
                datatablecontactosExpediente
            ]
        }
        
        return _view;
    },
    loadGrid: (servicioid) => {
        expedienteId = servicioid;
        contactosExpedienteService.getContactosExpediente(expedienteId)
            .then(rows => {
                if(rows != null) {
                    $$("contactosExpedienteGrid").clearAll();
                    $$("contactosExpedienteGrid").parse(generalApi.prepareDataForDataTable("contactoExpedienteId", rows));
                }else {
                    $$("contactosExpedienteGrid").clearAll();
                    return;
                }
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
                    contactosExpedienteService.deleteContacto(id)
                        .then(result => {
                            contactosExpediente.loadGrid(expedienteId);
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