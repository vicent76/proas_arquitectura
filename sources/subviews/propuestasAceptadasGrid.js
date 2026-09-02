
import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { propuestasService } from "../services/propuestas_service";
import OfertasEpisReport from "../views/ofertasEpisReport";


var editButton = "<span class='onEdit webix_icon wxi-pencil'></span>";
var deleteButton = "<span class='onDelete webix_icon wxi-trash'></span>";
var PrintButton = "<span class='onPrint mdi mdi-printer'></span>";
var currentIdDatatableView;
var currentRowDatatableView
var isNewRow = false;
var ofertaId;
var selectOfertaId = null;
var numLineas = 0;
var expedienteId = null;
var _app = null;


export const PropuestasAceptadasGrid = {
    // Devuelve el grid con los locales afectados
    // se le pasa la app porque es necesaria para conservar el translate.
    getGrid: (app) => {
        _app = app
        //anticipoProveedorFormWindow.getWindow(app);
        const translate = app.getService("locale")._;
        var pagerPropuestasAceptadas = {
            cols: [
                {
                    view: "button", type: "icon", icon: "wxi-plus", width: 37, align: "left", hotkey: "Ctrl+A",
                    tooltip: translate("Nuevo registro en formulario (Ctrl+A)"),
                    click: () => {
                        this.show('/top/propuestaForm?propuestaId=0&subcontrataId=' + subcontrataId + '&expedienteId=' + expedienteId);
                    }
                },
                {
                    view: "button", type: "icon", icon: "mdi mdi-refresh", width: 37, align: "left", hotkey: "Ctrl+R",
                    tooltip: translate("Refrescar la lista (Ctrl+R)"),
                    click: () => {
                        this.cleanAndload();
                    }
                },
                {
                    view: "button", type: "icon", icon: "wxi-download", width: 37, align: "right",
                    tooltip: translate("Descargar como Excel"),
                    click: () => {
                        webix.toExcel($$("propuestasAceptadasGrid"), {
                            filename: "propuestas",
                            name: "propuesta",
                            rawValues: true,
                            ignore: { "actions": true }
                        });
                    }
                },
                {
                    view: "label", id: "PropuestasAceptadasNReg", label: "NREG: "
                },
                {
                    view: "pager", id: "mypagerPropuestas", css: { "text-align": "right" },
                    template: "{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}",
                    size: 25,
                    group: 5
                }
            ]
        };



        var actionsTemplate = editButton;
        actionsTemplate += deleteButton;
        actionsTemplate += PrintButton;
        var datatablePropuestasAceptadas = {
            view: "datatable",
            css: { "font-size": "0.9em" },
            id: "propuestasAceptadasGrid",
            scroll: "x,y",
            pager: "mypagerPropuestas",
            select: "row",
            autoheight: true,
            scheme: {
                $change: function (item) {
                    var odd = $$("propuestasAceptadasGrid").getIndexById(item.id) % 2
                    if (!odd) {
                        item.$css = { "background": "#E6E7E7" };
                    }
                }
            },
            ready: function () {
                this.attachEvent("onItemDblClick", function (id, e, node) {
                    var curRow = this.data.pull[id.row];
                    var propuestaId = curRow.propuestaId;
                    var subcontrataId = curRow.subcontrataId;
                    PropuestasAceptadasGrid.edit(propuestaId, subcontrataId)
                });
            },
            columns: [
                { id: "id", header: [translate("Id"), { content: "textFilter" }], sort: "string", width: 50, hidden: true },
                { id: "proveedorId", header: [translate("Referencia"), { content: "textFilter" }], width: 50, hidden: true },
                { id: "tipoProfesionalId", header: [translate("tipoProfesionalId"), { content: "textFilter" }], sort: "string", adjust: "data", hidden: true },
                { id: "titulo", header: [translate("Titulo"), { content: "textFilter" }], sort: "string", minWidth: 380, fillspace: true },
                { id: "tipoProfesionalNombre", header: [translate("Profesión"), { content: "textFilter" }], sort: "string", minWidth: 380 },
                { id: "proveedorNombre", header: [translate("Profesional"), { content: "textFilter" }], sort: "string", minWidth: 380 },
                {
                    id: "fechaDocumentacion", header: [{ text: translate("Fecha documentacion"), css: { "text-align": "center" } }, { content: "dateFilter" }],
                    adjust: "all", sort: "string", format: webix.i18n.dateFormatStr, css: { "text-align": "center" }
                },

                {
                    id: "precioObjetivo", header: [
                        { text: translate("Precio objetivo"), css: "text-align-right" },
                        { content: "textFilter" }
                    ],
                    sort: "string", width: 100,
                    format: webix.i18n.numberFormat,
                    css: "text-align-right", headerCss: "text-align-right"
                },

                {
                    id: "diferencia", header: [
                        { text: translate("Diferencia"), css: "text-align-right" },
                        { content: "textFilter" }
                    ],
                    sort: "string", width: 100,
                    format: webix.i18n.numberFormat,
                    css: "text-align-right", headerCss: "text-align-right"
                },

                {
                    id: "pvpNeto", header: [
                        { text: translate("PVP Neto"), css: "text-align-right" },
                        { content: "textFilter" }
                    ],
                    sort: "string", width: 100,
                    format: webix.i18n.numberFormat,
                    css: "text-align-right", headerCss: "text-align-right"
                },

                {
                    id: "biNeto", header: [
                        { text: translate("BI Neto"), css: "text-align-right" },
                        { content: "textFilter" }
                    ],
                    sort: "string", width: 100,
                    format: webix.i18n.numberFormat,
                    css: "text-align-right", headerCss: "text-align-right"
                },

                {
                    id: "plazoEjecucion", header: [
                        { text: translate("Plazo ejecución"), css: "text-align-right" },
                        { content: "textFilter" }
                    ],
                    sort: "string", width: 100,
                    format: webix.i18n.numberFormat,
                    css: "text-align-right", headerCss: "text-align-right"
                },

                {
                    id: "penalizacion", header: [
                        { text: translate("Penalización"), css: "text-align-right" },
                        { content: "textFilter" }
                    ],
                    sort: "string", width: 100,
                    format: webix.i18n.numberFormat,
                    css: "text-align-right", headerCss: "text-align-right"
                },

                {
                    id: "totalPropuesta", header: [
                        { text: translate("Total propuesta"), css: "text-align-right" },
                        { content: "textFilter" }
                    ],
                    sort: "string", width: 100,
                    format: webix.i18n.numberFormat,
                    css: "text-align-right", headerCss: "text-align-right"
                },

                { id: "actions", header: [{ text: translate("Acciones"), css: { "text-align": "center" } }], template: actionsTemplate, css: { "text-align": "center" } },
            ],
            rightSplit: 1,
            scroll: true,
            onClick: {
                "onEdit": function (event, id, node) {
                    var curRow = this.data.pull[id.row];
                    var propuestaId = curRow.propuestaId;
                    PropuestasAceptadasGrid.edit(propuestaId)
                },
                "onDelete": function (event, id, node) {
                    var dtable = this;
                    var id = id.row;
                    var curRow = this.data.pull[id];

                    this.$scope.delete(curRow.propuestaId);
                },
                "onPrint": function (event, id, node) {
                    const curRow = this.data.pull[id.row];

                    //var rep = 'oferta_general'
                    var file = "/stireport/reports/hoja_encargo.mrt";


                    // ⚠️ Destruir la ventana si ya existe (por su id fijo)
                    if ($$("ofertasEpisReport")) {
                        $$("ofertasEpisReport").destructor();
                    }

                    // ✅ Crear nueva instancia directamente (sin .then)
                    let win = this.$scope.ui(OfertasEpisReport);

                    // Esperar que se renderice
                    setTimeout(() => {
                        win.showWindow(null, curRow.propuestaId, file);
                    }, 50);
                }
            },
            editable: true,
            editaction: "dblclick",
            rules: {
                "direccionTrabajo": webix.rules.isNotEmpty
            },
            on: {
                "onAfterFilter": function () {
                    webix.storage.local.put("stateGridPropuestas", this.getState());
                }
            }
        }
        const _view = {
            rows: [
                pagerPropuestasAceptadas,
                datatablePropuestasAceptadas
            ]
        }

        return _view;
    },
    loadGrid: (expedienteid, selectPropuestaAceptadaId) => {
        propuestasService.getPropuestasExpediente(expedienteid, true)
            .then((data) => {
                if (!data) {
                    data = []
                }

                //acortamos el nombre de la empresa a 3 digitos y formateamos la fecha
                data = PropuestasAceptadasGrid.formateaCampos(data);
                expedienteId = expedienteid;
                $$("propuestasAceptadasGrid").clearAll();
                $$("propuestasAceptadasGrid").parse(generalApi.prepareDataForDataTable("propuestaId", data));

                if (selectPropuestaAceptadaId) {
                    try {
                        var id = parseInt(selectPropuestaAceptadaId);
                        $$("propuestasAceptadasGrid").select(id);
                        $$("propuestasAceptadasGrid").showItem(id);
                    } catch (e) {

                    }

                }


                var numReg = $$("propuestasAceptadasGrid").count();
                $$("PropuestasAceptadasNReg").config.label = "NREG: " + numReg;
                $$("PropuestasAceptadasNReg").refresh();
                var stateDt = webix.storage.local.get("stateGridPropuestas");
                if (stateDt) this.$$('propuestasAceptadasGrid').setState(stateDt);
            })
            .catch((err) => {

                var error = err.response;
                var index = error.indexOf("Cannot delete or update a parent row: a foreign key constraint fails");
                if (index != -1) {
                    messageApi.errorRestriccion()
                } else {
                    messageApi.errorMessageAjax(err);
                }
            });


    },

    formateaCampos(data) {
        data.forEach(e => {
            //e.empresa = e.empresa.substr(0,4);
            e.fechaDocumentacion = new Date(e.fechaDocumentacion);
        });
        return data;
    },

    cleanAndload() {
        $$("propuestasAceptadasGrid").eachColumn(function (id, col) {
            if (col.id == 'actions') return;
            var filter = this.getFilter(id);
            if (filter) {
                if (filter.setValue) filter.setValue("")	// suggest-based filters 
                else filter.value = "";					// html-based: select & text
            }
        });
        this.load();
    },

    edit(propuestaId, subcontrataId) {

        const activeTab = $$("tabViewExpediente").getValue();  // Obtener el id de la pestaña activa
        localStorage.setItem("activeTab", activeTab);

        _app.show('/top/propuestaForm?propuestaId=' + propuestaId + '&subcontrataId=' + subcontrataId + '&expedienteId=' + expedienteId + '&desdeAceptadas=true');
    },

    delete(propuestaId) {
        webix.confirm({
            title: "AVISO",
            text: "¿Está seguro que desea eliminar este registro?.",
            type: "confirm-warning",
            callback: (action) => {
                if (action === true) {
                    propuestasService.deletePropuesta(propuestaId)
                        .then(row => {
                            this.load();
                        })
                        .catch(err => {
                            messageApi.errorMessageAjax(err);
                        })
                }
            }
        });
    },

    accept() {
        this.show('/top/expedientesForm?expedienteId=' + expedienteId + '&desdeSubcontrata=true');
    }
}