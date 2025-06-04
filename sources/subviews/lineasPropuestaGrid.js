//PARTIDAS

import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { propuestasService } from "../services/propuestas_service";
import "../styles/app.css"; 


var editButton = "<span class='onEdit webix_icon wxi-pencil'></span>";
var deleteButton = "<span class='onDelete webix_icon wxi-trash'></span>";
var currentIdDatatableView;
var currentRowDatatableView
var isNewRow = false;



var propuestaId;
var numLineas;
var subcontrataId;
var imprimirWindow;
var importeObra = 0;


export const lineasPropuesta = {
    // Devuelve el grid con los locales afectados
    // se le pasa la app porque es necesaria para conservar el translate.
    getGrid: (app) => {
       
        const translate = app.getService("locale")._;
  
        var toolbarlineasPropuesta = {
        
                view: "toolbar", padding: 3, css: {"background-color": "#F4F5F9"}, elements: [
                    { view: "icon", icon: "mdi mdi-currency-eur", width: 37, align: "left" },
                    { view: "label", label: "LINEAS" }
                ]
            
        };
      
        var actionsTemplate = editButton;
        // Control de permiso de borrado
        actionsTemplate += deleteButton;
        var datatablelineasPropuesta = {
            view: "datatable",
            scroll: "x,y",
            id: "lineasPropuestaGrid",
           
            select: "row",
            autoheight:true,
            footer: false,
            css: {"word-wrap": "break-word"},
            fixedRowHeight: true,
            ready:function(){
              this.adjustRowHeight();
            },
            columns: [
                { id: "propuestaLineaId", header: [translate("Id")], sort: "string", width: 50, hidden: true },
                { id: "ofertaCostelineaId", header: [translate("Id")], sort: "string", width: 50, hidden: true },
                { id: "propuestaId", header: [translate("Id")], sort: "string", width: 50, hidden: true },
                { id: "linea", header: [translate("Linea")], sort: "string", width: 60, hidden: true  },
                { 
                    id: "descripcion", 
                    header: ["PRESUPUESTO", translate("Concepto")], 
                    sort: "string", 
                    fillspace: true,
                    editor: "popup", // 🔹 Usa un editor emergente
                    maxWidth: 400
                    
                },
                { id: "unidades", header: ["", translate("Uds.")], sort: "string", width: 40, adjust: "all" },
                { id: "importe", header:  ["", translate("€/Ud.")], sort: "string", width: 80,format:webix.i18n.numberFormat, css: { "text-align": "right" }, adjust: "all"},
                { id: "cantidad", header: ["", translate("Cant.")], sort: "string", width: 50, css: { "text-align": "right" } , adjust: "all" },
                { id: "dto", header: ["", translate("Descuento")], sort: "string", width: 100,format:webix.i18n.numberFormat, css: { "text-align": "right" }, adjust: "all" },
                { id: "costeLinea", header: ["", translate("Total")], sort: "string", width: 80,format:webix.i18n.numberFormat, css: { "text-align": "right" }, adjust: "all" },


                { id: "propuestaImporte", header: ["PROPUESTA", translate("€/Ud.")], sort: "string", width: 80, editor: "text",  format: webix.i18n.numberFormat,  css: { "text-align": "right"}, adjust: "all"   },
                { id: "propuestaTotalLinea", header: ["", translate("Total")], sort: "string", width: 80, editor: "text",  format: webix.i18n.numberFormat,  css: { "text-align": "right"},  adjust: "all"   },
                
            ],
            onClick: {
                "onDelete": function (event, id, node) {
                    var dtable = this;
                    var id = id.row;
                    var curRow = this.data.pull[id];

                    lineasPropuesta.delete(id, curRow, app);
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
                    
                }
            }
        }
        var _view = {
            view: "layout",
            id: "lineasDelPropuesta",
            rows: [
                toolbarlineasPropuesta,
                datatablelineasPropuesta
            ]
        }
        
        return _view;
    },
    loadGrid: (propuestaid, subcontrataid, rows) => {
        propuestaId = propuestaid;
        subcontrataId = subcontrataid
        numLineas = 0;
        if(propuestaId > 0) {
            propuestasService.getLineasPropuesta(propuestaId)
            .then(rows2 => {
                var total = 0;
                if(rows2.length > 0) {
                    $$("lineasPropuestaGrid").clearAll();
                    $$("lineasPropuestaGrid").parse(generalApi.prepareDataForDataTable("propuestaLineaId", rows2));
                    var numReg = $$("lineasPropuestaGrid").count();
                   
                    for(var i = 0; i < rows2.length; i++) {
                        total = total + parseFloat(rows2[i].propuestaTotalLinea);
                        $$('totalPropuesta').setValue(total);
                    }
                }else {
                    $$("lineasPropuestaGrid").clearAll();
                    $$('totalPropuesta').setValue(total);
                }
            })
            .catch((err) => {
                messageApi.errorMessageAjax(err);
            });
        } else {
            if(rows.length > 0) {
                 
                 $$("lineasPropuestaGrid").clearAll();
                 $$("lineasPropuestaGrid").parse(generalApi.prepareDataForDataTable("propuestaLineaId", rows));
                 var numReg = $$("lineasPropuestaGrid").count();
               
                 for(var i = 0; i < rows.length; i++) {
                     total = total + parseFloat(rows[i].propuestaTotalLinea);
                     $$('totalPropuesta').setValue(total);
                 }
             }else {
                 $$("lineasPropuestaGrid").clearAll();
                 $$('totalPropuesta').setValue(total);
             }
        }
    },
    delete: (id, propuestaLinea, app) => {
        const translate = app.getService("locale")._;
        var self = this;
        webix.confirm({
            title: translate("AVISO"),
            text: translate("Está seguro que desea eliminar la linea "),
            type: "confirm-warning",
            callback: (action) => {
                if (action === true) {
                    propuestasService.deleteLineaPropuesta(id, propuestaLinea)
                        .then(result => {
                           lineasPropuesta.loadGrid(propuestaId);
                           //proveedoresPropuesta.loadGrid(propuestaId, null);
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

webix.editors.$popup = {
    text:{
        view:"popup", 
        body:{view:"textarea", width:550, height:550, disabled: true}
    }
};