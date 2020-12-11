//LINEAS DEL CONTRATO

import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { contratosService } from "../services/contratos_service";
//import { LineasContratoWindow } from "../subviews/lineasContratoWindow";

var editButton = "<span class='onEdit webix_icon wxi-pencil'></span>";
var deleteButton = "<span class='onDelete webix_icon wxi-trash'></span>";
var currentIdDatatableView;
var currentRowDatatableView
var isNewRow = false;



var contratoId;
var numLineas;

export const lineasContrato = {
    // Devuelve el grid con las lineas de un contrato
    // se le pasa la app porque es necesaria para conservar el translate.
    getGrid: (app) => {
       
        const translate = app.getService("locale")._;
        try {
            //LineasContratoWindow.getWindow(app);
        }catch(e) {
            console.log(e);
        }
  
        var toolbarlineasContrato = {
            view: "toolbar", padding: 3, elements: [
                { view: "icon", icon: "mdi mdi-folder-network-outline", width: 37, align: "left" },
                { view: "label", label: translate("Lineas de la contrato") }
            ]
        };
        var pagerlineasContrato = {
            cols: [
                {
                    view: "button", id: "btnNew3", type: "icon", icon: "wxi-plus", width: 37, align: "left", hotkey: "Ctrl+A",
                    tooltip: translate("Nuevo registro en formulario (Ctrl+A)"),
                    click: () => {
                        // Alta de una nueva relación
                        if (!contratoId) {
                            // Hay que dar de alta previamente el concepto.
                            messageApi.errorMessage(translate("Debe dar de alta el contrato antes las lineas"));
                            return;
                        }
                        try {
                            var cliId = $$('cmbClientes').getValue();
                            //LineasContratoWindow.loadWindow(contratoId, null, cliId, null);
                        }catch (e) {
                            console.log(e)
                        }
                            
                    }
                },
                {
                    view: "label", id: "contratosLineasNReg", label: "NREG: "
                },
                {
                    view: "pager", id: "mypager3", css: { "text-align": "right" },
                    template: "{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}",
                    size: 25,
                    group: 5
                }
            ]
        };
        var actionsTemplate = editButton;
        // Control de permiso de borrado
        actionsTemplate += deleteButton;
        var datatablelineasContrato = {
            view: "datatable",
            scroll: "x",
            id: "lineasContratoGrid",
            pager: "mypager3",
            select: "row",
            autoheight:true,
            footer: false,
            ready:function(){ $$('lineasContratoGrid').attachEvent("onItemDblClick", function(id, e, node){
                var curRow = this.data.pull[id.row]
                var cliId = $$('cmbClientes').getValue();
                //LineasContratoWindow.loadWindow(curRow.contratoId, curRow.contratoLineaId, cliId);
            });
        },
            columns: [
                { id: "contratoLineaId", header: [translate("Id"), { content: "textFilter" }], sort: "string", width: 50, hidden: true },
                { id: "contratoId", header: [translate("Id"), { content: "textFilter" }], sort: "string", width: 50, hidden: true },
                { id: "linea", header: [translate("Linea"), { content: "textFilter" }], sort: "string", width: 80  },
                { id: "unidades", header: [translate("Uds."), { content: "textFilter" }], sort: "string", width: 40 },
                { id: "descripcion", header: [translate("Concepto"), { content: "textFilter" }], sort: "string",  fillspace: true},
                { id: "importe", header: [translate("€/Ud. Cli."), { content: "textFilter" }], sort: "string", width: 80,format:webix.i18n.numberFormat},
                { id: "cantidad", header: [translate("Cantidad"), { content: "textFilter" }], sort: "string", width: 50, adjust: "header"  },
                { id: "coste", header: [translate("Coste"), { content: "textFilter" }], sort: "string", width: 150,format:webix.i18n.numberFormat },
                
                { id: "actions", header: [{ text: translate("Acciones"), css: { "text-align": "center" } }], template: actionsTemplate, css: { "text-align": "center" } },
            ],
            rightSplit: 1,
            onClick: {
                "onDelete": function (event, id, node) {
                    var dtable = this;
                    var id = id.row;
                    var curRow = this.data.pull[id];

                    lineasContrato.delete(id, curRow, app);
                },
                "onEdit": function (event, id, node) {
                    var curRow = this.data.pull[id.row];
                    var proId = $$('proveedorId').getValue();
                    var cliId = $$('cliId').getValue();
                    
                    try{

                    }catch(e) {
                        //LineasContratoWindow.loadWindow(curRow.contratoId, curRow.contratoLineaId,  cliId, proId, );
                    }
                   
                }
            },
            editable: true,
            editaction: "dblclick",
            rules: {

            },
            on: {
                "onAfterEditStart": function (id) {
                    
                },
                "onAfterEditStop": function (state, editor, ignoreUpdate) {
                   
                },
                "onAfterFilter": function () {
                    var numReg = $$("lineasContratoGrid").count();
                    $$("contratosLineasNReg").config.label = "NREG: " + numReg;
                    $$("contratosLineasNReg").refresh();
                }
            }
        }
        var _view = {
            view: "layout",
            id: "lineasDelContrato",
            rows: [
                toolbarlineasContrato,
                pagerlineasContrato,
                datatablelineasContrato
            ]
        }
        
        return _view;
    },
    loadGrid: (contratoid) => {
        contratoId = contratoid;
        numLineas = 0;
        if(contratoId) {
            contratosService.getLineasContrato(contratoId)
            .then(rows => {
                var total = 0;
                if(rows.length > 0) {
                   /*  numLineas = rows.length;
                    ContratosFormWindow.estableceNumLineas(numLineas); */
                    $$("lineasContratoGrid").clearAll();
                    $$("lineasContratoGrid").parse(generalApi.prepareDataForDataTable("contratoLineaId", rows));
                    var numReg = $$("lineasContratoGrid").count();
                    $$("contratosLineasNReg").config.label = "NREG: " + numReg;
                    $$("contratosLineasNReg").refresh();
                    for(var i = 0; i < rows.length; i++) {
                        total = total + rows[i].totalLinea;
                        $$('importeCli').setValue(total);
                    }
                }else {
                    $$("lineasContratoGrid").clearAll();
                    $$('importeCli').setValue(total);
                }
            })
            .catch((err) => {
                messageApi.errorMessageAjax(err);
            });
        } else {
            $$("lineasContratoGrid").clearAll();
            return
        }
    },
    delete: (id, contratoLinea, app) => {
        const translate = app.getService("locale")._;
        var self = this;
        webix.confirm({
            title: translate("AVISO"),
            text: translate("Está seguro que desea eliminar la linea "),
            type: "confirm-warning",
            callback: (action) => {
                if (action === true) {
                    contratosService.deleteLineaContrato(id, contratoLinea)
                        .then(result => {
                           lineasContrato.loadGrid(contratoId);
                        })
                        .catch(err => {
                            messageApi.errorMessageAjax(err);
                        });
                }
            }
        });
    },
    disparaEvento: () => {

    },

    estableceContado: (rows) => {
        setTimeout( function () {
            var aCuentaProfesional =  0;
            if(rows) {
                for(var i = 0; i < rows.length; i++) {
                    aCuentaProfesional = aCuentaProfesional + rows[i].aCuentaProveedor;
                }
                $$('aCuentaProfesional').setValue(aCuentaProfesional);
                return;
            }
            $$('aCuentaProfesional').setValue(aCuentaProfesional);
        }, 300);
    }
}