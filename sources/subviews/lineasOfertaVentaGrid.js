//PARTIDAS

import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { ofertasService } from "../services/ofertas_service";
import { LineasOfertaWindow } from "./lineasOfertaWindow";
import { proveedoresOferta } from "./proveedoresOfertaGrid";
var editButton = "<span class='onEdit webix_icon wxi-pencil'></span>";
var deleteButton = "<span class='onDelete webix_icon wxi-trash'></span>";
var ofertaId;
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
                { view: "label", label: translate("PARTIDAS") }
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
            columns: [
                { id: "ofertaLineaId", header: [translate("Id"), { content: "textFilter" }], sort: "string", width: 50, hidden: true },
                { id: "ofertaId", header: [translate("Id"), { content: "textFilter" }], sort: "string", width: 50, hidden: true },
                { id: "linea", header: [translate("Linea"), { content: "textFilter" }], sort: "string", width: 80  },
                { id: "nombreGrupoArticulo", header: [translate("Capítulo"), { content: "textFilter" }], sort: "string", fillspace: true},
                { id: "nombreArticulo", header: [translate("Partida"), { content: "textFilter" }], sort: "string", fillspace: true},
                { id: "unidades", header: [translate("Uds."), { content: "textFilter" }], sort: "string", width: 40 },
                
            
                { id: "importe", header: [translate("Coste/Ud."), { content: "textFilter" }], sort: "string", width: 80,format:webix.i18n.numberFormat,  css: { "text-align": "right"}},
                { id: "cantidad", header: [translate("Cant."), { content: "textFilter" }], sort: "string", width: 50,  css: { "text-align": "right"}  },
                { id: "precio", header: [translate("Precio"), { content: "textFilter" }], sort: "string", width: 80,  css: { "text-align": "right"}  },
                { id: "coste", header: [translate("Coste"), { content: "textFilter" }], sort: "string", width: 80, hidden:true,  css: { "text-align": "right"}  },
                //{ id: "dto", header: [translate("Descuento"), { content: "textFilter" }], sort: "string", width: 100,format:webix.i18n.numberFormat },
                { id: "importeBeneficioLinea", header: [translate("BI"), { content: "textFilter" }], sort: "string", width: 80,format:webix.i18n.numberFormat,  css: { "text-align": "right"}},
                { id: "ventaNetaLinea", header: [translate("venta neta"), { content: "textFilter" }], sort: "string", width: 80,format:webix.i18n.numberFormat, hidden: true,  css: { "text-align": "right"}},
               
                { id: "importeAgenteLinea", header: [translate("Imp. Agente."), { content: "textFilter" }], sort: "string", width: 110,format:webix.i18n.numberFormat,  css: { "text-align": "right"} },
                
                { id: "totalLinea", header: [translate("Total."), { content: "textFilter" }], sort: "string", width: 80,format:webix.i18n.numberFormat,  css: { "text-align": "right"} },
                
                { id: "porcentajeBeneficioLinea", header: [translate("% BI"), { content: "textFilter" }], sort: "string", width: 80, editor: "text",  format: webix.i18n.numberFormat,  css: { "text-align": "right"}   },
                
    
                //{ id: "actions", header: [{ text: translate("Acciones"), css: { "text-align": "center" } }], template: actionsTemplate, css: { "text-align": "center" } },
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
                },
                
            },
            editable: true,
            editaction: "dblclick",
            rules: {

            },
            on: {
                "onAfterEditStart": function (id) {
                    
                },
                "onAfterEditStop": function (state, editor, ignoreUpdate) {
                    if (editor.column == "porcentajeBeneficioLinea") {  
                        var row = this.getItem(editor.row);
                        var antTotalLinea = row.totalLinea; // guardamnos el importe antes de cambiarlo
                        var totaAlCliente =   $$('importeCli').getValue(); //recuperamos el total al cliente
                        totaAlCliente = totaAlCliente - antTotalLinea; //restamos el valor que se va a modificar
                        var porcentajeBeneficioLinea = parseFloat(state.value.replace(",", ".")) / 100 || 0;
                        var precio = parseFloat(row.costeLinea) || 0;
                        var cantidad = parseFloat(row.cantidad) || 0;
                       
                        var porcentajeAgente = parseFloat($$('porcentajeAgente').getValue());
                      
 
                        var importeBeneficioLinea = porcentajeBeneficioLinea * precio;
                        var importe = precio / cantidad;
                        var ventaNeta =  precio + importeBeneficioLinea;

                        var totalLinea = ventaNeta / ((100 - porcentajeAgente) / 100);
                        var importeAgenteLinea = totalLinea - (precio + importeBeneficioLinea);
                        

                        totaAlCliente = totaAlCliente + totalLinea; //sumamos el nuevo valor modificado
                        $$('importeCli').setValue(totaAlCliente);// actualizamos el precio
                        
                        row.totalLinea = totalLinea;
                        row.importeAgenteLinea = importeAgenteLinea;
                        row.porcentajeBeneficioLinea = porcentajeBeneficioLinea * 100;
                        row.importeBeneficioLinea = importeBeneficioLinea;
                        row.importe = importe;
                        row.precio = precio;
                        row.coste = precio;
                        row.ventaNetaLinea = ventaNeta;

                        this.updateItem(editor.row, row);  // Actualizar fila
                    }
                },
                "OnAfterLoad": function ( ) {
                  setTimeout( () => {
                    var porcentajeBeneficioLinea  = $$('porcentajeBeneficio').getValue()  / 100 || 0;
                    var datatable = $$("lineasOfertaVentaGrid");
                    var totaAlCliente = 0;
                    datatable.eachRow(function (rowId) {
                        var row = datatable.getItem(rowId);
                       
                        var precio = parseFloat(row.costeLinea) || 0;
                        var cantidad = parseFloat(row.cantidad) || 0;
                      
                        var porcentajeAgente = parseFloat($$('porcentajeAgente').getValue());
                      
 
                        var importeBeneficioLinea = porcentajeBeneficioLinea * precio;
                        var importe = precio / cantidad;
                        var ventaNeta =  precio + importeBeneficioLinea;

                        var totalLinea = ventaNeta / ((100 - porcentajeAgente) / 100);
                        var importeAgenteLinea = totalLinea - (precio + importeBeneficioLinea);
                        

                        totaAlCliente = totaAlCliente + totalLinea;
                        row.totalLinea = totalLinea;
                        row.importeAgenteLinea = importeAgenteLinea;
                        row.porcentajeBeneficioLinea = porcentajeBeneficioLinea * 100;
                        row.importeBeneficioLinea = importeBeneficioLinea;
                        row.importe = importe;
                        row.precio = precio;
                        row.coste = precio;
                        row.ventaNetaLinea = ventaNeta;
                        
            
                        datatable.updateItem(rowId, row);
                    });
                    $$('importeCli').setValue(totaAlCliente);
                  }, 100)
                    
                    
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
        var total = 0;
        if(ofertaId && ofertaId != 0) {
            ofertasService.getLineasOferta(ofertaId)
            .then(rows => {
                if(rows.length > 0) {
                  
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
    }
}