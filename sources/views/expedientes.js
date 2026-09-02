import { JetView } from "webix-jet";
import { usuarioService } from "../services/usuario_service";
import { expedientesService } from "../services/expedientes_service";
import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { languageService } from "../locales/language_service";
import OfertasEpisReport from "./ofertasEpisReport";



var editButton = "<span class='onEdit webix_icon wxi-pencil'></span>";
var deleteButton = "<span class='onDelete webix_icon wxi-trash'></span>";
var PrintButton = "<span class='onPrint mdi mdi-printer'></span>";

export default class Expedientes extends JetView {
    config() {
        //PartesFormWindow.getWindow(this.app);
        const translate = this.app.getService("locale")._;
        //toolbar de la solapa expedientes
        var toolbarExpedientes = {
            view: "toolbar", padding: 3, elements: [
                { view: "icon", icon: "mdi mdi-file", width: 37, align: "left" },
                { view: "label", label: "Expedientes" }
            ]
        }
        //pager de la solapa expedientes
        var pagerExpedientes = {
            cols: [
                {
                    view: "button", type: "icon", icon: "wxi-plus", width: 37, align: "left", hotkey: "Ctrl+A",
                    tooltip: translate("Nuevo registro en formulario (Ctrl+A)"),
                    click: () => {
                        this.show('/top/expedientesForm?expedienteId=0');
                    }
                },
                {
                    view: "button", type: "icon", icon: "mdi mdi-refresh", width: 37, align: "left", hotkey: "Ctrl+R",
                    tooltip: translate("Refrescar la lista (Ctrl+R)"),
                    click: () => {

                        const tabsConfig = {
                            expedientesGridSolicitud: 1,
                            expedientesGridEstudio: 2,
                            expedientesGridEnviado: 3,
                            expedientesGridAdjudicado: 4,
                            expedientesGridIniciado: 5,
                            expedientesGridFinalizado: 6,
                            expedientesGridDenegado: 7
                        };

                        const activeTab = $$("tabsExpedientes").getValue();
                        const estadoId = tabsConfig[activeTab];

                        if (estadoId) {
                            this.cleanAndLoad(activeTab, estadoId);
                        }
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
                    view: "pager", id: "mypager1", css: { "text-align": "right" },
                    template: "{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}",
                    size: 25,
                    group: 5
                }
            ]
        };
        var actionsTemplate = editButton + " ";
        // Control de permiso de borrado
        actionsTemplate += deleteButton + " ";
        actionsTemplate += PrintButton;
        //grid de la solapa expedientes
        var datatableExpedientes = {
            view: "tabview",
            id: "tabsExpedientes",
            tabbar: {
                on: {
                    onAfterTabClick: (id, ev) => {
                        console.log("Pestaña activa:", id);
                        webix.storage.local.put("tabsExpedientesActive", id);
                    },
                }
            },
            cells: [
                {
                    id: "solicitud",
                    header: "Solicitud",
                    width: 100,
                    body: {

                        view: "datatable",
                        css: { "font-size": "0.9em" },
                        id: "expedientesGridSolicitud",
                        scroll: "x,y",
                        autoheight: false,
                        minHeight: 300,
                        select: "row",
                        footer: true,
                        ready: function () {
                            this.attachEvent("onItemDblClick", function (id, e, node) {
                                var curRow = this.data.pull[id.row]
                                this.$scope.edit(curRow.expedienteId)
                            });
                        },
                        scheme: {
                            $change: function (item) {
                                var odd = $$("expedientesGridSolicitud").getIndexById(item.id) % 2
                                if (!odd) {
                                    item.$css = { "background": "#E6E7E7" };
                                }
                            }
                        },
                        columns: [
                            { id: "expedienteId", header: ["Id", { content: "textFilter" }], sort: "int", adjust: "data", hidden: true },
                            { id: "empresaId", header: ["IdEmpresa", { content: "textFilter" }], sort: "int", adjust: "data", hidden: true },
                            { id: "referencia", header: ["Ref.", { content: "textFilter" }], sort: "string", adjust: "data" },
                            { id: "estado", header: ["Tipo.", { content: "textFilter" }], sort: "string", adjust: "data", hidden: true },
                            { id: "cliente", header: ["Cliente", { content: "textFilter" }], sort: "string", adjust: "all" },
                            { id: "titulo", header: ["Titulo", { content: "textFilter" }], sort: "string", adjust: "all" },
                            {
                                id: "fecha", header: [{ text: translate("Fecha"), css: { "text-align": "center" } }, { content: "dateFilter" }],
                                adjust: "data", sort: "string", format: webix.i18n.dateFormatStr, css: { "text-align": "center" }
                            },
                            { id: "empresa", header: ["Empresa", { content: "textFilter" }], sort: "string", adjust: "all" },
                            { id: "agente", header: ["Agente", { content: "textFilter" }], sort: "string", adjust: "all" },
                            { id: "comercial", header: ["Comercial", { content: "textFilter" }], sort: "string", adjust: "all" },
                            { id: "jefeGrupo", header: ["Jefe de grupo", { content: "textFilter" }], sort: "string", adjust: "all", minWidth: 150 },
                            { id: "jefeObras", header: ["Jefe de obras", { content: "textFilter" }], sort: "string", adjust: "all", minWidth: 150 },
                            { id: "oficinatecnica", header: ["Oficina técnica", { content: "textFilter" }], sort: "string", adjust: "all", minWidth: 150 },
                            { id: "asesorTecnico", header: ["Asesor técnico", { content: "textFilter" }], sort: "string", adjust: "all", minWidth: 150 },

                            //{ id: "total", header: ["Base", { content: "textFilter" }], sort: "int" ,format:webix.i18n.numberFormat, adjust: "data"},
                            { id: "observaciones", header: ["Observaciones", { content: "textFilter" }], sort: "string", adjust: "all", fillspace: true, minWidth: 150 },
                            { id: "actions", header: [{ text: "Acciones", css: { "text-align": "center" } }], template: actionsTemplate, css: { "text-align": "center" }, adjust: "all" }
                        ],

                        rightSplit: 1,
                        leftSplit: 6,
                        scroll: true,
                        onClick: {
                            "onEdit": function (event, id, node) {
                                var curRow = this.data.pull[id.row];
                                this.$scope.edit(curRow.expedienteId)

                            },
                            "onDelete": function (event, id, node) {
                                var dtable = this;
                                var id = id.row;
                                var curRow = this.data.pull[id];

                                this.$scope.delete(curRow.expedienteId);
                            },
                            "onPrint": function (event, id, node) {
                                var curRow = this.data.pull[id.row];
                                var file = "/stireport/reports/oferta_general.mrt";
                                this.$scope.imprimirWindow.showWindow(curRow.expedienteId, null, file);
                            }
                        },
                        editable: true,
                        editaction: "dblclick",
                        rules: {
                            "direccionTrabajo": webix.rules.isNotEmpty
                        },
                        on: {
                            onAfterRender: function () {
                                const grid = this;

                                if (grid._focusFilterEventAttached) return;
                                grid._focusFilterEventAttached = true;

                                webix.event(grid.$view, "keyup", function (e) {
                                    const input = e.target;

                                    if (input && input.tagName === "INPUT") {
                                        const inputs = Array.from(grid.$view.querySelectorAll("input"));

                                        grid._lastFilterIndex = inputs.indexOf(input);
                                        grid._lastFilterValue = input.value;
                                    }
                                });
                            },

                            onAfterFilter: function () {
                                const grid = this;

                                webix.storage.local.put(
                                    "stateGridExpedientes_" + grid.config.id,
                                    grid.getState()
                                );

                                webix.delay(function () {
                                    const inputs = Array.from(grid.$view.querySelectorAll("input"));

                                    const input = inputs[grid._lastFilterIndex];

                                    if (input) {
                                        input.focus();

                                        const len = input.value.length;
                                        input.setSelectionRange(len, len);
                                    }
                                }, null, null, 50);
                            },

                            onAfterSort: function () {
                                webix.storage.local.put(
                                    "stateGridExpedientes_" + this.config.id,
                                    this.getState()
                                );
                            },

                            "onAfterLoad": function () {
                                this.getColumnConfig("referencia").footer = { text: "NREG: " + this.count(), colspan: 3 };
                                this.refreshColumns();
                            },
                        }
                    }
                },
                {
                    id: "estudio",
                    header: "Estudio",
                    width: 100,
                    body: {
                        view: "datatable",
                        css: { "font-size": "0.9em" },
                        id: "expedientesGridEstudio",
                        scroll: "x,y",
                        autoheight: false,
                        minHeight: 300,
                        select: "row",
                        footer: true,
                        ready: function () {
                            this.attachEvent("onItemDblClick", function (id, e, node) {
                                var curRow = this.data.pull[id.row]
                                this.$scope.edit(curRow.expedienteId)
                            });
                        },
                        scheme: {
                            $change: function (item) {
                                var odd = $$("expedientesGridEstudio").getIndexById(item.id) % 2
                                if (!odd) {
                                    item.$css = { "background": "#E6E7E7" };
                                }
                            }
                        },
                        columns: [
                            { id: "expedienteId", header: ["Id", { content: "textFilter" }], sort: "int", adjust: "data", hidden: true },
                            { id: "empresaId", header: ["IdEmpresa", { content: "textFilter" }], sort: "int", adjust: "data", hidden: true },
                            { id: "referencia", header: ["Ref.", { content: "textFilter" }], sort: "string", adjust: "data" },
                            { id: "estado", header: ["Tipo.", { content: "textFilter" }], sort: "string", adjust: "data", hidden: true },
                            { id: "cliente", header: ["Cliente", { content: "textFilter" }], sort: "string", adjust: "all" },
                            { id: "titulo", header: ["Titulo", { content: "textFilter" }], sort: "string", adjust: "all" },
                            {
                                id: "fecha", header: [{ text: translate("Fecha"), css: { "text-align": "center" } }, { content: "dateFilter" }],
                                adjust: "data", sort: "string", format: webix.i18n.dateFormatStr, css: { "text-align": "center" }
                            },
                            { id: "empresa", header: ["Empresa", { content: "textFilter" }], sort: "string", adjust: "all" },
                            { id: "agente", header: ["Agente", { content: "textFilter" }], sort: "string", adjust: "all" },
                            { id: "comercial", header: ["Comercial", { content: "textFilter" }], sort: "string", adjust: "all" },
                            { id: "jefeGrupo", header: ["Jefe de grupo", { content: "textFilter" }], sort: "string", minWidth: 150 },
                            { id: "jefeObras", header: ["Jefe de obras", { content: "textFilter" }], sort: "string", adjust: "all", minWidth: 150 },
                            { id: "oficinatecnica", header: ["Oficina técnica", { content: "textFilter" }], sort: "string", adjust: "all", minWidth: 150 },
                            { id: "asesorTecnico", header: ["Asesor técnico", { content: "textFilter" }], sort: "string", adjust: "all", minWidth: 150 },

                            //{ id: "total", header: ["Base", { content: "textFilter" }], sort: "int" ,format:webix.i18n.numberFormat, adjust: "data"},
                            { id: "observaciones", header: ["Observaciones", { content: "textFilter" }], sort: "string", adjust: "all", fillspace: true, minWidth: 150 },
                            { id: "actions", header: [{ text: "Acciones", css: { "text-align": "center" } }], template: actionsTemplate, css: { "text-align": "center" }, adjust: "all" }
                        ],
                        rightSplit: 1,
                        leftSplit: 6,
                        scroll: true,
                        onClick: {
                            "onEdit": function (event, id, node) {
                                var curRow = this.data.pull[id.row];
                                this.$scope.edit(curRow.expedienteId)

                            },
                            "onDelete": function (event, id, node) {
                                var dtable = this;
                                var id = id.row;
                                var curRow = this.data.pull[id];

                                this.$scope.delete(curRow.expedienteId);
                            },
                            "onPrint": function (event, id, node) {
                                var curRow = this.data.pull[id.row];
                                var file = "/stireport/reports/oferta_general.mrt";
                                this.$scope.imprimirWindow.showWindow(curRow.expedienteId, null, file);
                            }
                        },
                        editable: true,
                        editaction: "dblclick",
                        rules: {
                            "direccionTrabajo": webix.rules.isNotEmpty
                        },
                        on: {
                            onAfterRender: function () {
                                const grid = this;

                                if (grid._focusFilterEventAttached) return;
                                grid._focusFilterEventAttached = true;

                                webix.event(grid.$view, "keyup", function (e) {
                                    const input = e.target;

                                    if (input && input.tagName === "INPUT") {
                                        const inputs = Array.from(grid.$view.querySelectorAll("input"));

                                        grid._lastFilterIndex = inputs.indexOf(input);
                                        grid._lastFilterValue = input.value;
                                    }
                                });
                            },

                            onAfterFilter: function () {
                                const grid = this;

                                webix.storage.local.put(
                                    "stateGridExpedientes_" + grid.config.id,
                                    grid.getState()
                                );

                                webix.delay(function () {
                                    const inputs = Array.from(grid.$view.querySelectorAll("input"));

                                    const input = inputs[grid._lastFilterIndex];

                                    if (input) {
                                        input.focus();

                                        const len = input.value.length;
                                        input.setSelectionRange(len, len);
                                    }
                                }, null, null, 50);
                            },

                            onAfterSort: function () {
                                webix.storage.local.put(
                                    "stateGridExpedientes_" + this.config.id,
                                    this.getState()
                                );
                            },

                            "onAfterLoad": function () {
                                this.getColumnConfig("referencia").footer = { text: "NREG: " + this.count(), colspan: 3 };
                                this.refreshColumns();
                            },
                        }

                    }
                },
                {
                    id: "enviado",
                    header: "Enviado",
                    width: 100,
                    body: {
                        view: "datatable",
                        css: { "font-size": "0.9em" },
                        id: "expedientesGridEnviado",
                        scroll: "x,y",
                        autoheight: false,
                        minHeight: 300,
                        select: "row",
                        footer: true,
                        ready: function () {
                            this.attachEvent("onItemDblClick", function (id, e, node) {
                                var curRow = this.data.pull[id.row]
                                this.$scope.edit(curRow.expedienteId)
                            });
                        },
                        scheme: {
                            $change: function (item) {
                                var odd = $$("expedientesGridEnviado").getIndexById(item.id) % 2
                                if (!odd) {
                                    item.$css = { "background": "#E6E7E7" };
                                }
                            }
                        },
                        columns: [
                            { id: "expedienteId", header: ["Id", { content: "textFilter" }], sort: "int", adjust: "data", hidden: true },
                            { id: "empresaId", header: ["IdEmpresa", { content: "textFilter" }], sort: "int", adjust: "data", hidden: true },
                            { id: "referencia", header: ["Ref.", { content: "textFilter" }], sort: "string", adjust: "data" },
                            { id: "estado", header: ["Tipo.", { content: "textFilter" }], sort: "string", adjust: "data", hidden: true },
                            { id: "cliente", header: ["Cliente", { content: "textFilter" }], sort: "string", adjust: "all" },
                            { id: "titulo", header: ["Titulo", { content: "textFilter" }], sort: "string", adjust: "all" },
                            {
                                id: "fecha", header: [{ text: translate("Fecha"), css: { "text-align": "center" } }, { content: "dateFilter" }],
                                adjust: "data", sort: "string", format: webix.i18n.dateFormatStr, css: { "text-align": "center" }
                            },
                            { id: "empresa", header: ["Empresa", { content: "textFilter" }], sort: "string", adjust: "all" },
                            { id: "agente", header: ["Agente", { content: "textFilter" }], sort: "string", adjust: "all" },
                            { id: "comercial", header: ["Comercial", { content: "textFilter" }], sort: "string", adjust: "all" },
                            { id: "jefeGrupo", header: ["Jefe de grupo", { content: "textFilter" }], sort: "string", minWidth: 150 },
                            { id: "jefeObras", header: ["Jefe de obras", { content: "textFilter" }], sort: "string", adjust: "all", minWidth: 150 },
                            { id: "oficinatecnica", header: ["Oficina técnica", { content: "textFilter" }], sort: "string", adjust: "all", minWidth: 150 },
                            { id: "asesorTecnico", header: ["Asesor técnico", { content: "textFilter" }], sort: "string", adjust: "all", minWidth: 150 },

                            //{ id: "total", header: ["Base", { content: "textFilter" }], sort: "int" ,format:webix.i18n.numberFormat, adjust: "data"},
                            { id: "observaciones", header: ["Observaciones", { content: "textFilter" }], sort: "string", adjust: "all", fillspace: true, minWidth: 150 },
                            { id: "actions", header: [{ text: "Acciones", css: { "text-align": "center" } }], template: actionsTemplate, css: { "text-align": "center" }, adjust: "all" }
                        ],
                        rightSplit: 1,
                        leftSplit: 6,
                        scroll: true,
                        onClick: {
                            "onEdit": function (event, id, node) {
                                var curRow = this.data.pull[id.row];
                                this.$scope.edit(curRow.expedienteId)

                            },
                            "onDelete": function (event, id, node) {
                                var dtable = this;
                                var id = id.row;
                                var curRow = this.data.pull[id];

                                this.$scope.delete(curRow.expedienteId);
                            },
                            "onPrint": function (event, id, node) {
                                var curRow = this.data.pull[id.row];
                                var file = "/stireport/reports/oferta_general.mrt";
                                this.$scope.imprimirWindow.showWindow(curRow.expedienteId, null, file);
                            }
                        },
                        editable: true,
                        editaction: "dblclick",
                        rules: {
                            "direccionTrabajo": webix.rules.isNotEmpty
                        },
                        on: {
                            onAfterRender: function () {
                                const grid = this;

                                if (grid._focusFilterEventAttached) return;
                                grid._focusFilterEventAttached = true;

                                webix.event(grid.$view, "keyup", function (e) {
                                    const input = e.target;

                                    if (input && input.tagName === "INPUT") {
                                        const inputs = Array.from(grid.$view.querySelectorAll("input"));

                                        grid._lastFilterIndex = inputs.indexOf(input);
                                        grid._lastFilterValue = input.value;
                                    }
                                });
                            },

                            onAfterFilter: function () {
                                const grid = this;

                                webix.storage.local.put(
                                    "stateGridExpedientes_" + grid.config.id,
                                    grid.getState()
                                );

                                webix.delay(function () {
                                    const inputs = Array.from(grid.$view.querySelectorAll("input"));

                                    const input = inputs[grid._lastFilterIndex];

                                    if (input) {
                                        input.focus();

                                        const len = input.value.length;
                                        input.setSelectionRange(len, len);
                                    }
                                }, null, null, 50);
                            },
                            onAfterSort: function () {
                                webix.storage.local.put(
                                    "stateGridExpedientes_" + this.config.id,
                                    this.getState()
                                );
                            },

                            "onAfterLoad": function () {
                                this.getColumnConfig("referencia").footer = { text: "NREG: " + this.count(), colspan: 3 };
                                this.refreshColumns();
                            },
                        }

                    }
                },
                {
                    id: "adjudicado",
                    header: "Adjudicado",
                    width: 100,
                    body: {
                        view: "datatable",
                        css: { "font-size": "0.9em" },
                        id: "expedientesGridAdjudicado",
                        scroll: "x,y",
                        autoheight: false,
                        minHeight: 300,
                        select: "row",
                        footer: true,
                        ready: function () {
                            this.attachEvent("onItemDblClick", function (id, e, node) {
                                var curRow = this.data.pull[id.row]
                                this.$scope.edit(curRow.expedienteId)
                            });
                        },
                        scheme: {
                            $change: function (item) {
                                var odd = $$("expedientesGridAdjudicado").getIndexById(item.id) % 2
                                if (!odd) {
                                    item.$css = { "background": "#E6E7E7" };
                                }
                            }
                        },
                        columns: [
                            { id: "expedienteId", header: ["Id", { content: "textFilter" }], sort: "int", adjust: "data", hidden: true },
                            { id: "empresaId", header: ["IdEmpresa", { content: "textFilter" }], sort: "int", adjust: "data", hidden: true },
                            { id: "referencia", header: ["Ref.", { content: "textFilter" }], sort: "string", adjust: "data" },
                            { id: "estado", header: ["Tipo.", { content: "textFilter" }], sort: "string", adjust: "data", hidden: true },
                            { id: "cliente", header: ["Cliente", { content: "textFilter" }], sort: "string", adjust: "all" },
                            { id: "titulo", header: ["Titulo", { content: "textFilter" }], sort: "string", adjust: "all" },
                            {
                                id: "fecha", header: [{ text: translate("Fecha"), css: { "text-align": "center" } }, { content: "dateFilter" }],
                                adjust: "data", sort: "string", format: webix.i18n.dateFormatStr, css: { "text-align": "center" }
                            },
                            { id: "empresa", header: ["Empresa", { content: "textFilter" }], sort: "string", adjust: "all" },
                            { id: "agente", header: ["Agente", { content: "textFilter" }], sort: "string", adjust: "all" },
                            { id: "comercial", header: ["Comercial", { content: "textFilter" }], sort: "string", adjust: "all" },
                            { id: "jefeGrupo", header: ["Jefe de grupo", { content: "textFilter" }], sort: "string", minWidth: 150 },
                            { id: "jefeObras", header: ["Jefe de obras", { content: "textFilter" }], sort: "string", adjust: "all", minWidth: 150 },
                            { id: "oficinatecnica", header: ["Oficina técnica", { content: "textFilter" }], sort: "string", adjust: "all", minWidth: 150 },
                            { id: "asesorTecnico", header: ["Asesor técnico", { content: "textFilter" }], sort: "string", adjust: "all", minWidth: 150 },

                            //{ id: "total", header: ["Base", { content: "textFilter" }], sort: "int" ,format:webix.i18n.numberFormat, adjust: "data"},
                            { id: "observaciones", header: ["Observaciones", { content: "textFilter" }], sort: "string", adjust: "all", fillspace: true, minWidth: 150 },
                            { id: "actions", header: [{ text: "Acciones", css: { "text-align": "center" } }], template: actionsTemplate, css: { "text-align": "center" }, adjust: "all" }
                        ],
                        rightSplit: 1,
                        leftSplit: 6,
                        scroll: true,
                        onClick: {
                            "onEdit": function (event, id, node) {
                                var curRow = this.data.pull[id.row];
                                this.$scope.edit(curRow.expedienteId)

                            },
                            "onDelete": function (event, id, node) {
                                var dtable = this;
                                var id = id.row;
                                var curRow = this.data.pull[id];

                                this.$scope.delete(curRow.expedienteId);
                            },
                            "onPrint": function (event, id, node) {
                                var curRow = this.data.pull[id.row];
                                var file = "/stireport/reports/oferta_general.mrt";
                                this.$scope.imprimirWindow.showWindow(curRow.expedienteId, null, file);
                            }
                        },
                        editable: true,
                        editaction: "dblclick",
                        rules: {
                            "direccionTrabajo": webix.rules.isNotEmpty
                        },
                        on: {
                            onAfterRender: function () {
                                const grid = this;

                                if (grid._focusFilterEventAttached) return;
                                grid._focusFilterEventAttached = true;

                                webix.event(grid.$view, "keyup", function (e) {
                                    const input = e.target;

                                    if (input && input.tagName === "INPUT") {
                                        const inputs = Array.from(grid.$view.querySelectorAll("input"));

                                        grid._lastFilterIndex = inputs.indexOf(input);
                                        grid._lastFilterValue = input.value;
                                    }
                                });
                            },

                            onAfterFilter: function () {
                                const grid = this;

                                webix.storage.local.put(
                                    "stateGridExpedientes_" + grid.config.id,
                                    grid.getState()
                                );

                                webix.delay(function () {
                                    const inputs = Array.from(grid.$view.querySelectorAll("input"));

                                    const input = inputs[grid._lastFilterIndex];

                                    if (input) {
                                        input.focus();

                                        const len = input.value.length;
                                        input.setSelectionRange(len, len);
                                    }
                                }, null, null, 50);
                            },

                            onAfterSort: function () {
                                webix.storage.local.put(
                                    "stateGridExpedientes_" + this.config.id,
                                    this.getState()
                                );
                            },

                            "onAfterLoad": function () {
                                this.getColumnConfig("referencia").footer = { text: "NREG: " + this.count(), colspan: 3 };
                                this.refreshColumns();
                            },
                        }

                    }
                },
                {
                    id: "iniciado",
                    header: "Iniciado",
                    width: 100,
                    body: {
                        view: "datatable",
                        css: { "font-size": "0.9em" },
                        id: "expedientesGridIniciado",
                        scroll: "x,y",
                        autoheight: false,
                        minHeight: 300,
                        select: "row",
                        footer: true,
                        ready: function () {
                            this.attachEvent("onItemDblClick", function (id, e, node) {
                                var curRow = this.data.pull[id.row]
                                this.$scope.edit(curRow.expedienteId)
                            });
                        },
                        scheme: {
                            $change: function (item) {
                                var odd = $$("expedientesGridIniciado").getIndexById(item.id) % 2
                                if (!odd) {
                                    item.$css = { "background": "#E6E7E7" };
                                }
                            }
                        },
                        columns: [
                            { id: "expedienteId", header: ["Id", { content: "textFilter" }], sort: "int", adjust: "data", hidden: true },
                            { id: "empresaId", header: ["IdEmpresa", { content: "textFilter" }], sort: "int", adjust: "data", hidden: true },
                            { id: "referencia", header: ["Ref.", { content: "textFilter" }], sort: "string", adjust: "data" },
                            { id: "estado", header: ["Tipo.", { content: "textFilter" }], sort: "string", adjust: "data", hidden: true },
                            { id: "cliente", header: ["Cliente", { content: "textFilter" }], sort: "string", adjust: "all" },
                            { id: "titulo", header: ["Titulo", { content: "textFilter" }], sort: "string", adjust: "all" },
                            {
                                id: "fecha", header: [{ text: translate("Fecha"), css: { "text-align": "center" } }, { content: "dateFilter" }],
                                adjust: "data", sort: "string", format: webix.i18n.dateFormatStr, css: { "text-align": "center" }
                            },
                            { id: "empresa", header: ["Empresa", { content: "textFilter" }], sort: "string", adjust: "all" },
                            { id: "agente", header: ["Agente", { content: "textFilter" }], sort: "string", adjust: "all" },
                            { id: "comercial", header: ["Comercial", { content: "textFilter" }], sort: "string", adjust: "all" },
                            { id: "jefeGrupo", header: ["Jefe de grupo", { content: "textFilter" }], sort: "string", minWidth: 150 },
                            { id: "jefeObras", header: ["Jefe de obras", { content: "textFilter" }], sort: "string", adjust: "all", minWidth: 150 },
                            { id: "oficinatecnica", header: ["Oficina técnica", { content: "textFilter" }], sort: "string", adjust: "all", minWidth: 150 },
                            { id: "asesorTecnico", header: ["Asesor técnico", { content: "textFilter" }], sort: "string", adjust: "all", minWidth: 150 },

                            //{ id: "total", header: ["Base", { content: "textFilter" }], sort: "int" ,format:webix.i18n.numberFormat, adjust: "data"},
                            { id: "observaciones", header: ["Observaciones", { content: "textFilter" }], sort: "string", adjust: "all", fillspace: true, minWidth: 150 },
                            { id: "actions", header: [{ text: "Acciones", css: { "text-align": "center" } }], template: actionsTemplate, css: { "text-align": "center" }, adjust: "all" }
                        ],
                        rightSplit: 1,
                        leftSplit: 6,
                        scroll: true,
                        onClick: {
                            "onEdit": function (event, id, node) {
                                var curRow = this.data.pull[id.row];
                                this.$scope.edit(curRow.expedienteId)

                            },
                            "onDelete": function (event, id, node) {
                                var dtable = this;
                                var id = id.row;
                                var curRow = this.data.pull[id];

                                this.$scope.delete(curRow.expedienteId);
                            },
                            "onPrint": function (event, id, node) {
                                var curRow = this.data.pull[id.row];
                                var file = "/stireport/reports/oferta_general.mrt";
                                this.$scope.imprimirWindow.showWindow(curRow.expedienteId, null, file);
                            }
                        },
                        editable: true,
                        editaction: "dblclick",
                        rules: {
                            "direccionTrabajo": webix.rules.isNotEmpty
                        },
                        on: {
                            onAfterRender: function () {
                                const grid = this;

                                if (grid._focusFilterEventAttached) return;
                                grid._focusFilterEventAttached = true;

                                webix.event(grid.$view, "keyup", function (e) {
                                    const input = e.target;

                                    if (input && input.tagName === "INPUT") {
                                        const inputs = Array.from(grid.$view.querySelectorAll("input"));

                                        grid._lastFilterIndex = inputs.indexOf(input);
                                        grid._lastFilterValue = input.value;
                                    }
                                });
                            },

                            onAfterFilter: function () {
                                const grid = this;

                                webix.storage.local.put(
                                    "stateGridExpedientes_" + grid.config.id,
                                    grid.getState()
                                );

                                webix.delay(function () {
                                    const inputs = Array.from(grid.$view.querySelectorAll("input"));

                                    const input = inputs[grid._lastFilterIndex];

                                    if (input) {
                                        input.focus();

                                        const len = input.value.length;
                                        input.setSelectionRange(len, len);
                                    }
                                }, null, null, 50);
                            },

                            onAfterSort: function () {
                                webix.storage.local.put(
                                    "stateGridExpedientes_" + this.config.id,
                                    this.getState()
                                );
                            },

                            "onAfterLoad": function () {
                                this.getColumnConfig("referencia").footer = { text: "NREG: " + this.count(), colspan: 3 };
                                this.refreshColumns();
                            },
                        }

                    }
                },
                {
                    id: "finalizado",
                    header: "Finalizado",
                    width: 100,
                    body: {
                        view: "datatable",
                        css: { "font-size": "0.9em" },
                        id: "expedientesGridFinalizado",
                        scroll: "x,y",
                        autoheight: false,
                        minHeight: 300,
                        select: "row",
                        footer: true,
                        ready: function () {
                            this.attachEvent("onItemDblClick", function (id, e, node) {
                                var curRow = this.data.pull[id.row]
                                this.$scope.edit(curRow.expedienteId)
                            });
                        },
                        scheme: {
                            $change: function (item) {
                                var odd = $$("expedientesGridFinalizado").getIndexById(item.id) % 2
                                if (!odd) {
                                    item.$css = { "background": "#E6E7E7" };
                                }
                            }
                        },
                        columns: [
                            { id: "expedienteId", header: ["Id", { content: "textFilter" }], sort: "int", adjust: "data", hidden: true },
                            { id: "empresaId", header: ["IdEmpresa", { content: "textFilter" }], sort: "int", adjust: "data", hidden: true },
                            { id: "referencia", header: ["Ref.", { content: "textFilter" }], sort: "string", adjust: "data" },
                            { id: "estado", header: ["Tipo.", { content: "textFilter" }], sort: "string", adjust: "data", hidden: true },
                            { id: "cliente", header: ["Cliente", { content: "textFilter" }], sort: "string", adjust: "all" },
                            { id: "titulo", header: ["Titulo", { content: "textFilter" }], sort: "string", adjust: "all" },
                            {
                                id: "fecha", header: [{ text: translate("Fecha"), css: { "text-align": "center" } }, { content: "dateFilter" }],
                                adjust: "data", sort: "string", format: webix.i18n.dateFormatStr, css: { "text-align": "center" }
                            },
                            { id: "empresa", header: ["Empresa", { content: "textFilter" }], sort: "string", adjust: "all" },
                            { id: "agente", header: ["Agente", { content: "textFilter" }], sort: "string", adjust: "all" },
                            { id: "comercial", header: ["Comercial", { content: "textFilter" }], sort: "string", adjust: "all" },
                            { id: "jefeGrupo", header: ["Jefe de grupo", { content: "textFilter" }], sort: "string", minWidth: 150 },
                            { id: "jefeObras", header: ["Jefe de obras", { content: "textFilter" }], sort: "string", adjust: "all", minWidth: 150 },
                            { id: "oficinatecnica", header: ["Oficina técnica", { content: "textFilter" }], sort: "string", adjust: "all", minWidth: 150 },
                            { id: "asesorTecnico", header: ["Asesor técnico", { content: "textFilter" }], sort: "string", adjust: "all", minWidth: 150 },

                            //{ id: "total", header: ["Base", { content: "textFilter" }], sort: "int" ,format:webix.i18n.numberFormat, adjust: "data"},
                            { id: "observaciones", header: ["Observaciones", { content: "textFilter" }], sort: "string", adjust: "all", fillspace: true, minWidth: 150 },
                            { id: "actions", header: [{ text: "Acciones", css: { "text-align": "center" } }], template: actionsTemplate, css: { "text-align": "center" }, adjust: "all" }
                        ],
                        rightSplit: 1,
                        leftSplit: 6,
                        scroll: true,
                        onClick: {
                            "onEdit": function (event, id, node) {
                                var curRow = this.data.pull[id.row];
                                this.$scope.edit(curRow.expedienteId)

                            },
                            "onDelete": function (event, id, node) {
                                var dtable = this;
                                var id = id.row;
                                var curRow = this.data.pull[id];

                                this.$scope.delete(curRow.expedienteId);
                            },
                            "onPrint": function (event, id, node) {
                                var curRow = this.data.pull[id.row];
                                var file = "/stireport/reports/oferta_general.mrt";
                                this.$scope.imprimirWindow.showWindow(curRow.expedienteId, null, file);
                            }
                        },
                        editable: true,
                        editaction: "dblclick",
                        rules: {
                            "direccionTrabajo": webix.rules.isNotEmpty
                        },
                        on: {
                            onAfterRender: function () {
                                const grid = this;

                                if (grid._focusFilterEventAttached) return;
                                grid._focusFilterEventAttached = true;

                                webix.event(grid.$view, "keyup", function (e) {
                                    const input = e.target;

                                    if (input && input.tagName === "INPUT") {
                                        const inputs = Array.from(grid.$view.querySelectorAll("input"));

                                        grid._lastFilterIndex = inputs.indexOf(input);
                                        grid._lastFilterValue = input.value;
                                    }
                                });
                            },

                            onAfterFilter: function () {
                                const grid = this;

                                webix.storage.local.put(
                                    "stateGridExpedientes_" + grid.config.id,
                                    grid.getState()
                                );

                                webix.delay(function () {
                                    const inputs = Array.from(grid.$view.querySelectorAll("input"));

                                    const input = inputs[grid._lastFilterIndex];

                                    if (input) {
                                        input.focus();

                                        const len = input.value.length;
                                        input.setSelectionRange(len, len);
                                    }
                                }, null, null, 50);
                            },

                            onAfterSort: function () {
                                webix.storage.local.put(
                                    "stateGridExpedientes_" + this.config.id,
                                    this.getState()
                                );
                            },

                            "onAfterLoad": function () {
                                this.getColumnConfig("referencia").footer = { text: "NREG: " + this.count(), colspan: 3 };
                                this.refreshColumns();
                            },
                        }

                    }
                },
                {
                    id: "denegado",
                    header: "Denegado",
                    width: 100,
                    body: {
                        view: "datatable",
                        css: { "font-size": "0.9em" },
                        id: "expedientesGridDenegado",
                        scroll: "x,y",
                        autoheight: false,
                        minHeight: 300,
                        select: "row",
                        footer: true,
                        ready: function () {
                            this.attachEvent("onItemDblClick", function (id, e, node) {
                                var curRow = this.data.pull[id.row]
                                this.$scope.edit(curRow.expedienteId)
                            });
                        },
                        scheme: {
                            $change: function (item) {
                                var odd = $$("expedientesGridDenegado").getIndexById(item.id) % 2
                                if (!odd) {
                                    item.$css = { "background": "#E6E7E7" };
                                }
                            }
                        },
                        columns: [
                            { id: "expedienteId", header: ["Id", { content: "textFilter" }], sort: "int", adjust: "data", hidden: true },
                            { id: "empresaId", header: ["IdEmpresa", { content: "textFilter" }], sort: "int", adjust: "data", hidden: true },
                            { id: "referencia", header: ["Ref.", { content: "textFilter" }], sort: "string", adjust: "data" },
                            { id: "estado", header: ["Tipo.", { content: "textFilter" }], sort: "string", adjust: "data", hidden: true },
                            { id: "cliente", header: ["Cliente", { content: "textFilter" }], sort: "string", adjust: "all" },
                            { id: "titulo", header: ["Titulo", { content: "textFilter" }], sort: "string", adjust: "all" },
                            {
                                id: "fecha", header: [{ text: translate("Fecha"), css: { "text-align": "center" } }, { content: "dateFilter" }],
                                adjust: "data", sort: "string", format: webix.i18n.dateFormatStr, css: { "text-align": "center" }
                            },
                            { id: "empresa", header: ["Empresa", { content: "textFilter" }], sort: "string", adjust: "all" },
                            { id: "agente", header: ["Agente", { content: "textFilter" }], sort: "string", adjust: "all" },
                            { id: "comercial", header: ["Comercial", { content: "textFilter" }], sort: "string", adjust: "all" },
                            { id: "jefeGrupo", header: ["Jefe de grupo", { content: "textFilter" }], sort: "string", minWidth: 150 },
                            { id: "jefeObras", header: ["Jefe de obras", { content: "textFilter" }], sort: "string", adjust: "all", minWidth: 150 },
                            { id: "oficinatecnica", header: ["Oficina técnica", { content: "textFilter" }], sort: "string", adjust: "all", minWidth: 150 },
                            { id: "asesorTecnico", header: ["Asesor técnico", { content: "textFilter" }], sort: "string", adjust: "all", minWidth: 150 },

                            //{ id: "total", header: ["Base", { content: "textFilter" }], sort: "int" ,format:webix.i18n.numberFormat, adjust: "data"},
                            { id: "observaciones", header: ["Observaciones", { content: "textFilter" }], sort: "string", adjust: "all", fillspace: true, minWidth: 150 },
                            { id: "actions", header: [{ text: "Acciones", css: { "text-align": "center" } }], template: actionsTemplate, css: { "text-align": "center" }, adjust: "all" }
                        ],
                        rightSplit: 1,
                        leftSplit: 6,
                        scroll: true,
                        onClick: {
                            "onEdit": function (event, id, node) {
                                var curRow = this.data.pull[id.row];
                                this.$scope.edit(curRow.expedienteId)

                            },
                            "onDelete": function (event, id, node) {
                                var dtable = this;
                                var id = id.row;
                                var curRow = this.data.pull[id];

                                this.$scope.delete(curRow.expedienteId);
                            },
                            "onPrint": function (event, id, node) {
                                var curRow = this.data.pull[id.row];
                                var file = "/stireport/reports/oferta_general.mrt";
                                this.$scope.imprimirWindow.showWindow(curRow.expedienteId, null, file);
                            }
                        },
                        editable: true,
                        editaction: "dblclick",
                        rules: {
                            "direccionTrabajo": webix.rules.isNotEmpty
                        },
                        on: {
                            onAfterRender: function () {
                                const grid = this;

                                if (grid._focusFilterEventAttached) return;
                                grid._focusFilterEventAttached = true;

                                webix.event(grid.$view, "keyup", function (e) {
                                    const input = e.target;

                                    if (input && input.tagName === "INPUT") {
                                        const inputs = Array.from(grid.$view.querySelectorAll("input"));

                                        grid._lastFilterIndex = inputs.indexOf(input);
                                        grid._lastFilterValue = input.value;
                                    }
                                });
                            },

                            onAfterFilter: function () {
                                const grid = this;

                                webix.storage.local.put(
                                    "stateGridExpedientes_" + grid.config.id,
                                    grid.getState()
                                );

                                webix.delay(function () {
                                    const inputs = Array.from(grid.$view.querySelectorAll("input"));

                                    const input = inputs[grid._lastFilterIndex];

                                    if (input) {
                                        input.focus();

                                        const len = input.value.length;
                                        input.setSelectionRange(len, len);
                                    }
                                }, null, null, 50);
                            },

                            onAfterSort: function () {
                                webix.storage.local.put(
                                    "stateGridExpedientes_" + this.config.id,
                                    this.getState()
                                );
                            },

                            "onAfterLoad": function () {
                                this.getColumnConfig("referencia").footer = { text: "NREG: " + this.count(), colspan: 3 };
                                this.refreshColumns();
                            },
                        }

                    }
                }

            ]
        }
        var _view = {
            rows: [
                toolbarExpedientes,
                pagerExpedientes,
                datatableExpedientes
            ]
        }
        return _view;
    }
    init(view, url) {
        this.imprimirWindow = this.ui(OfertasEpisReport);

    }
    urlChange(view, url) {
        languageService.setLanguage(this.app, 'es');
        this.loadExpedientes("expedientesGridSolicitud", 1);
        this.loadExpedientes("expedientesGridEstudio", 2);
        this.loadExpedientes("expedientesGridEnviado", 3);
        this.loadExpedientes("expedientesGridAdjudicado", 4);
        this.loadExpedientes("expedientesGridIniciado", 5);
        this.loadExpedientes("expedientesGridFinalizado", 6);
        this.loadExpedientes("expedientesGridDenegado", 7);
        const tabs = $$("tabsExpedientes");
        const activeTab = webix.storage.local.get("tabsExpedientesActive");
        if (activeTab) {
            tabs.setValue(activeTab); // Establece la pestaña activa al abrir la vista
        }
    }

    formateaCampos(data) {
        data.forEach(e => {
            e.empresa = e.empresa ? e.empresa.substr(0, 4) : "";
            e.fecha = e.fecha ? new Date(e.fecha) : null;
        });
        return data;
    }




    edit(expedienteId) {
        this.show('/top/expedientesForm?expedienteId=' + expedienteId);
    }

    delete(expedienteId) {
        expedientesService.deleteExpediente(expedienteId)
            .then(row => {
                this.loadExpedientes("expedientesGridSolicitud", 1);
                this.loadExpedientes("expedientesGridEstudio", 2);
                this.loadExpedientes("expedientesGridEnviado", 3);
                this.loadExpedientes("expedientesGridAdjudicado", 4);
                this.loadExpedientes("expedientesGridIniciado", 5);
                this.loadExpedientes("expedientesGridFinalizado", 6);
                this.loadExpedientes("expedientesGridDenegado", 7);
            })
            .catch(err => {
                messageApi.errorMessageAjax(err);
            })
    }
    /////

    loadExpedientes(gridId, estadoId) {
        expedientesService.getExpedientes(estadoId)
            .then((data) => {
                data = this.formateaCampos(data || []);

                $$(gridId).clearAll();
                $$(gridId).parse(
                    generalApi.prepareDataForDataTable("expedienteId", data)
                );

                const stateDt = webix.storage.local.get("stateGridExpedientes_" + gridId);
                if (stateDt) $$(gridId).setState(stateDt);
            })
            .catch((err) => {
                const error = err.response || "";

                if (error.indexOf("Cannot delete or update a parent row: a foreign key constraint fails") !== -1) {
                    messageApi.errorRestriccion();
                } else {
                    messageApi.errorMessageAjax(err);
                }
            });
    }


    cleanAndLoad(gridId, estadoId) {

        const grid = $$(gridId);

        grid.eachColumn(function (id, col) {
            if (col.id === "actions") return;

            const filter = this.getFilter(id);

            if (filter) {
                if (filter.setValue) {
                    filter.setValue("");
                } else {
                    filter.value = "";
                }
            }
        });

        // limpiar estado guardado
        webix.storage.local.remove("stateGridExpedientes_" + gridId);

        // recargar grid
        this.loadExpedientes(gridId, estadoId);
    }
}

