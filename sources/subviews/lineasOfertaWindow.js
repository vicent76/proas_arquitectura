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

var _lineasOfertaWindowCreated = false;
var translate;
var ofertaId;
var ofertaLineaId;
var articulos;
var cliId;
var antcod = null;
var datosCalculo = null;
var enCarga = false;
var aplicarFormula = false;
var indiceCorrector = 0;
var limiteImpObra = 0;
var importeObra = 0;
var cantidad = 0;
var contratoId = null;


export const LineasOfertaWindow = {
    getWindow: (app) => {
        if (_lineasOfertaWindowCreated) return; // Evitamos que se cree dos veces la misma venta
        translate = app.getService("locale")._;
        const _view2 = {
            view: "form",
            id: "LineasOfertafrm",
            scroll: "y",
            scroll: true,
            elements: [
                { template: "Linea del oferta", type: "section" },

                {
                    view: "fieldset",
                    label: "GENERAL",
                    id: "general",
                    body: {
                        rows: [

                            {
                                rows: [
                                    {
                                        cols: [
                                            {
                                                view: "text", id: "capituloLinea", name: "capituloLinea", required: true,
                                                label: "Texto del capitulo", labelPosition: "top", disabled: true
                                            },
                                        ]
                                    },
                                    {
                                        cols: [
                                            {
                                                view: "text", id: "linea", name: "linea", required: true,
                                                label: "Linea", labelPosition: "top", width: 80
                                            },
                                            {
                                                view: "combo", id: "cmbGrupoArticulo", name: "grupoArticuloId", required: true, options: {},
                                                label: "Capítulo", labelPosition: "top", minwidth: 250
                                            },
                                            {
                                                view: "combo", id: "cmbArticulos", name: "articuloId", minwidth: 200,
                                                label: "Unidad constructiva", labelPosition: "top", options: {
                                                    filter: function (item, input) {
                                                        var id = item.id;
                                                        var value1 = item.value.toLowerCase();
                                                        return value1.indexOf(input) !== -1 || id == input;
                                                    },

                                                }
                                            },
                                            {
                                                view: "combo", id: "cmbUnidades", name: "unidadId", options: {},
                                                label: "Unidades", labelPosition: "top", width: 120, width: 150
                                            },
                                            {
                                                view: "counter", id: "cantidad", name: "cantidad", required: true, step: 1,
                                                label: "Cantidad", labelPosition: "top", width: 100, css: "custom-counter",
                                                on: {
                                                    onChange: function (newValue) {
                                                        cantidad = newValue;
                                                        var uni = $$('cantidad').getValue();
                                                        var preCli = $$('importeCliente').getValue();

                                                        if (preCli != "") {
                                                            preCli = parseFloat(preCli);
                                                            var precioCli = parseFloat(uni * preCli)
                                                            $$('precioCliente').setValue(parseFloat(precioCli));

                                                            //calculamos el descuento  del cliente
                                                            var dtoCli = ($$('dto').getValue());
                                                            if (dtoCli != '' || dtoCli > 0) {
                                                                dtoCli = parseFloat(dtoCli);
                                                                $$('coste').setValue(precioCli - dtoCli);
                                                            } else {
                                                                $$('coste').setValue(precioCli);
                                                            }

                                                        }
                                                        //localStorage.setItem("cantidad", newValue); // Guardar valor en localStorage
                                                    },
                                                    onClick: function () {
                                                        this.setValue(cantidad);
                                                        var uni = $$('cantidad').getValue();
                                                        var preCli = $$('importeCliente').getValue();

                                                        if (preCli != "") {
                                                            preCli = parseFloat(preCli);
                                                            var precioCli = parseFloat(uni * preCli)
                                                            $$('precioCliente').setValue(parseFloat(precioCli));

                                                            //calculamos el descuento  del cliente
                                                            var dtoCli = ($$('dto').getValue());
                                                            if (dtoCli != '' || dtoCli > 0) {
                                                                dtoCli = parseFloat(dtoCli);
                                                                $$('coste').setValue(precioCli - dtoCli);
                                                            } else {
                                                                $$('coste').setValue(precioCli);
                                                            }

                                                        }
                                                    }
                                                }
                                            },


                                        ]
                                    },
                                    {
                                        cols: [
                                            {
                                                view: "textarea", id: "descripcion", name: "descripcion",
                                                label: "Descripción", labelPosition: "top", height: 170
                                            }
                                        ]
                                    }
                                ]
                            },

                        ]
                    }
                },
                {

                    view: "fieldset",
                    label: "CLIENTE",
                    id: "cliente",
                    body: {
                        rows: [
                            {
                                cols: [
                                    {
                                        view: "combo", id: "cmbTiposIva", name: "tipoIvaId", required: true, options: {},
                                        label: "IVA", labelPosition: "top", width: 180, hidden: true
                                    },
                                    {
                                        view: "text", id: "porcentaje", name: "porcentaje",
                                        label: "Porcentaje", labelPosition: "top", minwidth: 80, format: "1.00", hidden: true
                                    },
                                    {
                                        view: "text",
                                        id: "importeCliente",
                                        name: "importe",
                                        label: "coste/ud",
                                        labelPosition: "top",
                                        minWidth: 80,
                                        format: {
                                            edit: function (v) {
                                                if (v === null || v === undefined) v = 0;
                                                let formatted = webix.Number.format(Math.abs(v), {
                                                    decimalSize: 4,
                                                    groupDelimiter: "",
                                                    decimalDelimiter: "."
                                                });
                                                return (v < 0 ? "-" : "") + formatted;
                                            },
                                            parse: function (v) {
                                                if (!v) return 0;
                                                // Como el usuario escribe con punto decimal, solo convertimos a número
                                                let num = parseFloat(v);
                                                return isNaN(num) ? 0 : num;
                                            }
                                        }
                                    },

                                    {
                                        view: "text", id: "perdto", name: "perdto",
                                        label: "% Descuento", labelPosition: "top", minwidth: 80,
                                        format: {
                                            edit: function (v) { return webix.Number.format(v, webix.i18n); },
                                            parse: function (v) { return webix.Number.parse(v, webix.i18n); }
                                        }
                                    },
                                ]
                            },
                            {
                                cols: [
                                    {
                                        view: "text", id: "precioCliente", value: 0, name: "precio", required: true,
                                        label: "Precio", labelPosition: "top", minWidth: 100, disabled: true,
                                        format: {
                                            edit: function (v) {
                                                if (v === null || v === undefined) v = 0;
                                                let formatted = webix.Number.format(Math.abs(v), {
                                                    decimalSize: 4,
                                                    groupDelimiter: "",
                                                    decimalDelimiter: "."
                                                });
                                                return (v < 0 ? "-" : "") + formatted;
                                            },
                                            parse: function (v) {
                                                if (!v) return 0;
                                                let num = parseFloat(v);
                                                return isNaN(num) ? 0 : num;
                                            }
                                        }
                                    },
                                    {
                                        view: "text", id: "dto", value: 0, name: "dto", required: true, disabled: true,
                                        label: "Importe descuento", labelPosition: "top", minWidth: 100, format: "1.00"
                                    },
                                    {
                                        view: "text", id: "coste", name: "coste", disabled: true,
                                        label: "total coste", labelPosition: "top", minwidth: 80,
                                        format: {
                                            edit: function (v) {
                                                if (v === null || v === undefined) v = 0;
                                                let formatted = webix.Number.format(Math.abs(v), {
                                                    decimalSize: 4,
                                                    groupDelimiter: "",
                                                    decimalDelimiter: "."
                                                });
                                                return (v < 0 ? "-" : "") + formatted;
                                            },
                                            parse: function (v) {
                                                if (!v) return 0;
                                                // Como el usuario escribe con punto decimal, solo convertimos a número
                                                let num = parseFloat(v);
                                                return isNaN(num) ? 0 : num;
                                            }
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                },

                {
                    margin: 5, cols: [
                        { gravity: 5 },
                        { view: "button", id: "btnCancelarWindowLineaOferta", label: translate("Cancelar"), click: LineasOfertaWindow.cancel, hotkey: "esc" },
                        { view: "button", id: "btnAceptarWindowLineaOferta", label: translate("Aceptar"), click: LineasOfertaWindow.accept, type: "form" }
                    ]
                }
            ]

        };
        webix.ui({
            view: "window",
            id: "lineasOfertaWindow",
            position: "top", move: true, resize: true,
            width: 1100,
            height: 700,
            head: {
                view: "toolbar", cols: [
                    {},
                    {
                        view: "icon", icon: "mdi mdi-close", click: () => {
                            $$('lineasOfertaWindow').hide();
                        }
                    }
                ]
            }, modal: true,
            body: _view2
        });
        _lineasOfertaWindowCreated = true; // La ventana se ha creado e informamos al proceso

        //EVENTOS

        $$("cmbGrupoArticulo").attachEvent("onChange", function (newv, oldv) {
            if (newv == '') return;
            LineasOfertaWindow.loadGruposArticulo(newv, null)
            LineasOfertaWindow.loadArticulos(newv, null);
            LineasOfertaWindow.crearTextoDeCapituloAutomatico(newv);
            LineasOfertaWindow.loadCapituloData(newv)
        });

        $$("cmbArticulos").attachEvent("onChange", function (newv, oldv) {
            if (newv && newv != "") {
                LineasOfertaWindow.cambioArticulo(newv);
            }
        });

        /*  $$("cantidad").attachEvent("onFocus", function(current_view, prev_view){
            $$('cantidad').setValue('');
            $$('precioCliente').setValue(0);
            $$('coste').setValue(0);
        }); */

   
        $$("cantidad").attachEvent("onBlur", function (a, b) {
            var uni = $$('cantidad').getValue();
            var preCli = $$('importeCliente').getValue();

            if (preCli != "") {
                preCli = parseFloat(preCli);
                var precioCli = parseFloat(uni * preCli)
                $$('precioCliente').setValue(parseFloat(precioCli));

                //calculamos el descuento  del cliente
                var dtoCli = ($$('dto').getValue());
                if (dtoCli != '' || dtoCli > 0) {
                    dtoCli = parseFloat(dtoCli);
                    $$('coste').setValue(precioCli - dtoCli);
                } else {
                    $$('coste').setValue(precioCli);
                }
            }
        });


        $$("importeCliente").attachEvent("onChange", function (newv, oldv) {
            if (newv == "") { newv = 0 }
            var preCli = parseFloat(newv);
            var uni = $$('cantidad').getValue();

            if (uni != "") {
                var uni = parseFloat(uni);
            }

            if (uni != "") {
                var precioCli = parseFloat(uni * preCli)
                $$('precioCliente').setValue(parseFloat(precioCli));
                //calculamos el descuento  del cliente
                var dtoCli = ($$('dto').getValue());
                if (dtoCli != '' || dtoCli > 0) {
                    dtoCli = parseFloat(dtoCli);
                    $$('coste').setValue(precioCli - dtoCli);
                } else {
                    $$('coste').setValue(precioCli);
                }
            }
        });


        $$('perdto').attachEvent("onBlur", function (a, b) {
            //calculo en caso de descuento cliente
            var perdto = $$('perdto').getValue();
            var precio = $$('precioCliente').getValue()
            if ((perdto > 0 || perdto != '') && (precio > 0 || precio != '')) {
                perdto = parseFloat(perdto);
                precio = parseFloat(precio);

                perdto = perdto / 100;
                var descuento = parseFloat(precio * perdto);
                //se calcula el descuento cliente
                $$('dto').setValue(descuento);
                var resultado = parseFloat(precio - descuento);
                $$('coste').setValue(resultado);
            }

        });

        return
    },

    loadWindow: (ofertaid, ofertaLineaid, cliid, grupoArticuloId, articuloId, datoscalculo, importeobra, contratoid) => {
        $$('LineasOfertafrm').clear();
        contratoId = contratoid;
        ofertaId = ofertaid;
        ofertaLineaId = ofertaLineaid
        cliId = cliid;
        if (datoscalculo) {
            datosCalculo = datoscalculo
            importeObra = datosCalculo.importeObra;
            indiceCorrector = datosCalculo.indiceCorrector;
            limiteImpObra = datosCalculo.limiteImpObra;
        } else {
            parametrosService.getParametros()
                .then((parametros) => {
                    if (parametros && parametros[0].indiceCorrector) indiceCorrector = parametros[0].indiceCorrector;
                    if (parametros && parametros[0].limiteImpObra) limiteImpObra = parametros[0].limiteImpObra;
                    importeObra = importeobra
                })
                .catch((err) => {
                    messageApi.errorMessageAjax(err);
                });
        }
        $$('lineasOfertaWindow').show();
        if (ofertaLineaId) {
            enCarga = true
            LineasOfertaWindow.bloqueaEventos();
        } else {
            $$("cmbGrupoArticulo").blockEvent();
            enCarga = false;
            LineasOfertaWindow.limpiaWindow(grupoArticuloId, articuloId);
        }
    },

    limpiaWindow: (grupoArticuloId, articuloId) => {
        $$('porcentaje').setValue(0);
        $$('importeCliente').setValue(0);
        $$('perdto').setValue(0);
        $$('dto').setValue(0);
        $$('coste').setValue(0);
        $$('precioCliente').setValue(0);
        $$('perdto').setValue(0);
        $$('dto').setValue(0);
        $$('descripcion').setValue('');
        LineasOfertaWindow.loadTiposIva(null);
        if (grupoArticuloId && articuloId) {
            LineasOfertaWindow.loadGruposArticulo(grupoArticuloId, articuloId);
        } else {
            LineasOfertaWindow.loadGruposArticulo(null, null);
        }

        LineasOfertaWindow.loadUnidades(9);
        LineasOfertaWindow.nuevaLinea(grupoArticuloId);

    },

    loadCapituloData(grupoArticuloId) {
        capituloService.getCapitulo(grupoArticuloId)
            .then(row => {
                if (row) {
                    datosCalculo = {
                        indiceCorrector: indiceCorrector,
                        porcen1: 0,
                        porcen2: 0,
                        porcen3: 0,
                        porcen4: 0,
                        importeObra: importeObra,
                        limiteImpObra: limiteImpObra
                    }
                }
            });
    },

    calcularCosto() {
        let resultado;
        let porcen4 = parseFloat(datosCalculo.porcen4);
        let porcen3 = parseFloat(datosCalculo.porcen3);
        let porcen2 = parseFloat(datosCalculo.porcen2);
        let porcen1 = parseFloat(datosCalculo.porcen1);
        let limiteImpObra = parseFloat(datosCalculo.limiteImpObra);
        let importeObra = parseFloat(datosCalculo.importeObra);
        let costeArticulo = parseFloat(datosCalculo.costeArticulo);
        let indiceCorrector = parseFloat(datosCalculo.indiceCorrector);

        if (datosCalculo.importeObra > datosCalculo.limiteImpObra) {
            resultado = importeObra * porcen1;
        } else {
            let porcentaje = importeObra * porcen2;
            if (porcentaje < datosCalculo.costeArticulo) {
                resultado = costeArticulo;
            } else {
                resultado = (importeObra * porcen3) + (limiteImpObra - importeObra) * porcen4;
            }
        }

        resultado * indiceCorrector;
        $$('importeCliente').setValue(resultado);
        LineasOfertaWindow.desbloqueaEventos();
        enCarga = true;
    },



    crearTextoDeCapituloAutomatico: (grupoArticuloId) => {
        var numeroCapitulo = Math.floor($$('linea').getValue());
        var nombreCapitulo = "Capitulo " + numeroCapitulo + ": ";
        // ahora hay que buscar el nombre del capitulo para concatenarlo
        articulosService.getGrupoArticulos(grupoArticuloId)
            .then(row => {
                var capituloAntiguo = $$('capituloLinea').getValue();
                nombreCapitulo += row.nombre;
                if (capituloAntiguo != nombreCapitulo) {
                    $$('capituloLinea').setValue(nombreCapitulo);
                }
            })
            .catch(err => {
                messageApi.errorMessageAjax(err);
            });
    },

    nuevaLinea: (grupoArticuloId) => {
        //limpiaDataLinea();
        ofertasService.getSiguienteLinea(ofertaId)
            .then(row => {
                if (row) {
                    $$('linea').setValue(row);
                    if (grupoArticuloId) {
                        LineasOfertaWindow.crearTextoDeCapituloAutomatico(grupoArticuloId);
                        LineasOfertaWindow.loadCapituloData(grupoArticuloId)
                    }
                }
            })
            .catch(err => {
                messageApi.errorMessageAjax(err);
            });
    },

    bloqueaEventos: () => {
        $$("importeCliente").blockEvent();
        $$("cmbArticulos").blockEvent();
        $$("cmbGrupoArticulo").blockEvent();

        ofertasService.getLineaOferta(ofertaLineaId)
            .then(data => {
                var datos = data[0]
                $$("LineasOfertafrm").clear();
                $$("LineasOfertafrm").setValues(datos);
                LineasOfertaWindow.loadUnidades(datos.unidadId);
                LineasOfertaWindow.recuperaCapituloId(datos.articuloId, true);
                LineasOfertaWindow.loadTiposIva(datos.tipoIvaId);
            })
            .catch((err) => {
                messageApi.errorMessageAjax(err);
            });
    },

    recuperaCapituloId: (articuloId) => {
        articulosService.getArticulo(articuloId)
            .then(row => {
                if (row) {
                    LineasOfertaWindow.loadGruposArticulo(row.grupoArticuloId, articuloId)
                }
            })
            .catch(err => {
                messageApi.errorMessageAjax(err);
            })
    },

    desbloqueaEventos: () => {
        $$("importeCliente").unblockEvent();
        $$("cmbArticulos").unblockEvent();
        $$("cmbGrupoArticulo").unblockEvent();
    },
    accept: () => {
        if (contratoId) {
            messageApi.errorMessage("Hay un contrato soaciado, no se puede modificar.");
            return;
        }
        if (!$$("LineasOfertafrm").validate()) {
            messageApi.errorMessage("Debe rellenar los campos correctamente");
            return;
        }
        LineasOfertaWindow.enviaDatos();
    },

    enviaDatos: async () => {
        let result = null;
        var data = $$("LineasOfertafrm").getValues();
        data = LineasOfertaWindow.formateaDatos(data);
        // controlamos si es un alta o una modificación.
        //CASE PUT
        if (data.ofertaLineaId) {
            try {
                //miramos primero si hay registro asociados
                result = await LineasOfertaWindow.getLineasVinculadas(data.ofertaLineaId);
                if (result) {
                    webix.confirm({
                        title: translate("AVISO"),
                        text: translate("Hay registros vinculados que resultarán afectados, ¿Está seguro que desea continuar?"),
                        type: "confirm-warning",
                        callback: (action) => {
                            if (action === true) {
                                LineasOfertaWindow.actulizaLineaAsociadas(data); //NO REGISTROS ASOCIADOS SOLO ACTULIZAMOS LA LINEA
                            }
                        }
                    });
                } else {
                    LineasOfertaWindow.actulizaLinea(data); //NO REGISTROS ASOCIADOS SOLO ACTULIZAMOS LA LINEA
                }

            } catch (e) {
                messageApi.errorMessageAjax(e)
            }


        } else {
            // es un alta
            data.ofertaLineaId = 0;
            //Miramos si hay presupuestos asociados
            result = await LineasOfertaWindow.getOfertasVinculadas();
            if (result) {
                webix.confirm({
                    title: translate("AVISO"),
                    text: translate("Hay registros vinculados que resultarán afectados, ¿Está seguro que desea continuar?"),
                    type: "confirm-warning",
                    callback: (action) => {
                        if (action === true) {
                            let arr = [];
                            for (let r of result) {
                                let obj = {
                                    ofertaId: r.ofertaId,
                                    ofertaCosteId: r.ofertaCosteId,
                                    esCoste: r.esCoste,
                                    porcentajeBeneficio: r.porcentajeBeneficio,
                                    porcentajeAgente: r.porcentajeAgente

                                };
                                arr.push(obj);
                            }
                            LineasOfertaWindow.postLineaAsociadas(data, arr); //NO REGISTROS ASOCIADOS SOLO ACTULIZAMOS LA LINEA
                        }
                    }
                });
            } else {
                ofertasService.postLineaOferta(data)
                    .then(row => {

                        // Hay que cerrar la ventana y refrescar el grid
                        $$('lineasOfertaWindow').hide();
                        LineasOfertaWindow.refreshGridCloseWindow(ofertaId);
                    })
                    .catch((err) => {
                        messageApi.errorMessageAjax(err);
                    });
            }
        }

    },
    getLineasVinculadas: async (ofertaLineaId) => {
        try {
            const rows = await ofertasService.getLineasVinculadas(ofertaLineaId);
            return rows;
        } catch (err) {
            messageApi.errorMessageAjax(err);
            throw err; // opcional: si quieres propagar el error
        }
    },

    getOfertasVinculadas: async () => {
        try {
            const rows = await ofertasService.getOfertasVinculadas(ofertaId);
            return rows;
        } catch (err) {
            messageApi.errorMessageAjax(err);
            throw err; // opcional: si quieres propagar el error
        }
    },



    actulizaLinea: (data) => {
        ofertasService.putLineaOferta(data, data.ofertaLineaId)
            .then(row => {
                // Hay que cerrar la ventana y refrescar el grid
                $$('lineasOfertaWindow').hide();
                LineasOfertaWindow.refreshGridCloseWindow(ofertaId);
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


    actulizaLineaAsociadas: (data) => {
        ofertasService.putLineaOfertaAsociadas(data, data.ofertaLineaId)
            .then(row => {
                // Hay que cerrar la ventana y refrescar el grid
                $$('lineasOfertaWindow').hide();
                LineasOfertaWindow.refreshGridCloseWindow(ofertaId);
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

    postLineaAsociadas: (data, arr) => {
        ofertasService.postLineaOfertaAsociadas(data, arr)
            .then(row => {
                // Hay que cerrar la ventana y refrescar el grid
                $$('lineasOfertaWindow').hide();
                LineasOfertaWindow.refreshGridCloseWindow(ofertaId);
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


    formateaDatos(data) {
        delete data.unidades;
        delete data.grupoArticuloId;
        data.ofertaId = ofertaId;
        data.totalLinea = $$('coste').getValue();
        data.porcentajeBeneficio = 0;
        data.porcentajeAgente = 0;
        //data.importeProveedor = $$('importeCliente').getValue()
        if (!ofertaLineaId) data.ofertaLineaId = 0;
        return data;
    },

    preparaDatos(data) {
        delete data.tipoProfesionalId;
        data.descripcion = $$('descripcion').getValue();

        return data;
    },



    cancel: () => {
        $$('lineasOfertaWindow').hide();
    },
    refreshGridCloseWindow: (ofertaId) => {
        if (ofertaId) {

            LineasOfertaWindow.refreshLineas(ofertaId);
            //LineasOfertaWindow.refreshBases(ofertaId);
        }
    },

    refreshLineas: (ofertaId) => {
        ofertasService.getLineasOferta(ofertaId)
            .then(rows => {
                var total = 0;
                if (rows != null || rows.length > 0) {
                    $$("lineasOfertaGrid").clearAll();
                    $$("lineasOfertaGrid").parse(generalApi.prepareDataForDataTable("ofertaLineaId", rows));
                    var numReg = $$("lineasOfertaGrid").count();
                    $$("ofertasLineasNReg").config.label = "NREG: " + numReg;
                    $$("ofertasLineasNReg").refresh();
                    $$('lineasOfertaWindow').hide();
                    for (var i = 0; i < rows.length; i++) {
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
                if (tipoIvaId) LineasOfertaWindow.cambioTipoIva(tipoIvaId)
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
                        LineasOfertaWindow.loadArticulos(grupoArticuloId, articuloId);
                    }
                } else {
                    $$("cmbGrupoArticulo").setValue(null);
                    $$("cmbGrupoArticulo").refresh();
                    LineasOfertaWindow.loadArticulos(null, articuloId);
                }
                return;
            });
    },

    loadArticulos: (grupoArticuloId, articuloId) => {
        if (grupoArticuloId) {
            articulosService.getArticulosGrupo(grupoArticuloId)
                .then(rows => {
                    if (rows) {
                        var articulos = generalApi.prepareDataForCombo('articuloId', 'nombre', rows);
                        var list = $$("cmbArticulos").getPopup().getList();
                        list.clearAll();
                        list.parse(articulos);

                        $$("cmbArticulos").setValue(articuloId);
                        $$("cmbArticulos").refresh();
                        if (!enCarga) {
                            LineasOfertaWindow.recuperaCosteArticulo(articuloId);
                        } else {
                            LineasOfertaWindow.desbloqueaEventos();
                        }
                    }
                });
        } else {
            articulosService.getArticulos()
                .then(rows => {
                    if (rows) {
                        var articulos = generalApi.prepareDataForCombo('articuloId', 'nombre', rows);
                        var list = $$("cmbArticulos").getPopup().getList();
                        list.clearAll();
                        list.parse(articulos);

                        $$("cmbArticulos").setValue(articuloId);
                        $$("cmbArticulos").refresh();

                        LineasOfertaWindow.desbloqueaEventos()
                    }
                });
        }
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
                    $$('descripcion').setValue(row.nombre + ':\n' + row.descripcion);
                    $$('cantidad').setValue(1);
                    LineasOfertaWindow.recuperaCosteArticulo(articuloId);
                    LineasOfertaWindow.cambioTipoIva(row.tipoIvaId);
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
                    $$("cmbTiposIva").setValue(tipoIvaId);
                    $$("cmbTiposIva").refresh();
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
                        LineasOfertaWindow.calcularCosto();
                    } else {
                        let result = 0;
                        result = row.coste * datosCalculo.indiceCorrector;
                        $$('importeCliente').setValue(result);
                        LineasOfertaWindow.desbloqueaEventos();
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