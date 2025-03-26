
import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { ofertasService } from "../services/ofertas_service";


var editButton = "<span class='onEdit webix_icon wxi-pencil'></span>";
var deleteButton = "<span class='onDelete webix_icon wxi-trash'></span>";
var currentIdDatatableView;
var currentRowDatatableView
var isNewRow = false;
var ofertaId;
var numLineas = 0;
var expedienteId = null;
var _app = null;
var importeObra = 0;
export const ofertasVenta = {
    // Devuelve el grid con los locales afectados
    // se le pasa la app porque es necesaria para conservar el translate.
    getGrid: (app) => {
        _app = app
        //anticipoProveedorFormWindow.getWindow(app);
        const translate = app.getService("locale")._;
        var pagerOfertasVenta = {
            cols: [
                {
                    view: "button", type: "icon", icon: "wxi-plus", width: 37, align: "left", hotkey: "Ctrl+A",
                    tooltip: translate("Nueva oferta de venta (Ctrl+A)"),
                    click: () => {
                        app.show('/top/ofertasVentaForm?ofertaId=0&expedienteId=' + expedienteId + '&importeObra=' + importeObra);
                    }
                },
                {
                    view: "button", type: "icon", icon: "mdi mdi-refresh", width: 37, align: "left", hotkey: "Ctrl+R",
                    tooltip: translate("Refrescar la lista (Ctrl+R)"),
                    click: ()=>{
                        //this.cleanAndloadSolicitud();
                    }
                },
                {
                    view: "button", type: "icon", icon: "wxi-download", width: 37, align: "right",
                    tooltip: translate("Descargar como Excel"),
                    click: () => {
                        webix.toExcel($$("expedientesGridSolicitud"), {
                            filename: "expedientes",
                            name: "oferta",
                            rawValues: true,
                            ignore: { "actions": true }
                        });
                    }
                },
                {
                    view: "label", id: "ofertasVentaNReg", label: "NREG: "
                },
                {
                    view: "pager", id: "mypagerVenta", css: { "text-align": "right" },
                    template: "{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}",
                    size: 25,
                    group: 5
                }
            ]
        };

        var toolbarAfertasVenta = {
            view: "toolbar", padding: 3, elements: [
                { view: "icon", icon: "mdi mdi-folder-network-outline", width: 37, align: "left" },
                { view: "label", label: translate("Presupuestos de venta") }
            ]
        };
        
        var actionsTemplate = editButton;
        // Control de permiso de borrado
        actionsTemplate += deleteButton;
        var datatableOfertasVenta = {
            view: "datatable",
            id: "ofertasVentaGrid",
            scroll: "x,y",
            pager: "mypagerVenta",
            select: "row",
            autoheight: false,
            type:{
                rcheckbox:function(obj, common, value, config){
                    var checked = (value == config.checkValue) ? 'checked="true"' : '';
                    return "<input disabled class='webix_table_checkbox' type='checkbox' "+checked+">";
                }
             },
            ready:function(){ $$('ofertasVentaGrid').attachEvent("onItemDblClick", function(id, e, node){
                var curRow = this.data.pull[id.row]
                var cliId = $$('clienteId').getValue();
            });},
            columns: [
                { id: "id", header: [translate("Id"), { content: "textFilter" }], sort: "string", width: 50, hidden: true },
                { id: "referencia", header: [translate("Referencia"), { content: "textFilter" }], sort: "string", adjust: "header" },
                {
                    id: "fechaOferta", header: [{ text: translate("Fecha"), css: { "text-align": "center" } }, { content: "dateFilter" }],
                    adjust: "data", sort: "string", format: webix.i18n.dateFormatStr,css: { "text-align": "center" }
                },
                { id: "empresaId", header: [translate("EmpresaId"), { content: "textFilter" }], sort: "string", fillspace: true, hidden: true},
                { id: "empresa", header: [translate("Empresa"), { content: "textFilter" }], sort: "string",  adjust: "header"},
                { id: "clienteId", header: [translate("ClienteId"), { content: "textFilter" }], sort: "string", fillspace: true, hidden: true},
                { id: "cliente", header: [translate("Cliente"), { content: "textFilter" }], sort: "string", fillspace: true},
                { id: "total", header: [translate("Total"), { content: "textFilter" }], sort: "string", width: 80, format:webix.i18n.numberFormat},
                { id: "totalConIva", header: [translate("Total IVA"), { content: "textFilter" }], sort: "string", width: 80,format:webix.i18n.numberFormat},
                { id: "formaPago", header: [translate("Forma pago"), { content: "textFilter" }], sort: "string", width: 180 },
                { id: "actions", header: [{ text: translate("Acciones"), css: { "text-align": "center" } }], template: actionsTemplate, css: { "text-align": "center" } },
            ],
            rightSplit: 1,
            scroll:true,
            onClick: {
                "onDelete": function (event, id, node) {
                    var id = id.row;
                    ofertasVenta.delete(id, app);
                },
                "onEdit": function (event, id, node) {
                    var curRow = this.data.pull[id.row];
                    var ofertaId = curRow.ofertaId;
                    ofertasVenta.edit(ofertaId)
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
                            delete currentRowDatatableView.id;
                            var data = currentRowDatatableView;
                        }
                    }
                },
                "onAfterFilter": function () {
                    var numReg = $$("ofertasVentaGrid").count();
                    $$("ofertasVentaNReg").config.label = "NREG: " + numReg;
                    $$("ofertasVentaNReg").refresh();
                }
            }
        }
        const _view = {
            rows: [
                toolbarAfertasVenta,
                pagerOfertasVenta,
                datatableOfertasVenta
            ]
        }
        
        return _view;
    },
    loadGrid: (expedienteid, ofertaId, importeobra) => {
        if(expedienteid == 0) {
            expedienteId = null;
            importeObra = 0
            return;
        }
        ofertaId = ofertaId;
        importeObra = importeobra;
        numLineas = 0;
        if(expedienteid) {
            expedienteId = expedienteid;
            ofertasService.getOfertasExpediente(expedienteId, 0)
            .then(rows => {
                if(rows.length > 0) {
                    rows = ofertasVenta.formateaCampos(rows);
                    numLineas = rows.length;
                    $$("ofertasVentaGrid").clearAll();
                    $$("ofertasVentaGrid").parse(generalApi.prepareDataForDataTable("ofertaId", rows));
                    var numReg = $$("ofertasVentaGrid").count();
                    $$("ofertasVentaNReg").config.label = "NREG: " + numReg;
                    $$("ofertasVentaNReg").refresh();
                }else {
                    $$("ofertasVentaGrid").clearAll();
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
        } else {
            $$("ofertasVentaGrid").clearAll();
            return;
        }
        
        
    },
    delete: (id, app) => {    
        const translate = app.getService("locale")._;
        webix.confirm({
            title: translate("AVISO"),
            text: translate("¿ Está seguro que desea eliminar esta oferta ?"),
            type: "confirm-warning",
            callback: (action) => {
                if (action === true) {
                    ofertasService.deleteOferta(id)
                        .then(result => {
                            ofertasVenta.loadGrid(expedienteId, null, importeObra);
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

    edit(ofertaId) {
       
        const activeTab = $$("tabViewExpediente").getValue();  // Obtener el id de la pestaña activa
        localStorage.setItem("activeTab", activeTab);

        _app.show('/top/ofertasVentaForm?ofertaId=' + ofertaId +'&expedienteId=' + expedienteId + '&importeObra=' + importeObra);
    },

    formateaCampos(data) {
        data.forEach(e => {
            e.empresa = e.empresa.substr(0,3);
            e.fechaOferta = new Date(e.fechaOferta);
        });
        return data;
    }
}