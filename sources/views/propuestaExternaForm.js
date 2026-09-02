import { JetView } from "webix-jet";
import { usuarioService } from "../services/usuario_service";
import { tiposProfesionalService } from "../services/tiposProfesional_service";
import { estadosService } from "../services/estados_service";
import { proveedoresService } from "../services/proveedores_service";
import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { propuestasService } from "../services/propuestas_service";
import { languageService } from "../locales/language_service";
import { lineasPropuesta } from "../subviews/lineasPropuestaGrid"
import { ofertasService } from "../services/ofertas_service";






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
                                    view: "combo",
                                    id: "cmbProveedores",
                                    name: "proveedorId",
                                    required: true,
                                    options: {},
                                    label: "Profesional",
                                    labelPosition: "top",
                                    gravity: 2,
                                    disabled: true
                                },
                                {
                                    view: "text", type: "numeric", id: 'plazoEjecucion', name: 'plazoEjecucion',
                                    label: "Plazo ejecución (días)", labelPosition: "top", value: 0, gravity: 1,
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
                                }
                            ]
                        },
                        {
                            responsive: true,
                            margin: 10,
                            cols: [
                                {
                                    view: "text", type: "numeric", id: 'precioObjetivo', name: 'precioObjetivo',
                                    label: "Precio objetivo", labelPosition: "top", value: 0, gravity: 1, disabled: true, hidden: true,
                                    format: { edit: v => webix.Number.format(v, webix.i18n), parse: v => webix.Number.parse(v, webix.i18n) }
                                },
                                {
                                    view: "text", type: "numeric", id: 'diferencia', name: 'diferencia',
                                    label: "Diferencia", labelPosition: "top", value: 0, gravity: 1, disabled: true, hidden: true,
                                    format: { edit: v => webix.Number.format(v, webix.i18n), parse: v => webix.Number.parse(v, webix.i18n) }
                                },
                                {
                                    view: "text", type: "numeric", id: 'pvpNeto', name: 'pvpNeto',
                                    label: "PVP Neto", labelPosition: "top", value: 0, gravity: 1, disabled: true, hidden: true,
                                    format: { edit: v => webix.Number.format(v, webix.i18n), parse: v => webix.Number.parse(v, webix.i18n) }
                                },
                                {
                                    view: "text", type: "numeric", id: 'biNeto', name: 'biNeto',
                                    label: "BI Neto", labelPosition: "top", value: 0, gravity: 1, disabled: true, hidden: true,
                                    format: { edit: v => webix.Number.format(v, webix.i18n), parse: v => webix.Number.parse(v, webix.i18n) }
                                },
                                {
                                    view: "text", type: "numeric", id: 'porcenBiNeto', name: 'porcenBiNeto',
                                    label: "% BI Neto", labelPosition: "top", value: 0, gravity: 1, disabled: true, hidden: true,
                                    format: { edit: v => webix.Number.format(v, webix.i18n), parse: v => webix.Number.parse(v, webix.i18n) }
                                },

                                {
                                    view: "datepicker", id: "fechaDocumentacion", name: "fechaDocumentacion", hidden: true,
                                    label: "Fecha documentación", labelPosition: "top", gravity: 1, required: true
                                }
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
                                                { view: "button", label: "Enviar", css: "webix_primary", click: () => this.accept(), type: "form" }
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
    }


    urlChange(view, url) {

        usuario = usuarioService.checkLoggedUserExterno();
        usuarioId = usuario.usuarioId;
        languageService.setLanguage(this.app, 'es');

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
            //this.loadTiposProfesionales();
            this.loadProfesionales();
            //this.loadOfertaganadora(0);
            this.loadLienasSubcontrataData();
            return;
        }
        //caso PUT
        isLoading = true; // Se activa el flag antes de cargar datos
        propuestasService.getPropuesta(propuestaId)
            .then((data) => {
                var label = "Propuesta Nº " + propuestaId + " -- " + data.nombreCliente;
                $$("labelPropuesta").define("label", label);
                $$("labelPropuesta").refresh();
                propuesta = this.formatData(data);
                $$("frmPropuestas").setValues(propuesta);
                $$("fechaDocumentacion").setValue(new Date(propuesta.fechaDocumentacion));
                //this.loadTiposProfesionales(propuesta.tipoProfesionalId);
                this.loadProfesionales(propuesta.proveedorId);
                //this.loadOfertaganadora(propuesta.ofertaGanadora);
                propuestasService.getLineasPropuesta(propuestaId)
                    .then((data) => {
                        if (data) {
                            lineasPropuesta.loadGrid(propuestaId, subcontrataId, data, true);
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


    accept() {
        if (!$$("frmPropuestas").validate()) {
            messageApi.errorMessage("Debe rellenar los campos correctamente");
            return;
        }
        webix.confirm({
            title: "AVISO",
            text: "Se enviará un correo a administración con la propuesta. ¿Está seguro?",
            type: "confirm-warning",
            callback: (action) => {
                if (action === true) {
                    var data = $$("frmPropuestas").getValues();
                    var datalineas = $$("lineasPropuestaGrid").serialize();
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
                    delete data.contacto1;
                    delete data.contacto2;
                    delete data.telefono1;
                    delete data.telefono2;
                    delete data.fechaInicio;
                    delete data.datosAdicionales;
                    let asunto = "Propuesta Nº " + propuestaId + " enviada --  " + propuesta.nombreCliente;
                    let correo = {
                        propuestaId: propuestaId,
                        subcontrataId: subcontrataId,
                        expedienteId: expedienteId,
                        asunto: asunto,
                        cuerpo: propuesta.plantillaCorreoArq,
                        proveedorId: propuesta.proveedorId,
                        proveedorNombre: $$('cmbProveedores').getText()
                    }
                    propuestasService.putPropuestaCorreo(data, correo)
                        .then((result) => {
                            if (result) {
                                messageApi.normalMessage("Propusta guardada correctamente. se ha enviado un correo a administración.");
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
        });
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


}