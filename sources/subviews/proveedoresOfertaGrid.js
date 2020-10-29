//PROVEEDORES DE LA OFERTA

import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { ofertasService } from "../services/ofertas_service";

var ofertaId;

export const proveedoresOferta = {
    // Devuelve el grid con los locales afectados
    // se le pasa la app porque es necesaria para conservar el translate.
    getGrid: (app) => {
       
        const translate = app.getService("locale")._;
        try {
        }catch(e) {
            console.log(e);
        }
  
        var toolbarproveedoresOferta = {
            view: "toolbar", padding: 3, elements: [
                { view: "icon", icon: "mdi mdi-folder-network-outline", width: 37, align: "left" },
                { view: "label", label: translate("Lineas de la oferta") }
            ]
        };
        var pagerproveedoresOferta = {
            cols: [
                {
                    view: "label", id: "poeveedoresNReg", label: "NREG: "
                },
                {
                    view: "pager", id: "mypager2", css: { "text-align": "right" },
                    template: "{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}",
                    size: 25,
                    group: 5
                }
            ]
        };
        var datatableproveedoresOferta = {
            view: "datatable",
            scroll: "x",
            id: "proveedoresOfertaGrid",
            pager: "mypager2",
            select: "row",
            autoheight:true,
            footer: false,
            columns: [
                { id: "proveedorId", header: [translate("Id"), { content: "textFilter" }], sort: "string", width: 50, hidden: true }, 
                { id: "proveedornombre", header: [translate("Proveedor"), { content: "textFilter" }], sort: "string", fillspace: true},
                { id: "totalProveedor", header: [translate("Base"), { content: "textFilter" }], sort: "string", width: 80,format:webix.i18n.numberFormat },
                { id: "totalProveedorIva", header: [translate("Total"), { content: "textFilter" }], sort: "string", width: 100,format:webix.i18n.numberFormat },
            ],
            onClick: {
                "onDelete": function (event, id, node) {
                },
                "onEdit": function (event, id, node) {
                    
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
                    var numReg = $$("proveedoresOfertaGrid").count();
                    $$("poeveedoresNReg").config.label = "NREG: " + numReg;
                    $$("poeveedoresNReg").refresh();
                }
            }
        }
        var _view = {
            view: "layout",
            id: "poeveedoresDelaOferta",
            rows: [
                toolbarproveedoresOferta,
                pagerproveedoresOferta,
                datatableproveedoresOferta
            ]
        }
        
        return _view;
    },
    loadGrid: (ofertaid) => {
        ofertaId = ofertaid;
        if(ofertaId) {
            ofertasService.getProveedoresOferta(ofertaId)
            .then(rows => {
                if(rows.length > 0) {
                    for(var i = 0; i < rows.length; i++) {
                        if(rows[i].proveedorId == null) {
                            //rows[i].proveedorId =  111111110;
                            rows[i].proveedornombre = "Sin proveedor asignado";
                            rows[i].totalProveedorIva = rows[i].totalLinea;
                            
                        }
                    }
                    $$("proveedoresOfertaGrid").clearAll();
                    $$("proveedoresOfertaGrid").parse(generalApi.prepareDataForDataTable("proveedorId", rows));
                    var numReg = $$("proveedoresOfertaGrid").count();
                    $$("poeveedoresNReg").config.label = "NREG: " + numReg;
                    $$("poeveedoresNReg").refresh();
                }else {
                    $$("proveedoresOfertaGrid").clearAll();
                }
            })
            .catch((err) => {
                messageApi.errorMessageAjax(err);
            });
        } else {
            $$("proveedoresOfertaGrid").clearAll();
        }
    },
}