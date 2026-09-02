import { JetView } from "webix-jet";
import { usuarioService } from "../services/usuario_service";
import { tiposProfesionalService } from "../services/tiposProfesional_service";
import { estadosService } from "../services/estados_service";
import { proveedoresService } from "../services/proveedores_service";
import { contactosExpedienteService } from "../services/contactosExpediente_service";
import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { propuestasService } from "../services/propuestas_service";
import { languageService } from "../locales/language_service";
import { lineasPropuesta } from "../subviews/lineasPropuestaGrid"
import { ofertasService } from "../services/ofertas_service";
import OfertasEpisReport from "./ofertasEpisReport";





var propuestaId = 0;
var usuarioId;
var usuario;
var subcontrataId = 0;
var expedienteId = 0;
var isLoading = false; // Variable de control
let self;
var propuesta = {};
var desdeAceptadas = null


export default class PropuestaForm extends JetView {
    config() {
        self = this;
        const _lineasPropuesta = lineasPropuesta.getGrid(self.app);

        const _view = {
            view: "layout",
            id: "propuestaForm",
            scroll: true,
            rows: [
                {
                    view: "toolbar", padding: 3, css: { "background-color": "#F4F5F9" }, elements: [
                        { view: "icon", icon: "mdi mdi-currency-eur", width: 37 },
                        { id: "labelPropuesta", view: "label", label: "Propuesta", maxWidth: 450 },
                        {
                            view: "template",
                            width: 50,
                            template: "<i class='fa-solid fa-link highlight-icon' title='Enviar propuesta por correo'></i>",
                            css: "icon-container",
                            onClick: {
                                "fa-solid": async function () {
                                    const root = this.$scope.app.getRoot(); // 🔹 root de la JetView
                                    webix.extend(root, webix.ProgressBar);
                                    root.showProgress({ type: "icon" });

                                    try {
                                        const result = await proveedoresService.getProveedor(propuesta.proveedorId);
                                        if (!result) {
                                            messageApi.errorMessage("No se encontró el proveedor");
                                            return;
                                        }

                                        if (!result.correo || result.correo.trim() === "") {
                                            messageApi.errorMessage("El proveedor no tiene correo electrónico.");
                                            return;
                                        }

                                        const action = await webix.confirm({
                                            title: "AVISO",
                                            text: "¿Se enviará un correo con la propuesta al profesional. ¿Está seguro?",
                                            type: "confirm-warning"
                                        });

                                        if (action) {
                                            let asunto = "Solicitud oferta " + propuestaId + " " + propuesta.nombreCliente;
                                            let data = {
                                                destinatario: result.correo,
                                                propuestaId: propuestaId,
                                                subcontrataId: subcontrataId,
                                                expedienteId: expedienteId,
                                                asunto: asunto,
                                                cuerpo: propuesta.plantillaCorreoArq,
                                                proveedorId: propuesta.proveedorId,
                                                esEncargo: true
                                            };

                                            const result2 = await proveedoresService.enviarCorreoProfesional(data);
                                            if (result2) {
                                                messageApi.normalMessage("Correo enviado correctamente.");
                                            } else {
                                                messageApi.errorMessage("No se pudo enviar el correo.");
                                            }
                                        }
                                    } catch (err) {
                                        messageApi.errorMessageAjax(err);
                                    } finally {
                                        root.hideProgress(); // ✅ siempre se oculta el spinner
                                    }
                                }
                            }
                        },

                        /*   {
                              view: "template",
                              id: "cartaEncargo",
                              width: 50,
                              template: "<i class='fa-solid fa-file-pdf  highlight-icon'  title='Enviar carta de encargo'></i>",
                              css: "icon-container",
                              onClick: {
                                  "fa-solid": () => {
                                      this.envioCartaDeEncargo()
                                  }
                              }
                          }, */
                        {
                            view: "template",
                            id: "documentacion",
                            width: 50,
                            template: "<i class='fa-solid fa-paper-plane  highlight-icon'  title='Enviar documentación'></i>",
                            css: "icon-container",
                            onClick: {
                                "fa-solid": () => {
                                    this.envioDocumentacion()
                                }
                            }
                        },
                        {
                            view: "template",
                            width: 50,
                            template: "<i class='fa-solid fa-puzzle-piece highlight-icon' title='Ir al expediente'></i>",
                            css: "icon-container",
                            onClick: {
                                "fa-solid": function () {
                                    this.$scope.show('/top/expedientesForm?expedienteId=' + expedienteId);
                                }
                            }
                        },

                        { minWidth: 100 }
                    ]
                },
                {
                    view: "form",
                    id: "frmPropuestas",
                    scroll: true,
                    elements: [
                        {
                            view: "toolbar", padding: 3, css: { "background-color": "#F4F5F9" }, elements: [
                                { view: "icon", icon: "mdi mdi-currency-eur", width: 37 },
                                { view: "label", label: "Datos" }
                            ]
                        },
                        {
                            responsive: true,
                            margin: 10,
                            cols: [
                                { view: "text", id: "propuestaId", name: "propuestaId", hidden: true },
                                {
                                    view: "datepicker", id: "fechaInicioPropuesta", name: "fechaInicio",
                                    label: "Fecha de inicio", labelPosition: "top", gravity: 1, required: true
                                },
                                {
                                    view: "combo",
                                    id: "cmbTiposProfesional",
                                    name: "tipoProfesionalId",
                                    required: true,
                                    options: {},
                                    label: "Profesión",
                                    labelPosition: "top",
                                    gravity: 1,
                                    on: {
                                        onChange: (newv) => {
                                            if (!isLoading) this.loadProfesionalesPorTipo(newv);
                                        }
                                    }
                                },
                                {
                                    view: "combo",
                                    id: "cmbProveedores",
                                    name: "proveedorId",
                                    required: true,
                                    options: {},
                                    label: "Profesional",
                                    labelPosition: "top",
                                    gravity: 2
                                },
                                {
                                    view: "text", type: "numeric", id: 'precioObjetivo', name: 'precioObjetivo',
                                    label: "Precio objetivo", labelPosition: "top", value: 0, gravity: 1, disabled: true,
                                    format: { edit: v => webix.Number.format(v, webix.i18n), parse: v => webix.Number.parse(v, webix.i18n) }
                                },
                                {
                                    view: "text", type: "numeric", id: 'diferencia', name: 'diferencia',
                                    label: "Diferencia", labelPosition: "top", value: 0, gravity: 1, disabled: true,
                                    format: { edit: v => webix.Number.format(v, webix.i18n), parse: v => webix.Number.parse(v, webix.i18n) }
                                },
                                {
                                    view: "text", type: "numeric", id: 'pvpNeto', name: 'pvpNeto',
                                    label: "PVP Neto", labelPosition: "top", value: 0, gravity: 1, disabled: true,
                                    format: { edit: v => webix.Number.format(v, webix.i18n), parse: v => webix.Number.parse(v, webix.i18n) }
                                },
                                {
                                    view: "text", type: "numeric", id: 'biNeto', name: 'biNeto',
                                    label: "BI Neto", labelPosition: "top", value: 0, gravity: 1, disabled: true,
                                    format: { edit: v => webix.Number.format(v, webix.i18n), parse: v => webix.Number.parse(v, webix.i18n) }
                                },
                                {
                                    view: "text", type: "numeric", id: 'porcenBiNeto', name: 'porcenBiNeto',
                                    label: "% BI Neto", labelPosition: "top", value: 0, gravity: 1, disabled: true,
                                    format: { edit: v => webix.Number.format(v, webix.i18n), parse: v => webix.Number.parse(v, webix.i18n) }
                                },
                                {
                                    view: "combo", id: "cmbOfertaganadora", name: "ofertaGanadora", required: true,
                                    label: "Oferta ganadora", labelPosition: "top", gravity: 1, options: {},
                                    on: {
                                        onChange: (newValue, oldValue) => {
                                            if (oldValue != '')
                                                if (newValue == 1) {
                                                    //comprovamos que no haya ya ganadoras
                                                    this.compruebaGanadoras(newValue)
                                                } else {
                                                    let dataganadora = {
                                                        propuestaId: propuestaId,
                                                        ofertaGanadora: 0,
                                                        lineas: null
                                                    }
                                                    propuestasService.putPropuesta(dataganadora)
                                                        .then(() => {
                                                        })
                                                        .catch((err) => {
                                                            messageApi.errorMessageAjax(err);
                                                        });
                                                }
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            responsive: true,
                            margin: 10,
                            cols: [
                                {
                                    view: "text", type: "numeric", id: 'plazoEjecucion', name: 'plazoEjecucion',
                                    label: "Plazo ejecución (días)", labelPosition: "top", value: 0, gravity: 1,
                                    format: { edit: v => webix.Number.format(v, webix.i18n), parse: v => webix.Number.parse(v, webix.i18n) }
                                },
                                {
                                    view: "text", type: "numeric", id: 'penalizacion', name: 'penalizacion',
                                    label: "Penalización", labelPosition: "top", value: 0, gravity: 1,
                                    format: { edit: v => webix.Number.format(v, webix.i18n), parse: v => webix.Number.parse(v, webix.i18n) }
                                },
                                {
                                    view: "text", type: "numeric", id: 'garantia', name: 'garantia',
                                    label: "Garantía en años", labelPosition: "top", value: 0, gravity: 1,
                                    format: { edit: v => webix.Number.format(v, webix.i18n), parse: v => webix.Number.parse(v, webix.i18n) }
                                },
                                {
                                    view: "text", type: "numeric", id: 'totalPropuesta', name: 'totalPropuesta',
                                    label: "Total propuesta", labelPosition: "top", value: 0, gravity: 1, disabled: true,
                                    format: { edit: v => webix.Number.format(v, webix.i18n), parse: v => webix.Number.parse(v, webix.i18n) }
                                },
                                {
                                    view: "datepicker", id: "fechaDocumentacion", name: "fechaDocumentacion",
                                    label: "Fecha documentación", labelPosition: "top", gravity: 1, required: true
                                },
                                {
                                    view: "label", label: "Prevalorada", width: 100, gravity: 1, on: {
                                        onAfterRender: function () {
                                            this.getNode().style.marginTop = "10px";
                                        }
                                    },
                                },
                                {
                                    view: "checkbox", id: "prevalorada", name: "prevalorada", gravity: 1, width: 50, on: {
                                        onAfterRender: function () {
                                            this.getNode().style.marginTop = "9px";
                                        },
                                        onChange: function (newValue, oldValue) {
                                            if (oldValue === '') return; //para que no salte al cargar el formulario
                                            lineasPropuesta.actualizarValores(newValue);
                                        }
                                    },
                                },
                            ]
                        },
                        {
                            cols: [
                                { rows: [_lineasPropuesta], gravity: 3 },
                                {
                                    rows: [
                                        { gravity: 1 },
                                        {
                                            paddingX: 50, align: "center",
                                            cols: [
                                                { view: "button", label: "Cancelar", css: "webix_danger", click: this.cancel },
                                                { view: "button", label: "Guardar", css: "webix_primary", click: () => this.accept(true), type: "form" }
                                            ]
                                        },
                                        {
                                            paddingX: 50, align: "center",
                                            cols: [
                                                { view: "button", label: "Imprimir hoja de encargo", id: "btnImprimir", type: "form" }
                                            ]
                                        },
                                        {
                                            paddingX: 50, align: "center",
                                            cols: [
                                                { view: "button", label: "Imprimir documentación", id: "btnImprimir2", css: "bt_3", type: "form" }
                                            ]
                                        },
                                        {
                                            paddingX: 50, align: "center",
                                            cols: [
                                                { view: "button", label: "Guardar sin salir", css: "bt_2", click: () => this.accept(false), type: "form" }
                                            ]
                                        },
                                        { gravity: 1 }
                                    ],
                                    maxWidth: 460
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        return _view;
    }
    init(view, url) {
        languageService.setLanguage(this.app, 'es');
        this.imprimirWindow = this.ui(OfertasEpisReport);
        $$('btnImprimir').attachEvent("onItemClick", function (id, e, node) {
            var rep = "hoja_encargo";
            var file = "/stireport/reports/" + rep + ".mrt";
            this.$scope.imprimirWindow.showWindow(null, propuestaId, file, false, false);

        });

        $$('btnImprimir2').attachEvent("onItemClick", function (id, e, node) {
            var rep = "subcontrata_encargo";
            var file = "/stireport/reports/" + rep + ".mrt";
            this.$scope.imprimirWindow.showWindow(subcontrataId, propuestaId, file, true, true);

        });
    }


    urlChange(view, url) {

        usuario = usuarioService.checkLoggedUser();
        usuarioId = usuario.usuarioId;
        languageService.setLanguage(this.app, 'es');
        propuestaId = null;
        subcontrataId = null;
        expedienteId = null;
        desdeAceptadas = null;

        if (url[0].params.propuestaId) {
            propuestaId = url[0].params.propuestaId;
        }
        if (url[0].params.subcontrataId) {
            subcontrataId = url[0].params.subcontrataId;
        }
        if (url[0].params.expedienteId) {
            expedienteId = url[0].params.expedienteId;
        }
        if (url[0].params.desdeAceptadas) {
            desdeAceptadas = url[0].params.desdeAceptadas;
        }
        this.load(propuestaId);
    }

    load(propuestaId) {
        //caso POST
        if (propuestaId == 0) {
            $$("fechaDocumentacion").setValue(new Date());//fecha por defecto
            $$("fechaInicioPropuesta").setValue(new Date());//fecha por defecto
            this.loadTiposProfesionales();
            this.loadProfesionales();
            this.loadOfertaganadora(0);
            this.loadLienasSubcontrataData();
            return;
        }
        //caso PUT
        isLoading = true; // Se activa el flag antes de cargar datos
        propuestasService.getPropuesta(propuestaId)
            .then((data) => {
                var label = "Propuesta Nº " + propuestaId + " de la subcontrata " + data.referencia;
                $$("labelPropuesta").define("label", label);
                $$("labelPropuesta").refresh();
                propuesta = this.formatData(data);
                $$("frmPropuestas").setValues(propuesta);
                $$("fechaDocumentacion").setValue(new Date(propuesta.fechaDocumentacion));
                $$("fechaInicioPropuesta").setValue(new Date(propuesta.fechaInicio));
                $$('prevalorada').setValue(propuesta.prevalorada);
                this.loadTiposProfesionales(propuesta.tipoProfesionalId);
                this.loadProfesionales(propuesta.proveedorId);
                this.loadOfertaganadora(propuesta.ofertaGanadora);
                if (propuesta.ofertaGanadora == 2) this.$$('documentacion').hide();
                propuestasService.getLineasPropuesta(propuestaId)
                    .then((data) => {
                        if (data) {
                            lineasPropuesta.loadGrid(propuestaId, subcontrataId, data);
                            isLoading = false;
                        }
                    })
                    .catch((err) => {
                        messageApi.errorMessageAjax(err);
                    });

            })
            .catch((err) => {
                messageApi.errorMessageAjax(err);
            });
    }


    cancel() {
        if (desdeAceptadas) {
            this.$scope.show('/top/expedientesForm?expedienteId=' + expedienteId + '&propuestaAceptadaId=' + propuestaId + '&desdeAceptadas=' + desdeAceptadas);
        } else {
            this.$scope.show('/top/propuestas?subcontrataId=' + subcontrataId + '&expedienteId=' + expedienteId + '&propuestaId=' + propuestaId);
        }
    }
    accept(opcion) {
        if (!$$("frmPropuestas").validate()) {
            messageApi.errorMessage("Debe rellenar los campos correctamente");
            return;
        }
        var data = $$("frmPropuestas").getValues();
        var datalineas = $$("lineasPropuestaGrid").serialize();
        if (propuestaId == 0) {
            data.propuestaId = 0;

            if (datalineas.length > 0) {
                data.lineas = this.limpiaDatalineas(datalineas);
            }

            propuestasService.postPropuesta(data, subcontrataId)
                .then((result) => {
                    this.show('/top/propuestaForm?propuestaId=' + result.propuestaId + '&subcontrataId=' + subcontrataId + '&expedienteId=' + expedienteId);
                    messageApi.normalMessage("Propuesta creada Correctamente")
                    return;
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
        } else {
            if (datalineas.length > 0) {
                data.lineas = this.limpiaDatalineas(datalineas);
            }
            delete data.titulo;
            delete data.tituloTexto;
            delete data.referencia;
            delete data.fechaOferta;
            delete data.clienteId;
            delete data.nombreCliente;
            delete data.empresaId;
            delete data.nombreEmpresa;
            delete data.plantillaCorreoArq;
            delete data.plantillaCorreoArqEncargo;
            delete data.datosAdicionales;
            propuestasService.putPropuesta(data)
                .then(() => {
                    if (opcion) {
                        if (desdeAceptadas) {
                            this.show('/top/expedientesForm?expedienteId=' + expedienteId + '&propuestaAceptadaId=' + data.propuestaId + '&desdeAceptadas=' + desdeAceptadas);
                        } else {
                            this.show('/top/propuestas?subcontrataId=' + subcontrataId + '&expedienteId=' + expedienteId + '&propuestaId=' + propuestaId);
                        }
                    } else {
                        this.show('/top/propuestaForm?propuestaId=' + data.propuestaId + "&subcontrataId=" + subcontrataId + '&expedienteId=' + expedienteId);
                    }

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
        }
    }

    limpiaDatalineas(lineas) {
        for (let l of lineas) {
            delete l.id;
            delete l.$height
            delete l.unidades;
            delete l.nombreGrupoArticulo;
            delete l.nombreArticulo;
            delete l.codigoReparacion;
            delete l.importeCliente;
        }
        return lineas;
    }


    loadEstados(estadoPropuestaId) {
        estadosService.getEstados()
            .then(rows => {
                var estados = generalApi.prepareDataForCombo('estadoPropuestaId', 'nombre', rows);
                var list = $$("cmbEstados").getPopup().getList();
                list.clearAll();
                list.parse(estados);
                if (estadoPropuestaId) {
                    $$("cmbEstados").setValue(estadoPropuestaId);
                    $$("cmbEstados").refresh();
                }
                return;
            });
    }

    loadTiposProfesionales(tipoProfesionalId) {
        tiposProfesionalService.getTiposProfesional()
            .then(rows => {
                var tiposProfesionales = generalApi.prepareDataForCombo('tipoProfesionalId', 'nombre', rows);
                var list = $$("cmbTiposProfesional").getPopup().getList();
                list.clearAll();
                list.parse(tiposProfesionales);
                if (tipoProfesionalId) {
                    $$("cmbTiposProfesional").setValue(tipoProfesionalId);
                    $$("cmbTiposProfesional").refresh();
                }
            });
    }

    loadProfesionales(profesionalId) {
        proveedoresService.getProveedores()
            .then(rows => {
                var profesionales = generalApi.prepareDataForCombo('proveedorId', 'nombre', rows);
                var list = $$("cmbProveedores").getPopup().getList();
                list.clearAll();
                list.parse(profesionales);
                if (profesionalId) {
                    $$("cmbProveedores").setValue(profesionalId);
                    $$("cmbProveedores").refresh();
                }
            });
    }


    loadProfesionalesPorTipo(tipoProfesionalId) {
        /* let fecha =  new Date();
        let yyyy = fecha.getFullYear();
        let mm = String(fecha.getMonth() + 1).padStart(2, '0');
        let dd = String(fecha.getDate()).padStart(2, '0');
        let fechaFormateada = `${yyyy}-${mm}-${dd}`; */
        proveedoresService.getProveedoresPorTipo(tipoProfesionalId)
            .then(rows => {
                var profesionales = generalApi.prepareDataForCombo('proveedorId', 'nombre', rows);
                var list = $$("cmbProveedores").getPopup().getList();
                list.clearAll();
                list.parse(profesionales);
                $$("cmbProveedores").setValue(null);
                $$("cmbProveedores").refresh();
            });
    }

    loadOfertaganadora(ofertaganadoraId) {
        if (ofertaganadoraId == 0) ofertaganadoraId = 2
        var rows = [
            {
                ofertaGanadora: 2,
                nombre: "NO"
            },
            {
                ofertaGanadora: 1,
                nombre: "SI"
            }
        ]
        var ganadoras = generalApi.prepareDataForCombo('ofertaGanadora', 'nombre', rows);
        var list = $$("cmbOfertaganadora").getPopup().getList();
        list.clearAll();
        list.parse(ganadoras);
        $$("cmbOfertaganadora").setValue(ofertaganadoraId);
        $$("cmbOfertaganadora").refresh();
    }

    formatData(data) {
        if (!data.precioObjetivo) data.precioObjetivo = 0;
        if (!data.diferencia) data.diferencia = 0;
        if (!data.pvpNeto) data.pvpNeto = 0;
        if (!data.biNeto) data.biNeto = 0;
        if (!data.plazoEjecucion) data.plazoEjecucion = 0;
        if (!data.penalizacion) data.penalizacion = 0;
        if (!data.totalPropuesta) data.totalPropuesta = 0
        if (!data.garantia) data.garantia = 0;

        return data;
    }

    loadLienasSubcontrataData() {
        if (!subcontrataId) return
        ofertasService.getLineasOfertaSubcontrata(subcontrataId)
            .then((rows) => {
                if (rows.length == 0) {
                    messageApi.errorMessage("El presupuesto de subcontrata seleccionado no tiene partidas.");
                    lineasPropuesta.loadGrid(propuestaId, subcontrataId, rows)
                    return;
                }
                $$('pvpNeto').setValue(rows[0].importeCliente * 0.9)
                lineasPropuesta.loadGrid(propuestaId, subcontrataId, rows);
            })
            .catch((err) => {
                messageApi.errorMessageAjax(err);
            })
    }

    async envioCartaDeEncargo() {
        const action = await webix.confirm({
            title: "AVISO",
            text: "¿Desea enviar por correo la carta de encargo al profesional?",
            type: "confirm-warning"
        });

        if (action) {
            const root = this.app.getRoot();
            webix.extend(root, webix.ProgressBar);
            root.showProgress({ type: "icon" });

            try {
                const result = await proveedoresService.getProveedor(propuesta.proveedorId);
                if (!result) throw new Error("No se encontró el proveedor");
                if (!result.correo || result.correo.trim() === "") {
                    messageApi.errorMessage("El proveedor no tiene correo electrónico.");
                    return;
                }

                let asunto = "Hoja de encargo " + propuestaId + " " + propuesta.nombreCliente;
                let data = {
                    destinatario: result.correo,
                    propuestaId: propuestaId,
                    subcontrataId: subcontrataId,
                    expedienteId: expedienteId,
                    asunto: asunto,
                    cuerpo: propuesta.plantillaCorreoArqEncargo,
                    proveedorId: propuesta.proveedorId,
                    esEncargo: true
                };

                const result2 = await proveedoresService.enviarCorreoProfesional(data);
                if (result2) {
                    messageApi.normalMessage("Correo enviado correctamente.");
                } else {
                    messageApi.errorMessage("No se pudo enviar el correo.");
                }
            } catch (err) {
                messageApi.errorMessageAjax(err);
            } finally {
                root.hideProgress(); // ✅ siempre se oculta el spinner
            }
        }
    }


    async envioDocumentacion() {
        const action = await webix.confirm({
            title: "AVISO",
            text: "¿Desea enviar por correo la documentacion al profesional?",
            type: "confirm-warning"
        });

        if (action) {
            const root = this.app.getRoot();
            webix.extend(root, webix.ProgressBar);
            root.showProgress({ type: "icon" });

            try {
                let r = [];
                const proveedor = await proveedoresService.getProveedor(propuesta.proveedorId);
                console.debug("Proveedor recibido:", proveedor);
                if (!proveedor) throw new Error("No se encontró el proveedor");

                let contactos = await contactosExpedienteService.getContactosExpediente(expedienteId);
                if (contactos && contactos.length > 0) {
                    for (let c of contactos) {
                        let objContactos = {
                            contacto: c.contactoNombre || '',
                            telefono1: c.telefono1 || '',
                            telefono2: c.telefono2 || '',
                            email: c.correo || '',
                            observaciones: c.observaciones || ''
                        };
                        r.push(objContactos);
                    }
                }

                if (!proveedor.correo || proveedor.correo.trim() === "") {
                    messageApi.errorMessage("El proveedor no tiene correo electrónico.");
                    return;
                }


                const asunto = "Documentación de la propuesta " + propuestaId + " " + propuesta.nombreCliente;
                let data = {

                    destinatario: proveedor.correo,
                    propuestaId: propuestaId,
                    subcontrataId: subcontrataId,
                    expedienteId: expedienteId,
                    asunto: asunto,
                    cuerpo: propuesta.plantillaCorreoArqEncargo,
                    proveedorId: propuesta.proveedorId,
                    contactos: r,
                    datosAdicionales: propuesta.datosAdicionales,
                    esEncargo: false

                }

                const result2 = await proveedoresService.enviarCorreoProfesional(data);
                if (result2 === "Correo enviado") {
                    messageApi.normalMessage("Correo enviado correctamente.");
                } else {
                    messageApi.errorMessage("No se pudo enviar el correo.");
                }
            } catch (err) {
                messageApi.errorMessageAjax(err);
            } finally {
                root.hideProgress(); // ✅ siempre se oculta
            }
        }
    }

    compruebaGanadoras(esGanadora) {
        if (!subcontrataId) return
        propuestasService.getPropuestasSubcontrata(subcontrataId, esGanadora, propuestaId)
            .then((data) => {
                if (data.length > 0) {
                    messageApi.errorMessage("Ya existe una oferta ganadora");
                    $$('cmbOfertaganadora').setValue(2);
                    $$("cmbOfertaganadora").refresh();
                } else {
                    this.actualizaSubcontrataLineas();
                    //this.envioDocumentacion();
                }
            })
            .catch((err) => {
                messageApi.errorMessageAjax(err);
            });
    }

    actualizaSubcontrataLineas() {
        let correcto = true
        let arr = [];
        let dataganadora = {};
        webix.confirm({
            title: "AVISO",
            text: "¿Se modificarán las partidas de la subcontrata con los precios de la propuesta. ¿Desea continuar?",
            type: "confirm-warning",
            callback: (action) => {
                if (action === true) {
                    dataganadora = {
                        propuestaId: propuestaId,
                        ofertaGanadora: 1,
                        lineas: null
                    }
                    propuestasService.putPropuesta(dataganadora)
                        .then(() => {
                            //actulizamos las lineas de la subcontrata con los nuevos importes
                            propuestasService.getLineasPropuesta(propuestaId)
                                .then((data) => {
                                    if (data) {
                                        let obj = []
                                        if (data.length == 0) {
                                            messageApi.errorMessage("No hay líneas en la propuesta");
                                            return;
                                        } else {
                                            for (let d of data) {
                                                let datos = {
                                                    ofertaId: subcontrataId,
                                                    ofertaLineaId: d.ofertaSubcontratalineaId,
                                                    importe: d.propuestaImporte,
                                                    totalLinea: d.propuestaTotalLinea,
                                                    coste: d.propuestaTotalLinea,
                                                    precio: d.propuestaTotalLinea

                                                }
                                                ofertasService.putLineaOfertaSubcontrata(datos, d.ofertaSubcontratalineaId)
                                                    .then((data) => {
                                                        if (data) {


                                                        }
                                                    })
                                                    .catch((err) => {
                                                        messageApi.errorMessageAjax(err);
                                                    });
                                            }
                                            messageApi.normalMessage("Partidas de la subcontrata actualizadas correctamente");
                                            this.envioDocumentacion();
                                        }
                                    }
                                })
                                .catch((err) => {
                                    messageApi.errorMessageAjax(err);
                                });


                        })
                        .catch((err) => {
                            messageApi.errorMessageAjax(err);
                        });
                } else {
                    $$('cmbOfertaganadora').setValue(2);
                    $$("cmbOfertaganadora").refresh();
                }
            }
        });
    }


}