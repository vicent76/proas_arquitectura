//PARTIDAS

import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { propuestasService } from "../services/propuestas_service";
import "../styles/app.css";
import { lineasOfertaVenta } from "./lineasOfertaVentaGrid";


//var editButton = "<span class='onEdit webix_icon wxi-pencil'></span>";
var deleteButton = "<span class='onDelete webix_icon wxi-trash'></span>";
var currentIdDatatableView;
var currentRowDatatableView
var isNewRow = false;



var propuestaId;
var numLineas;
var subcontrataId;
var Externa
var imprimirWindow;
var importeObra = 0;
let permitirEditarDescripcion = false;

export const lineasPropuesta = {
    // Devuelve el grid con los locales afectados
    // se le pasa la app porque es necesaria para conservar el translate.
    getGrid: (app) => {

        const translate = app.getService("locale")._;

        var toolbarlineasPropuesta = {

            view: "toolbar", padding: 3, css: { "background-color": "#F4F5F9" }, elements: [
                { view: "icon", icon: "mdi mdi-currency-eur", width: 37, align: "left" },
                { view: "label", label: "LINEAS" }
            ]

        };

        var actionsTemplate = deleteButton;

        var datatablelineasPropuesta = {
            view: "datatable",
            scroll: "x,y",
            id: "lineasPropuestaGrid",
            footer: true,
            select: "row",
            autoheight: true,
            css: { "word-wrap": "break-word" },
            fixedRowHeight: true,
            ready: function () {
                this.adjustRowHeight();
            },
            columns: [
                { id: "propuestaLineaId", header: [translate("Id")], sort: "string", width: 50, hidden: true },
                { id: "ofertaCostelineaId", header: [translate("Id")], sort: "string", width: 50, hidden: true },
                { id: "propuestaId", header: [translate("Id")], sort: "string", width: 50, hidden: true },
                { id: "linea", header: [translate("Linea")], sort: "string", width: 60, hidden: true },
                { id: "nombreArticulo", header: ["PRESUPUESTO", translate("Partida.")], sort: "string", width: 50, adjust: "all" },
                {
                    id: "descripcion",
                    header: ["", translate("Concepto")],
                    sort: "string",
                    minWidth: 300,
                    fillspace: true,
                    editor: "popup", // 🔹 Usa un editor emergente


                },
                { id: "unidades", header: ["", translate("Uds.")], sort: "string", width: 40, adjust: "all" },
                { id: "cantidad", header: ["", translate("Cant.")], sort: "string", width: 50, css: { "text-align": "right" }, adjust: "all" },
                { id: "importe", header: ["", translate("€/Ud.")], sort: "string", width: 80, format: webix.i18n.numberFormat, css: { "text-align": "right" }, adjust: "all" },

                { id: "dto", header: ["", translate("Descuento")], sort: "string", width: 100, format: webix.i18n.numberFormat, css: { "text-align": "right" }, adjust: "all" },
                {
                    id: "costeLinea",
                    header: ["", translate("Total")],
                    sort: "string",
                    width: 80,
                    format: webix.i18n.numberFormat,
                    css: { "text-align": "right" },
                    adjust: "all",
                    footer: { content: "summColumn", css: { "text-align": "right", "font-weight": "bold" } }
                },


                { id: "propuestaImporte", header: ["PROPUESTA", translate("€/Ud.")], sort: "string", width: 80, editor: "text", format: webix.i18n.numberFormat, css: { "text-align": "right" }, adjust: "all" },
                {
                    id: "propuestaTotalLinea",
                    header: ["", translate("Total Propuesta")],
                    sort: "string",
                    width: 80,

                    format: webix.i18n.numberFormat,
                    css: { "text-align": "right" },
                    adjust: "all",
                    disabled: true,
                    footer: { content: "summColumn", css: { "text-align": "right", "font-weight": "bold" } }
                },
                { id: "actions", header: [{ text: translate("Acciones"), css: { "text-align": "center" } }], template: actionsTemplate, css: { "text-align": "center" } },
            ],
            onClick: {
                "onDelete": function (event, id, node) {
                    var dtable = this;
                    var id = id.row;
                    var curRow = this.data.pull[id];

                    lineasPropuesta.delete(id, curRow.propuestaId, app);
                },
                "onEdit": function (event, id, node) {
                }
            },
            editable: true,
            editaction: "dblclick",
            rules: {

            },
            on: {
                onBeforeEditStart: function (id) {
                    if (id.column === "descripcion") {
                        if (!permitirEditarDescripcion) return false;
                        permitirEditarDescripcion = false; // Reset
                    }
                    return true;
                },
                "onAfterEditStart": function (id) {

                },
                "onAfterEditStop": function (state, editor, ignoreUpdate) {
                   /*  if (editor.column === "propuestaImporte") {
                        const filaId = editor.row;
                        let nuevoValor = parseFloat(state.value);
                        let datosFila = this.getItem(filaId);
                        let cantidad = parseFloat(datosFila.cantidad);

                        let totalEUnidad = nuevoValor / cantidad;

                        datosFila.propuestaImporte = totalEUnidad;


                    } */

                    if (editor.column === "propuestaImporte") {
                        const filaId = editor.row;
                        let nuevoValor = parseFloat(state.value);
                        let datosFila = this.getItem(filaId);
                        let cantidad = parseFloat(datosFila.cantidad);

                        let total = nuevoValor * cantidad;

                        datosFila.propuestaTotalLinea = total;
                    }

                    const datatable = this;

                    webix.delay(function () {
                        // Calcular suma manualmente
                        let total = 0;
                        datatable.data.each(function (obj) {
                            const val = parseFloat(obj.propuestaTotalLinea);
                            if (!isNaN(val)) total += val;
                        });

                        // Asignar al footer
                        datatable.getColumnConfig("propuestaTotalLinea").footer[0].text =
                            webix.i18n.numberFormat(total);

                        // Redibujar para mostrar el nuevo valor
                        datatable.refresh();

                        lineasPropuesta.actualizarTotales();
                    });

                },
                "onAfterFilter": function () {

                },
                "onAfterLoad": function () {
                    lineasPropuesta.actualizarTotales();
                },
                onItemDblClick: function (id, e, node) {
                    if (id.column === "descripcion") {
                        permitirEditarDescripcion = true;
                        this.editCell(id.row, id.column);
                    }
                },
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
    loadGrid: (propuestaid, subcontrataid, rows, externa) => {
        var total = 0;
        propuestaId = propuestaid;
        subcontrataId = subcontrataid
        numLineas = 0;
        Externa = externa;

        if (propuestaId > 0) {
            propuestasService.getLineasPropuesta(propuestaId)
                .then(rows2 => {
                    if (rows2.length > 0) {
                        $$("lineasPropuestaGrid").clearAll();
                        $$("lineasPropuestaGrid").parse(generalApi.prepareDataForDataTable("propuestaLineaId", rows2));
                        var numReg = $$("lineasPropuestaGrid").count();

                        for (var i = 0; i < rows2.length; i++) {
                            total = total + parseFloat(rows2[i].propuestaTotalLinea);
                            $$('totalPropuesta').setValue(total);
                        }
                    } else {
                        $$("lineasPropuestaGrid").clearAll();
                        $$('totalPropuesta').setValue(total);
                    }
                    if (Externa) {
                        $$("lineasPropuestaGrid").hideColumn("importe");
                        $$("lineasPropuestaGrid").hideColumn("dto");
                        $$("lineasPropuestaGrid").hideColumn("actions");
                        $$("lineasPropuestaGrid").hideColumn("nombreArticulo");
                        $$("lineasPropuestaGrid").hideColumn("costeLinea");
                    }
                })
                .catch((err) => {
                    messageApi.errorMessageAjax(err);
                });
        } else {
            if (rows.length > 0) {

                $$("lineasPropuestaGrid").clearAll();
                $$("lineasPropuestaGrid").parse(generalApi.prepareDataForDataTable("propuestaLineaId", rows));
                var numReg = $$("lineasPropuestaGrid").count();

                for (var i = 0; i < rows.length; i++) {
                    total = total + parseFloat(rows[i].propuestaTotalLinea);
                    $$('totalPropuesta').setValue(total);
                }
            } else {
                $$("lineasPropuestaGrid").clearAll();
                $$('totalPropuesta').setValue(total);
            }
        }
    },
    delete: (id, propuestaId, app) => {
        const translate = app.getService("locale")._;
        var self = this;
        webix.confirm({
            title: translate("AVISO"),
            text: translate("Está seguro que desea eliminar la linea "),
            type: "confirm-warning",
            callback: (action) => {
                if (action === true) {
                    propuestasService.deleteLineaPropuesta(id, propuestaId)
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
        setTimeout(function () {
            var aCuentaProfesional = 0;
            if (rows) {
                for (var i = 0; i < rows.length; i++) {
                    aCuentaProfesional = aCuentaProfesional + rows[i].aCuentaProveedor;
                }
                $$('aCuentaProfesional').setValue(aCuentaProfesional);
                return;
            }
            $$('aCuentaProfesional').setValue(aCuentaProfesional);
        }, 300);
    },

    actualizarTotales: () => {
        let totalCoste = 0;
        let totalPropuesta = 0;

        const table = $$("lineasPropuestaGrid");

        table.data.each(function (item) {
            const coste = parseFloat(item.costeLinea);
            const propuesta = parseFloat(item.propuestaTotalLinea);

            if (!isNaN(coste)) totalCoste += coste;
            if (!isNaN(propuesta)) totalPropuesta += propuesta;
        });

        const diferencia = totalCoste - totalPropuesta;

        //% BI
        let pvpNeto = parseFloat($$('pvpNeto').getValue());
        let porcenBI = 0;

        let biNeto = 0;

        if (totalPropuesta) {
            porcenBI = ((pvpNeto / totalPropuesta) - 1) * 100;
            biNeto = pvpNeto - totalPropuesta;
        }

        $$("precioObjetivo").setValue(webix.i18n.numberFormat(totalCoste));
        $$("totalPropuesta").setValue(webix.i18n.numberFormat(totalPropuesta));
        $$("diferencia").setValue(webix.i18n.numberFormat(diferencia));
        $$("porcenBiNeto").setValue(webix.i18n.numberFormat(porcenBI))
        $$("biNeto").setValue(webix.i18n.numberFormat(biNeto))
    },

    actualizarValores: (checked) => {
        $$("lineasPropuestaGrid").data.each(function (row) {
            // row = objeto de cada fila
            if (checked) {
                row.propuestaImporte = row.importe;
                row.propuestaTotalLinea = row.costeLinea;
            } else {
                row.propuestaImporte = 0;
                row.propuestaTotalLinea = 0;
            }
            $$("lineasPropuestaGrid").updateItem(row.id, row); // actualizar fila
        });
        lineasPropuesta.actualizarTotales();
    }
}

webix.editors.$popup = {
    text: {
        view: "popup",
        body: { view: "textarea", width: 550, height: 550, disabled: true }
    }
};