//LINEAS DE LA OFERTA

import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { ofertasService } from "../services/ofertas_service";
//import { facturacionService } from "../services/facturacion_service";

var editButton = "<span class='onEdit webix_icon wxi-pencil'></span>";
var deleteButton = "<span class='onDelete webix_icon wxi-trash'></span>";
var currentIdDatatableView;
var currentRowDatatableView
var isNewRow = false;



var ofertaId;
var numLineas;


export const lineasOferta = {
    // Devuelve el grid con los locales afectados
    // se le pasa la app porque es necesaria para conservar el translate.
    getGrid: (app) => {
       
        const translate = app.getService("locale")._;
        //lineasOfertaWindow.getWindow(app);
        var toolbarlineasOferta = {
            view: "toolbar", padding: 3, elements: [
                { view: "icon", icon: "mdi mdi-folder-network-outline", width: 37, align: "left" },
                { view: "label", label: translate("Lineas de la oferta") }
            ]
        };
        var pagerlineasOferta = {
            cols: [
                {
                    view: "button", id: "btnNew3", type: "icon", icon: "wxi-plus", width: 37, align: "left", hotkey: "Ctrl+A",
                    tooltip: translate("Nuevo registro en formulario (Ctrl+A)"),
                    click: () => {
                        // Alta de una nueva relación
                        if (!ofertaId) {
                            // Hay que dar de alta previamente el concepto.
                            messageApi.errorMessage(translate("Debe dar de alta el parte antes las lineas"));
                            return;
                        }
                        else if($$('cmbProveedores').getValue() == '') {
                            messageApi.errorMessage(translate("Tiene que asignar un profesional al parte"));
                            return;
                        }
                        else {
                            var proId = $$('cmbProveedores').getValue();
                            var cliId = $$('cliId').getValue();
                          
                            lineasOfertaWindow.loadWindow(ofertaId, null, cliId, proId, );
                        }

                    }
                },
                {
                    view: "label", id: "partesLineasNReg", label: "NREG: "
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
        var datatablelineasOferta = {
            view: "datatable",
            scroll: "x",
            id: "lineasOfertaGrid",
            pager: "mypager3",
            select: "row",
            autoheight:true,
            footer: false,
            ready:function(){ $$('lineasOfertaGrid').attachEvent("onItemDblClick", function(id, e, node){
                var curRow = this.data.pull[id.row]
                var proId = $$('cmbProveedores').getValue();
                var cliId = $$('cliId').getValue();
                lineasOfertaWindow.loadWindow(curRow.ofertaId, curRow.parteLineaId, cliId, proId,);
            });},
            columns: [
                { id: "ofertaLineaId", header: [translate("Id"), { content: "textFilter" }], sort: "string", width: 50, hidden: true },
                { id: "linea", header: [translate("Linea"), { content: "textFilter" }], sort: "string", width: 80  },
                { id: "unidades", header: [translate("Uds."), { content: "textFilter" }], sort: "string", width: 40 },
                { id: "descripcion", header: [translate("Concepto"), { content: "textFilter" }], sort: "string", fillspace: true},
                
                { id: "importe", header: [translate("€/Ud. Cli."), { content: "textFilter" }], sort: "string", width: 80,format:webix.i18n.numberFormat},
                { id: "cantidad", header: [translate("Cantidad"), { content: "textFilter" }], sort: "string", width: 50  },
                { id: "dto", header: [translate("Descuento"), { content: "textFilter" }], sort: "string", width: 100,format:webix.i18n.numberFormat },
                { id: "costeLinea", header: [translate("Imp cli."), { content: "textFilter" }], sort: "string", width: 80,format:webix.i18n.numberFormat },
                
                { id: "proveedorId", header: [translate("Id"), { content: "textFilter" }], sort: "string", width: 50, hidden: true },
                { id: "proveedorNombre", header: [translate("Proveedor"), { content: "textFilter" }], sort: "string", fillspace: true},
                { id: "importeProveedor", header: [translate("€/Ud. Pro."), { content: "textFilter" }], sort: "string", width: 80,format:webix.i18n.numberFormat },
                { id: "dtoProveedor", header: [translate("Descuento pro."), { content: "textFilter" }], sort: "string", width: 100,format:webix.i18n.numberFormat },
                { id: "costeLineaProveedor", header: [translate("Imp pro."), { content: "textFilter" }], sort: "string", width: 80,format:webix.i18n.numberFormat },
                
                { id: "actions", header: [{ text: translate("Acciones"), css: { "text-align": "center" } }], template: actionsTemplate, css: { "text-align": "center" } },
            ],
            rightSplit: 1,
            onClick: {
                "onDelete": function (event, id, node) {
                    var dtable = this;
                    var id = id.row;
                    var curRow = this.data.pull[id];
                    var name = curRow.codigoArticulo;

                    var facproveLineaId = curRow.facproveLineaId;
                    var facproveId = curRow.facproveId;

                    var facturaLineaId = curRow.facturaLineaId;
                    var facturaId = curRow.facturaId;

                    lineasOferta.delete(id, name, app, facproveLineaId, facproveId, facturaLineaId, facturaId);
                },
                "onEdit": function (event, id, node) {
                    var curRow = this.data.pull[id.row];
                    var proId = $$('cmbProveedores').getValue();
                    var cliId = $$('cliId').getValue();
                    
                    lineasOfertaWindow.loadWindow(curRow.ofertaId, curRow.parteLineaId,  cliId, proId, );
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
                        }
                    }
                },
                "onAfterFilter": function () {
                    var numReg = $$("lineasOfertaGrid").count();
                    $$("partesLineasNReg").config.label = "NREG: " + numReg;
                    $$("partesLineasNReg").refresh();
                }
            }
        }
        var _view = {
            view: "layout",
            id: "lineasDelParte",
            rows: [
                toolbarlineasOferta,
                pagerlineasOferta,
                datatablelineasOferta
            ]
        }
        
        return _view;
    },
    loadGrid: (ofertaid) => {
        ofertaId = ofertaid;
         
        numLineas = 0;
        if(ofertaId) {
            ofertasService.getLineasOferta(ofertaId)
            .then(rows => {
                if(rows.length > 0) {
                   /*  numLineas = rows.length;
                    PartesFormWindow.estableceNumLineas(numLineas); */
                    $$("lineasOfertaGrid").clearAll();
                    $$("lineasOfertaGrid").parse(generalApi.prepareDataForDataTable("ofertaLineaId", rows));
                    var numReg = $$("lineasOfertaGrid").count();
                    $$("partesLineasNReg").config.label = "NREG: " + numReg;
                    $$("partesLineasNReg").refresh();
                    //lineasOferta.estableceContado(rows);
                }else {
                    $$("lineasOfertaGrid").clearAll();
                    //lineasOferta.estableceContado(null);
                    //PartesFormWindow.estableceNumLineas(numLineas);
                }
            })
            .catch((err) => {
                messageApi.errorMessageAjax(err);
            });
        } else {
            $$("lineasOfertaGrid").clearAll();
            return
        }
    },
    delete: (id, name, app, facproveLineaId, facproveId, facturaLineaId, facturaId) => {
        var facprove = {};
        var factura = {};
        const translate = app.getService("locale")._;
        var self = this;
        if(facproveLineaId || facturaLineaId) {
            name += ". Este parte tiene facturas asocidas. La linea que borre tembién será eliminada de la facturas en la que se encuentre."
        }
        webix.confirm({
            title: translate("AVISO"),
            text: translate("Está seguro que desea eliminar la linea con codigo articulo *").replace('*', name),
            type: "confirm-warning",
            callback: (action) => {
                if (action === true) {
                    partesService.deleteLineaParte(id, ofertaId)
                        .then(result => {
                            if(facproveLineaId) {
                                facprove = 
                                    {
                                        facproveId: facproveId,
                                        facproveLineaId: facproveLineaId
                                    };
                                facturacionService.deleteLineaFacprove(facproveLineaId, facprove)
                                    .then(result2 => {
                                        
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
                            if(facturaLineaId) {
                                factura = 
                                    {
                                        facturaId: facturaId,
                                        facturaLineaId: facturaLineaId
                                    };
                                facturacionService.deleteLineaFactura(facturaLineaId, factura)
                                    .then(result => {
                                       
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
                             console.log($$("cmbEstadosParteProfesional").getValue())
                                lineasOferta.loadGrid(ofertaId);
                                $$('importeCli').setValue(result.importe_cliente);
                                $$('importeCliIva').setValue(result.importe_cliente_iva);

                                $$('importePro').setValue(result.importe_profesional);
                                $$('importeProIva').setValue(result.importe_profesional_iva);
                                $$('aCuentaProfesional').setValue(result.aCuentaProfesional);
                            
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