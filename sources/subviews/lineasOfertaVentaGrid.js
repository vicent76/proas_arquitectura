//LINEAS DE LA OFERTA

import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { ofertasService } from "../services/ofertas_service";
import { LineasOfertaWindow } from "./lineasOfertaWindow";
import { proveedoresOferta } from "./proveedoresOfertaGrid";
var editButton = "<span class='onEdit webix_icon wxi-pencil'></span>";
var deleteButton = "<span class='onDelete webix_icon wxi-trash'></span>";
var currentIdDatatableView;
var currentRowDatatableView
var isNewRow = false;



var ofertaId;
var numLineas;
var imprimirWindow;


export const lineasOfertaVenta= {
    // Devuelve el grid con los locales afectados
    // se le pasa la app porque es necesaria para conservar el translate.
    getGrid: (app) => {
       
        const translate = app.getService("locale")._;
        try {
            LineasOfertaWindow.getWindow(app);
        }catch(e) {
            console.log(e);
        }
  
        var toolbarlineasOfertaVenta = {
            view: "toolbar", padding: 3, elements: [
                { view: "icon", icon: "mdi mdi-folder-network-outline", width: 37, align: "left" },
                { view: "label", label: translate("Lineas de la oferta") }
            ]
        };
        var pagerlineasOfertaVenta = {
            cols: [
                {
                    view: "button", id: "btnNew3", type: "icon", icon: "wxi-plus", width: 37, align: "left", hotkey: "Ctrl+A",
                    tooltip: translate("Nuevo registro en formulario (Ctrl+A)"),
                    click: () => {
                        // Alta de una nueva relación
                        if (!ofertaId) {
                            // Hay que dar de alta previamente el concepto.
                            messageApi.errorMessage(translate("Debe dar de alta el oferta antes las lineas"));
                            return;
                        }
                        try {
                            var cliId = $$('cmbClientes').getValue();
                            LineasOfertaWindow.loadWindow(ofertaId, null, cliId, null, null, null);
                        }catch (e) {
                            console.log(e)
                        }
                            
                    }
                },
                {
                    view: "label", id: "ofertasLineasVentaNReg", label: "NREG: "
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
        var datatablelineasOfertaVenta = {
            view: "datatable",
            scroll: "x",
            id: "lineasOfertaVentaGrid",
            pager: "mypager3",
            select: "row",
            autoheight:true,
            footer: false,
            ready:function(){ $$('lineasOfertaVentaGrid').attachEvent("onItemDblClick", function(id, e, node){
                var curRow = this.data.pull[id.row]
                var cliId = $$('cmbClientes').getValue();
                LineasOfertaWindow.loadWindow(curRow.ofertaId, curRow.ofertaLineaId, cliId, null, null, null);
            });
        },
            columns: [
                { id: "ofertaLineaId", header: [translate("Id"), { content: "textFilter" }], sort: "string", width: 50, hidden: true },
                { id: "ofertaId", header: [translate("Id"), { content: "textFilter" }], sort: "string", width: 50, hidden: true },
                { id: "linea", header: [translate("Linea"), { content: "textFilter" }], sort: "string", width: 80  },
                { id: "nombreGrupoArticulo", header: [translate("Capítulo"), { content: "textFilter" }], sort: "string", fillspace: true},
                { id: "nombreArticulo", header: [translate("Partida"), { content: "textFilter" }], sort: "string", fillspace: true},
                { id: "unidades", header: [translate("Uds."), { content: "textFilter" }], sort: "string", width: 40 },
                
            
                { id: "importe", header: [translate("€/Ud. Cli."), { content: "textFilter" }], sort: "string", width: 80,format:webix.i18n.numberFormat},
                { id: "cantidad", header: [translate("Cantidad"), { content: "textFilter" }], sort: "string", width: 80  },
                { id: "dto", header: [translate("Descuento"), { content: "textFilter" }], sort: "string", width: 100,format:webix.i18n.numberFormat },
                { id: "costeLinea", header: [translate("Imp cli."), { content: "textFilter" }], sort: "string", width: 80,format:webix.i18n.numberFormat },
                
    
                { id: "actions", header: [{ text: translate("Acciones"), css: { "text-align": "center" } }], template: actionsTemplate, css: { "text-align": "center" } },
            ],
            rightSplit: 1,
            onClick: {
                "onDelete": function (event, id, node) {
                    var dtable = this;
                    var id = id.row;
                    var curRow = this.data.pull[id];

                    lineasOfertaVenta.delete(id, curRow, app);
                },
                "onEdit": function (event, id, node) {
                    var curRow = this.data.pull[id.row];
                    var cliId = $$('cmbClientes').getValue();
                    LineasOfertaWindow.loadWindow(curRow.ofertaId, curRow.ofertaLineaId,  cliId );
                   
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
                    var numReg = $$("lineasOfertaVentaGrid").count();
                    $$("ofertasLineasVentaNReg").config.label = "NREG: " + numReg;
                    $$("ofertasLineasVentaNReg").refresh();
                }
            }
        }
        var _view = {
            view: "layout",
            id: "lineasDelOferta",
            rows: [
                toolbarlineasOfertaVenta,
                pagerlineasOfertaVenta,
                datatablelineasOfertaVenta
            ]
        }
        
        return _view;
    },
    loadGrid: (ofertaid, _imprimirWindow, lineas) => {
        ofertaId = ofertaid;
        imprimirWindow = _imprimirWindow
        numLineas = 0;
        var total = 0;
        if(ofertaId && ofertaId != 0) {
            ofertasService.getLineasOferta(ofertaId)
            .then(rows => {
                if(rows.length > 0) {
                   /*  numLineas = rows.length;
                    OfertasFormWindow.estableceNumLineas(numLineas); */
                    $$("lineasOfertaVentaGrid").clearAll();
                    $$("lineasOfertaVentaGrid").parse(generalApi.prepareDataForDataTable("ofertaLineaId", rows));
                    var numReg = $$("lineasOfertaVentaGrid").count();
                    $$("ofertasLineasVentaNReg").config.label = "NREG: " + numReg;
                    $$("ofertasLineasVentaNReg").refresh();
                    for(var i = 0; i < rows.length; i++) {
                        total = total + rows[i].totalLinea;
                        $$('importeCli').setValue(total);
                    }
                }else {
                    $$("lineasOfertaVentaGrid").clearAll();
                    $$('importeCli').setValue(total);
                }
            })
            .catch((err) => {
                messageApi.errorMessageAjax(err);
            });
        } else {
                if(lineas && lineas.length > 0) {
                   /*  numLineas = rows.length;
                    OfertasFormWindow.estableceNumLineas(numLineas); */
                    $$("lineasOfertaVentaGrid").clearAll();
                    $$("lineasOfertaVentaGrid").parse(generalApi.prepareDataForDataTable("ofertaLineaId", lineas));
                    var numReg = $$("lineasOfertaVentaGrid").count();
                    $$("ofertasLineasVentaNReg").config.label = "NREG: " + numReg;
                    $$("ofertasLineasVentaNReg").refresh();
                    for(var i = 0; i < lineas.length; i++) {
                        total = total + lineas[i].totalLinea;
                        $$('importeCli').setValue(total);
                    }
                }else {
                    $$("lineasOfertaVentaGrid").clearAll();
                    $$('importeCli').setValue(total);
                }
        }
    },
    delete: (id, ofertaLinea, app) => {
        const translate = app.getService("locale")._;
        var self = this;
        webix.confirm({
            title: translate("AVISO"),
            text: translate("Está seguro que desea eliminar la linea "),
            type: "confirm-warning",
            callback: (action) => {
                if (action === true) {
                    ofertasService.deleteLineaOferta(id, ofertaLinea)
                        .then(result => {
                           lineasOfertaVenta.loadGrid(ofertaId);
                           proveedoresOferta.loadGrid(ofertaId, null);
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