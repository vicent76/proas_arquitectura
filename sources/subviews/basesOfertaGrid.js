//BASES DE LA OFERTA

import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { ofertasService } from "../services/ofertas_service";



var currentIdDatatableView;
var currentRowDatatableView
var isNewRow = false;



var ofertaId;


export const basesOferta = {
    // Devuelve el grid con los locales afectados
    // se le pasa la app porque es necesaria para conservar el translate.
    getGrid: (app) => {
       
        const translate = app.getService("locale")._;
        //basesOfertaWindow.getWindow(app);
        var toolbarbasesOferta = {
            view: "toolbar", padding: 3, elements: [
                { view: "icon", icon: "mdi mdi-folder-network-outline", width: 37, align: "left" },
                { view: "label", label: translate("Bases de la oferta") }
            ]
        };
        var pagerbasesOferta = {
            cols: [
                {
                    view: "label", id: "basesLineasNReg", label: "NREG: "
                },
                {
                    view: "pager", id: "mypager", css: { "text-align": "right" },
                    template: "{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}",
                    size: 25,
                    group: 5
                }
            ]
        };
        // Control de permiso de borrado
        var datatablebasesOferta = {
            view: "datatable",
            id: "basesOfertaGrid",
            pager: "mypager",
            select: "row",
            autoheight:true,
            footer: false,
            columns: [
                { id: "ofertaBaseId", header: [translate("Id"), { content: "textFilter" }], sort: "string", width: 50, hidden: true },
                { id: "tipoIvaId", header: [translate("Id"), { content: "textFilter" }], sort: "string", width: 50, hidden: true },
                { id: "tipo", header: [translate("Tipo"), { content: "textFilter" }], sort: "string", minWidth: 180  },
                { id: "porcentaje", header: [translate("Porcentaje"), { content: "textFilter" }], sort: "string", minWidth: 140 },
                { id: "base", header: [translate("Base"), { content: "textFilter" }], sort: "string", minWidth: 380,format:webix.i18n.numberFormat},
                { id: "cuota", header: [translate("Cuota"), { content: "textFilter" }], sort: "string", fillspace: true, format:webix.i18n.numberFormat}
            ],
            onClick: {
                "onDelete": function (event, id, node) {
                    
                },
                "onEdit": function (event, id, node) {
                    
                }
            },
            editable: false,
            rules: {

            },
            on: {
                "onAfterEditStart": function (id) {
                    
                },
                "onAfterEditStop": function (state, editor, ignoreUpdate) {
                    
                },
                "onAfterFilter": function () {
                    var numReg = $$("basesOfertaGrid").count();
                    $$("basesLineasNReg").config.label = "NREG: " + numReg;
                    $$("basesLineasNReg").refresh();
                }
            }
        }
        var _view = {
            view: "layout",
            id: "basesOferta",
            rows: [
                toolbarbasesOferta,
                pagerbasesOferta,
                datatablebasesOferta
            ]
        }
        
        return _view;
    },
    loadGrid: (ofertaid) => {
        ofertaId = ofertaid;
        if(ofertaId) {
            ofertasService.getBasesOferta(ofertaId)
            .then(rows => {
                if(rows.length > 0) {
                    $$("basesOfertaGrid").clearAll();
                    $$("basesOfertaGrid").parse(generalApi.prepareDataForDataTable("ofertaBaseId", rows));
                    var numReg = $$("basesOfertaGrid").count();
                    $$("basesLineasNReg").config.label = "NREG: " + numReg;
                    $$("basesLineasNReg").refresh();
                }else {
                    $$("basesOfertaGrid").clearAll();
                }
            })
            .catch((err) => {
                messageApi.errorMessageAjax(err);
            });
        } else {
            $$("basesOfertaGrid").clearAll();
            return
        }
    }
}