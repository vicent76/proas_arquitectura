// locales_afectados_window
// Esta es una vista no webix jet para mostrar al crear o modificar
// la asociación entre un servicio y los locales afectados ligados a el
import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";

import { clientesService } from "../services/clientes_service";
import { tiposIvaService } from "../services/tipos_iva_service";
import { unidadesService } from "../services/unidades_service";
import { ofertasService } from "../services/ofertas_service";
import { articulosService } from "../services/articulos_service";
import { unidadesObraService } from "../services/unidades_obra_service";
import { capituloService } from "../services/capitulo_service";
import { parametrosService } from "../services/parametros_service";

var _LineasSubcontrataWindowCreated = false;
var ofertacosteId;
var ofertaSubcontrataId;
var contratoId = null;
var expedienteId;
let selectedIds = [];
let checkboxListenerAttached = false; // fuera del datatable, a nivel de módulo


export const LineasSubcontrataWindow = {
    getWindow: (app) => {
        if (_LineasSubcontrataWindowCreated) return; // Evitamos que se cree dos veces la misma venta
        const translate = app.getService("locale")._;

        var datatable = {
            view: "datatable",
            id: "lineasOfertaCosteGrid",
            scroll: "x,y",
            autoheight: true,
            type: {
                rcheckbox: function (obj, common, value, config) {
                    var checked = (value == config.checkValue) ? 'checked="true"' : '';
                    return "<input disabled class='webix_table_checkbox' type='checkbox' " + checked + ">";
                }
            },
            ready: function () {
                this.attachEvent("onItemDblClick", function (id, e, node) {
                    var curRow = this.data.pull[id.row];
                    var ofertaId = curRow.ofertaId;
                    ofertasCosteGrid.edit(ofertaId)
                });
            },
            scheme: {
                $init: function (obj) {
                    if (obj.asignado != null || obj.asignado != undefined) {
                        obj.$css = "disabled-row";
                    }
                }
            },

            columns: [
                {
                    id: "selecionar",
                    header: [
                        translate("Selecionar"),
                        {
                            content: "selectFilter",
                            options: [
                                { id: "1", value: "Sí" },
                                { id: "0", value: "No" }
                            ]
                        }
                    ],
                    width: 150,
                    template: function (obj, common, value) {
                        const checked = value == "1" ? "checked" : "";
                        const disabled = obj.asignado != null || obj.asignado != undefined;
                        const disabledAttr = disabled ? "disabled" : "";

                        return `<div class='checkbox-cell'>
                            <input class='webix_table_checkbox' type='checkbox' ${checked} ${disabledAttr} data-id='${obj.id}'>
                            </div>`;
                    },


                },

                { id: "ofertaLineaId", header: [translate("Id"), { content: "textFilter" }], sort: "string", width: 50, hidden: true },
                { id: "ofertaId", header: [translate("Id"), { content: "textFilter" }], sort: "string", width: 50, hidden: true },
                { id: "linea", header: [translate("Linea"), { content: "textFilter" }], sort: "string", width: 60 },
                { id: "unidades", header: [translate("Uds."), { content: "textFilter" }], sort: "string", width: 40 },
                { id: "descripcion", header: [translate("Concepto"), { content: "textFilter" }], sort: "string", fillspace: true },

                {
                    id: "importe",
                    header: [translate("€/Ud."), { content: "textFilter" }],
                    sort: "string",
                    adjust: "all",
                    width: 80,
                    format: function (value) {
                        // Formateamos el valor a 4 decimales
                        return webix.Number.format(value, { decimalSize: 4, groupDelimiter: ".", decimalDelimiter: "," });
                    },
                    css: { "text-align": "right" }
                },

                { id: "cantidad", header: [translate("Cant."), { content: "textFilter" }], sort: "string", width: 50, css: { "text-align": "right" } },
                { id: "dto", header: [translate("Descuento"), { content: "textFilter" }], sort: "string", width: 100, format: webix.i18n.numberFormat, css: { "text-align": "right" } },
                {
                    id: "costeLinea",
                    header: [translate("Coste."), { content: "textFilter" }],
                    sort: "string", width: 80,
                    adjust: "all",
                    css: { "text-align": "right" },
                    format: function (value) {
                        // Formateamos el valor a 4 decimales
                        return webix.Number.format(value, { decimalSize: 4, groupDelimiter: ".", decimalDelimiter: "," });
                    },
                }
            ],
            rightSplit: 1,
            scroll: true,
            onClick: {
                "onDelete": function (event, id, node) {
                    var id = id.row;
                    ofertasCosteGrid.delete(id, app);
                },
                "onEdit": function (event, id, node) {
                    var curRow = this.data.pull[id.row];
                    var ofertaId = curRow.ofertaId;
                    ofertasCosteGrid.edit(ofertaId)
                }
            },
            editable: true,
            editaction: "dblclick",
            rules: {

            },
            on: {
                onAfterRender: function () {
                    if (checkboxListenerAttached) return; // ya está conectado
                    checkboxListenerAttached = true;

                    const container = this.$view;
                    container.addEventListener("change", (e) => {
                        if (e.target.classList.contains("webix_table_checkbox")) {
                            const checkbox = e.target;
                            const rowId = String(this.locate(checkbox)); // forzamos a string
                            const isChecked = checkbox.checked;

                            // Actualizamos el dataset
                            this.getItem(rowId).selecionar = isChecked ? "1" : "0";

                            if (isChecked) {
                                if (!selectedIds.includes(rowId)) {
                                    selectedIds.push(rowId);
                                }
                            } else {
                                selectedIds = selectedIds.filter(item => item !== rowId);
                            }

                            console.log("Selected IDs:", selectedIds);
                        }
                    });

                },
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
                        } else {
                            currentRowDatatableView = this.data.pull[currentIdDatatableView];
                            delete currentRowDatatableView.id;
                            var data = currentRowDatatableView;
                        }
                    }
                },
                "onAfterFilter": function () {
                    var numReg = $$("ofertasCosteGrid").count();
                    $$("ofertasCosteNReg").config.label = "NREG: " + numReg;
                    $$("ofertasCosteNReg").refresh();
                },
                "onBeforeEditStart": function (cell) {
                    const row = this.getItem(cell.row);
                    if (cell.column != "selecionar" && (row.asignado != null || row.asignado != undefined)) {
                        return false; // Evita la edición si no está asignado
                    }
                },
            }
        }

        var datatableButton =
        {
            rows: [
                {
                    cols: [

                        {

                        },
                        {
                            width: 200,
                            padding: 10,
                            rows: [

                                {

                                    align: "center",
                                    cols: [
                                        {},
                                        { view: "button", label: "Aceptar", click: () => LineasSubcontrataWindow.accept(), css: "webix_primary", type: "form" }
                                    ]
                                },

                            ]
                        },


                    ]
                },
                {
                    minHeight: 100
                }
            ]

        }

        var _view3 = {
            rows: [
                datatable,
                datatableButton
            ]
        }


        webix.ui({
            view: "window",
            id: "LineasSubcontrataWindow",
            position: "top", move: true, resize: true,
            width: 1100,
            minHeight: 100,
            head: {
                view: "toolbar", cols: [
                    {},
                    {
                        view: "icon", icon: "mdi mdi-close", click: () => {
                            $$('LineasSubcontrataWindow').hide();
                        }
                    }
                ]
            }, modal: true,
            body: _view3
        });
        _LineasSubcontrataWindowCreated = true; // La ventana se ha creado e informamos al proceso


        return
    },

    loadWindow: (ofertaCosteid, ofertaSubcontrataid, expedienteid) => {
        $$('LineasOfertafrm').clear();
        ofertacosteId = ofertaCosteid;
        ofertaSubcontrataId = ofertaSubcontrataid;
        expedienteId = expedienteid;
        //buscamos el iva por defecto del cliente
        if (ofertacosteId && ofertaSubcontrataId && expedienteId) {
            ofertasService.getLineasOfertaCoste(ofertacosteId, ofertaSubcontrataId, expedienteId)
                .then(rows => {
                    var total = 0;
                    if (rows.length > 0) {
                        /*  numLineas = rows.length;
                         OfertasFormWindow.estableceNumLineas(numLineas); */
                        $$("lineasOfertaCosteGrid").clearAll();
                        $$("lineasOfertaCosteGrid").parse(generalApi.prepareDataForDataTable("ofertaLineaId", rows));


                        $$('LineasSubcontrataWindow').show();
                    }
                })
                .catch((err) => {
                    messageApi.errorMessageAjax(err);
                });
        } else {
            $$("lineasOfertaCosteGrid").clearAll();
            return
        }
    },


    accept: () => {
        /* if (contratoId) {
            messageApi.errorMessage("Hay un contrato soaciado, no se puede modificar.");
            return;
        } */
        if (selectedIds.length == 0) {
            messageApi.errorMessage("Se debe seleccionar algún item");
            return;
        }
        ofertasService.updateLineasSubcontrata(selectedIds, ofertaSubcontrataId)
            .then(row => {
                // Hay que cerrar la ventana y refrescar el grid
                $$('LineasSubcontrataWindow').hide();
                 LineasSubcontrataWindow.refreshLineas(ofertaSubcontrataId);
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

     refreshGridCloseWindow: (ofertaId) => {
            if(ofertaId) {
                
                LineasSubcontrataWindow.refreshLineas(ofertaId);
                //LineasOfertaWindow.refreshBases(ofertaId);
            } 
        },
    
       /*  refreshLineas: (ofertaId) => {
            ofertasService.getLineasOferta(ofertaId)
                .then(rows => {
                    var total = 0;
                    if(rows != null || rows.length > 0) {
                        $$("lineasOfertaGrid").clearAll();
                        $$("lineasOfertaGrid").parse(generalApi.prepareDataForDataTable("ofertaLineaId", rows));
                        var numReg = $$("lineasOfertaGrid").count();
                        $$("ofertasLineasNReg").config.label = "NREG: " + numReg;
                        $$("ofertasLineasNReg").refresh();
                        $$('lineasOfertaWindow').hide();
                        for(var i = 0; i < rows.length; i++) {
                            total = total + rows[i].totalLinea;
                            $$('importeCli').setValue(total);
                        }
                    } else {
                        $$('lineasOfertaWindow').hide();
                        $$('importeCli').setValue(total);
                    }
                })
                .catch((err) => {
                    messageApi.errorMessageAjax(err);
                });
    
        },
 */

    actulizaLinea: (data) => {
        ofertasService.putLineaOferta(data, data.ofertaLineaId)
            .then(row => {
                // Hay que cerrar la ventana y refrescar el grid
                LineasSubcontrataWindow.refreshGridCloseWindow(ofertaId);
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



    cancel: () => {
        $$('LineasSubcontrataWindow').hide();
    },
    

    refreshLineas: (ofertaId) => {
        ofertasService.getLineasOferta(ofertaId)
            .then(rows => {
                var total = 0;
                if (rows != null || rows.length > 0) {
                    $$("lineasOfertaGrid").clearAll();
                    $$("lineasOfertaGrid").parse(generalApi.prepareDataForDataTable("ofertaLineaId", rows));

                    $$('LineasSubcontrataWindow').hide();
                    for (var i = 0; i < rows.length; i++) {
                        total = total + rows[i].totalLinea;
                    }
                     $$('importeCli').setValue(total);
                     lineasOferta.loadGrid(ofertaId, null, importeObra, contratoId, ofertaCosteId);
                } else {
                    $$('LineasSubcontrataWindow').hide();
                    $$('importeCli').setValue(total);
                }
            })
            .catch((err) => {
                messageApi.errorMessageAjax(err);
            });

    },

    refreshBases: (ofertaId) => {
        ofertasService.getBasesOferta(ofertaId)
            .then(rows => {
                if (rows.length > 0) {
                    $$("basesOfertaGrid").clearAll();
                    $$("basesOfertaGrid").parse(generalApi.prepareDataForDataTable("ofertaBaseId", rows));
                    var numReg = $$("basesOfertaGrid").count();
                    $$("basesLineasNReg").config.label = "NREG: " + numReg;
                    $$("basesLineasNReg").refresh();
                } else {
                    $$("basesOfertaGrid").clearAll();
                }
            })
            .catch((err) => {
                messageApi.errorMessageAjax(err);
            });
    },



    loadTiposIva: (tipoIvaId) => {
        tiposIvaService.getTiposIva()
            .then(rows => {
                var tiposIva = generalApi.prepareDataForCombo('tipoIvaId', 'nombre', rows);
                tiposIva.push({ id: null, value: "" });
                var list = $$("cmbTiposIva").getPopup().getList();
                list.clearAll();
                list.parse(tiposIva);
                $$("cmbTiposIva").setValue(tipoIvaId);
                $$("cmbTiposIva").refresh();
                if (tipoIvaId) LineasSubcontrataWindow.cambioTipoIva(tipoIvaId)
                return;
            })
    },



    loadGruposArticulo: (grupoArticuloId, articuloId) => {
        capituloService.getCapitulos()
            .then(rows => {
                var gruposArticulos = generalApi.prepareDataForCombo('grupoArticuloId', 'nombre', rows);
                var list = $$("cmbGrupoArticulo").getPopup().getList();
                list.clearAll();
                list.parse(gruposArticulos);
                // Buscar el objeto que coincida con grupoArticuloId
                if (grupoArticuloId) {
                    let grupoSeleccionado = rows.find(item => item.grupoArticuloId == grupoArticuloId);

                    if (grupoSeleccionado) {
                        $$("cmbGrupoArticulo").setValue(grupoArticuloId);
                        $$("cmbGrupoArticulo").refresh();
                        LineasSubcontrataWindow.loadArticulos(grupoArticuloId, articuloId);
                    }
                } else {
                    $$("cmbGrupoArticulo").setValue(null);
                    $$("cmbGrupoArticulo").refresh();
                    LineasSubcontrataWindow.loadArticulos(null, articuloId);
                }
                return;
            });
    },



    loadUnidades: (unidadId) => {
        unidadesService.getUnidades()
            .then(rows => {
                var unidades = generalApi.prepareDataForCombo('unidadId', 'abrev', rows);
                var list = $$("cmbUnidades").getPopup().getList();
                list.clearAll();
                list.parse(unidades);
                $$("cmbUnidades").setValue(unidadId);
                $$("cmbUnidades").refresh();
                return;
            })
    },


    cambioArticulo: (articuloId) => {
        articulosService.getArticulo(articuloId)
            .then(row => {
                if (row) {
                    $$("cmbUnidades").setValue(row.unidadId);
                    $$("cmbUnidades").refresh();
                    $$('descripcion').setValue(row.descripcion);
                    $$('cantidad').setValue(1);
                    LineasSubcontrataWindow.recuperaCosteArticulo(articuloId);
                }
            })
            .catch(err => {
                messageApi.errorMessageAjax(err);
            });
    },

    cambioTipoIva: (tipoIvaId) => {
        tiposIvaService.getTipoIva(tipoIvaId)
            .then(row => {
                if (row) {
                    $$('porcentaje').setValue(row.porcentaje);
                }
            })
    },

    recuperaCosteArticulo(articuloId) {
        if (!articuloId) return;
        unidadesObraService.getUnidadObra(articuloId)
            .then(row => {
                if (row) {
                    datosCalculo.porcen1 = parseFloat(row.porcen1) / 100,
                        datosCalculo.porcen2 = parseFloat(row.porcen2) / 100,
                        datosCalculo.porcen3 = parseFloat(row.porcen3) / 100,
                        datosCalculo.porcen4 = parseFloat(row.porcen4) / 100,
                        aplicarFormula = row.aplicarFormula
                    if (aplicarFormula) {
                        datosCalculo.costeArticulo = parseFloat(row.coste);
                        LineasSubcontrataWindow.calcularCosto();
                    } else {
                        let result = 0;
                        result = row.coste * datosCalculo.indiceCorrector;
                        $$('importeCliente').setValue(result);
                        LineasSubcontrataWindow.desbloqueaEventos();
                    }
                }
            })
            .catch(err => {
                var error = err.response;
                var index = error.indexOf("Cannot delete or update a parent row: a foreign key constraint fails");
                if (index != -1) {
                    messageApi.errorRestriccion()
                } else {
                    messageApi.errorMessageAjax(err);
                }
            })
    },


}