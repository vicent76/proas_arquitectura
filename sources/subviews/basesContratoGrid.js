//BASES DE LA OFERTA

import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { contratosService } from "../services/contratos_service";



var currentIdDatatableView;
var currentRowDatatableView
var isNewRow = false;



var contratoId;


export const basesContrato = {
    // Devuelve el grid con los locales afectados
    // se le pasa la app porque es necesaria para conservar el translate.
    getGrid: (app) => {
       
        const translate = app.getService("locale")._;
        //basesContratoWindow.getWindow(app);
        var toolbarbasesContrato = {
            view: "toolbar", padding: 3, elements: [
                { view: "icon", icon: "mdi mdi-folder-network-outline", width: 37, align: "left" },
                { view: "label", label: translate("Bases de la contrato") }
            ]
        };
        var pagerbasesContrato = {
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
        var datatablebasesContrato = {
            view: "datatable",
            id: "basesContratoGrid",
            pager: "mypager",
            select: "row",
            autoheight:true,
            footer: false,
            columns: [
                { id: "contratoBaseId", header: [translate("Id"), { content: "textFilter" }], sort: "string", width: 50, hidden: true },
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
                    var numReg = $$("basesContratoGrid").count();
                    $$("basesLineasNReg").config.label = "NREG: " + numReg;
                    $$("basesLineasNReg").refresh();
                }
            }
        }
        var _view = {
            view: "layout",
            id: "basesContrato",
            rows: [
                toolbarbasesContrato,
                pagerbasesContrato,
                datatablebasesContrato
            ]
        }
        
        return _view;
    },
    loadGrid: (contratoid) => {
        contratoId = contratoid;
        if(contratoId) {
            contratosService.getBasesContrato(contratoId)
            .then(rows => {
                if(rows.length > 0) {
                    $$("basesContratoGrid").clearAll();
                    $$("basesContratoGrid").parse(generalApi.prepareDataForDataTable("contratoBaseId", rows));
                    var numReg = $$("basesContratoGrid").count();
                    $$("basesLineasNReg").config.label = "NREG: " + numReg;
                    $$("basesLineasNReg").refresh();
                }else {
                    $$("basesContratoGrid").clearAll();
                }
            })
            .catch((err) => {
                messageApi.errorMessageAjax(err);
            });
        } else {
            $$("basesContratoGrid").clearAll();
            return
        }
    }
}