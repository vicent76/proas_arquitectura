import { JetView } from "webix-jet";
import { usuarioService } from "../services/usuario_service";
import { tiposProfesionalService } from "../services/tiposProfesional_service";
import { estadosService } from "../services/estados_service";
import { proveedoresService } from "../services/proveedores_service";
import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { propuestasService } from "../services/propuestas_service";
import { languageService} from "../locales/language_service";
import { lineasPropuesta } from "../subviews/lineasPropuestaGrid"
import { ofertasService } from "../services/ofertas_service";





var propuestaId = 0;
var usuarioId;
var usuario;
var subcontrataId = 0;
var expedienteId = 0;
var limiteCredito = 0;
var importeCobro = 0;
var desdeCoste = null;
var desdeVenta = null;
var desdeSubcontrata = null;
var isLoading = false; // Variable de control
var formaPagoId = null;
let self;
var propuesta = {};
var selectOfertaVentaId = null;
var selectOfertaCosteId = null;
var selectOfertaSubcontrataId = null;


export default class PropuestaForm extends JetView {
    config() {
        self = this;
        const _lineasPropuesta = lineasPropuesta.getGrid(self.app); 
        const _view = {
            view: "tabview",
            id: "tabViewPropuesta",
            cells: [
                {
                    header:  "Datos",
                    width: 100,
                    body: {
                        //solapa Propuestas
                        view: "layout",
                        id: "propuestaForm",
                        multiview: true,
                        rows: [
                            {
                                view: "toolbar", padding: 3, css: {"background-color": "#F4F5F9"}, elements: [
                                    { view: "icon", icon: "mdi mdi-currency-eur", width: 37, align: "left" },
                                    { view: "label", label: "Propuesta" }
                                ]
                            },
                            {
                                view: "form",
                                scroll:"y",
                                id: "frmPropuestas",
                                maxWidth: 2500,
                                autoheight:true,
                                elements: [
                                    {
                                        view: "toolbar", padding: 3, css: {"background-color": "#F4F5F9"}, elements: [
                                            { view: "icon", icon: "mdi mdi-currency-eur", width: 37, align: "left" },
                                            { view: "label", label: "Datos" }
                                        ]
                                    },
                                    {
                                        cols: [
                                            {
                                                view: "text", id: "propuestaId", name: "propuestaId", hidden: true,
                                                label: "ID", labelPosition: "top", width: 100, disabled: true
                                            },
                                            {
                                                view: "combo", id: "cmbTiposProfesional", name: "tipoProfresionalId", required: true, options: {},
                                                label: "Profesión", labelPosition: "top", minWidth: 280
                                            },
                                            {
                                                view: "combo", id: "cmbProveedores", name: "proveedorId", required: true, options: {},
                                                label: "Profesional", labelPosition: "top", minWidth: 400
                                            },
                                            {
                                                view: "text", type: "numeric",  id: 'precioObjetivo', name: 'precioObjetivo',
                                                label: "Precio objetivo", labelPosition: "top", value: 0, width: 150, disabled: true,
                                                format: {
                                                    edit : function(v){ return webix.Number.format(v, webix.i18n); },
                                                    parse : function(v){ return webix.Number.parse(v, webix.i18n); }
                                                  }
                                            },
                                            {
                                                view: "text", type: "numeric",  id: 'diferencia', name: 'diferencia',
                                                label: "Diferencia", labelPosition: "top", value: 0 , width: 150, disabled: true,
                                                format: {
                                                    edit : function(v){ return webix.Number.format(v, webix.i18n); },
                                                    parse : function(v){ return webix.Number.parse(v, webix.i18n); }
                                                  }
                                            },
                                            {
                                                view: "text", type: "numeric",  id: 'pvpNeto', name: 'pvpNeto',
                                                label: "PVP Neto", labelPosition: "top", value: 0 , width: 150,
                                                format: {
                                                    edit : function(v){ return webix.Number.format(v, webix.i18n); },
                                                    parse : function(v){ return webix.Number.parse(v, webix.i18n); }
                                                  }
                                            },
                                            {
                                                view: "text", type: "numeric",  id: 'biNeto', name: 'biNeto', disabled: true,
                                                label: "% BI Neto", labelPosition: "top", value: 0 , width: 150,
                                                format: {
                                                    edit : function(v){ return webix.Number.format(v, webix.i18n); },
                                                    parse : function(v){ return webix.Number.parse(v, webix.i18n); }
                                                  }
                                            },
                                            {
                                                view: "combo", id: "cmbOfertaganadora", name: "ofertaGanadora",required: true, maxWidth:150,
                                                label: "Oferta ganadora", labelPosition: "top", options:{}
                                            }
                                        ]
                                    },
                                    {
                                        cols: [
                                           
                                            {
                                                view: "text", type: "numeric",  id: 'plazoEjecucion', name: 'plazoEjecucion',
                                                label: "Plazo ejecucion (días)", labelPosition: "top", value: 0 ,
                                                format: {
                                                    edit : function(v){ return webix.Number.format(v, webix.i18n); },
                                                    parse : function(v){ return webix.Number.parse(v, webix.i18n); }
                                                  }
                                            },
                                            {
                                                view: "text", type: "numeric",  id: 'penalizacion', name: 'penalizacion',
                                                label: "Penalización", labelPosition: "top", value: 0 ,
                                                format: {
                                                    edit : function(v){ return webix.Number.format(v, webix.i18n); },
                                                    parse : function(v){ return webix.Number.parse(v, webix.i18n); }
                                                  }
                                            },
                                            {
                                                view: "text", type: "numeric",  id: 'garantia', name: 'garantia',
                                                label: "Garantia en años", labelPosition: "top", value: 0 ,
                                                format: {
                                                    edit : function(v){ return webix.Number.format(v, webix.i18n); },
                                                    parse : function(v){ return webix.Number.parse(v, webix.i18n); }
                                                  }
                                            },
                                            {
                                                view: "text", type: "numeric",  id: 'totalPropuesta', name: 'totalPropuesta',
                                                label: "Total propuesta", labelPosition: "top", value: 0 , disabled: true,
                                                format: {
                                                    edit : function(v){ return webix.Number.format(v, webix.i18n); },
                                                    parse : function(v){ return webix.Number.parse(v, webix.i18n); }
                                                  }
                                            },
                                            {
                                                view: "datepicker", id: "fechaDocumentacion", name: "fechaDocumentacion",  maxWidth: 150,
                                                label: "Fecha documentación", labelPosition: "top", required: true
                                            },
                                        ]
                                    }, 
                                   
                                  
                                    {
                                        cols: [
                                            _lineasPropuesta,
                                            {
                                                maxWidth: 400,
                                            },
                                            {   width: 450,
                                                rows: [
                                                    { gravity: 1 },
                                                    {
                                                        paddingX: 50,
                                                        align: "center",
                                                        cols: [
                                                            { view: "button", label: "Cancelar", css: "webix_danger", click: this.cancel },
                                                            { view: "button", label: "Guardar", click: () => this.accept(true), css: "webix_primary", type: "form" }
                                                        ]
                                                    },
                                                    {
                                                        paddingX: 50,
                                                        align: "center",
                                                        cols: [
                                                            { view: "button", label: "Guardar sin salir", click: () => this.accept(false), type: "form" }
                                                        ]
                                                    },
                                                    { gravity: 1 }
                                                ]
                                            }
                                            
                                            
                                        ]
                                    },
                                ]
                            },
                            
                           
                           
                        ],
                        scroll:true
                    }
                },
                
    ]
        }
        return _view;
    }
    init(view, url) {
        this.cargarEventos();
        languageService.setLanguage(this.app, 'es');
        
    }

       
    urlChange(view, url) {
        
        usuario = usuarioService.checkLoggedUser();
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
        
        //this.cargarEventos();
        this.load(propuestaId);
    }

    load(propuestaId) {
        //caso POST
        if (propuestaId == 0) {
            $$("fechaDocumentacion").setValue(new Date());//fecha por defecto
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
                propuesta = this.formatData(data);
                $$("frmPropuestas").setValues(propuesta);
                $$("fechaDocumentacion").setValue(new Date(propuesta.fechaDocumentacion));
                this.loadTiposProfesionales(propuesta.tipoProfresionalId);
                this.loadProfesionales(propuesta.proveedorId);
                this.loadOfertaganadora(propuesta.ofertaGanadora);
                propuestasService.getLineasPropuesta(propuestaId)
                .then(( data) => {
                    if(data)  lineasPropuesta.loadGrid(propuestaId, subcontrataId, data);
                })
                .catch((err) => {
                    messageApi.errorMessageAjax(err);
                }); 
                
            })
            .catch((err) => {
                messageApi.errorMessageAjax(err);
            }); 
    }

    cargarEventos() {
        
    }

    cancel() {
        this.$scope.show('/top/propuestas?subcontrataId=' + subcontrataId + '&expedienteId=' + expedienteId + '&propuestaId=' + propuestaId);
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

            if(datalineas.length > 0) {
                data.lineas = this.limpiaDatalineas(datalineas);
            }
          
            propuestasService.postPropuesta(data, subcontrataId)
                .then((result) => {
                    this.show('/top/propuestaForm?propuestaId=' + result.propuestaId + '&expedienteId=' + expedienteId);
                    messageApi.normalMessage("Propuesta creada Correctamente")
                    return;
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
            if(datalineas.length > 0) {
                data.lineas = this.limpiaDatalineas(datalineas);
            }
            delete data.titulo;
            propuestasService.putPropuesta(data)
                .then(() => {
                    if(opcion) {
                        this.show('/top/propuestas?subcontrataId=' + subcontrataId + '&expedienteId=' + expedienteId + '&propuestaId=' + propuestaId);
                    } else {
                        this.show('/top/propuestaForm?propuestaId=' + data.propuestaId + "&subcontrataId=" + subcontrataId + '&expedienteId=' + expedienteId);
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
        }
    }

    limpiaDatalineas(lineas) {
        for(let l of lineas) { 
                delete l.id;
                delete l.$height
                delete l.unidades;
                delete l.nombreGrupoArticulo;
                delete l.nombreArticulo;
                delete l.codigoReparacion;
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
            if(estadoPropuestaId) { 
                $$("cmbEstados").setValue(estadoPropuestaId);
                $$("cmbEstados").refresh();
            }
            return;
        });
    }

    loadTiposProfesionales(tipoProfresionalId) {
        tiposProfesionalService.getTiposProfesional()
        .then(rows => {
            var tiposProfesionales = generalApi.prepareDataForCombo('tipoProfesionalId', 'nombre', rows);
            var list = $$("cmbTiposProfesional").getPopup().getList();
            list.clearAll();
            list.parse(tiposProfesionales);
            if(tipoProfresionalId) { 
                $$("cmbTiposProfesional").setValue(tipoProfresionalId);
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
            if(profesionalId) { 
                $$("cmbProveedores").setValue(profesionalId);
                $$("cmbProveedores").refresh();
            }
        });
    }

    loadOfertaganadora(ofertaganadoraId) {
        if(ofertaganadoraId == 0) ofertaganadoraId = 2
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
        if(!data.precioObjetivo) data.precioObjetivo = 0; 
        if(!data.diferencia) data.diferencia = 0;
        if(!data.pvpNeto) data.pvpNeto = 0;
        if(!data.biNeto) data.biNeto = 0;
        if(!data.plazoEjecucion) data.plazoEjecucion = 0;
        if(!data.penalizacion) data.penalizacion = 0;
        if(!data.totalPropuesta) data.totalPropuesta = 0
        if(!data.garantia) data.garantia = 0;

        return data;
    }

        loadLienasSubcontrataData() {
            if(!subcontrataId) return
            ofertasService.getLineasOfertaSubcontrata(subcontrataId)
            .then( (rows) => {
                if(rows.length == 0) {
                    messageApi.errorMessage("El presupuesto de subcontrata seleccionado no tiene partidas.");
                    lineasPropuesta.loadGrid(propuestaId, subcontrataId, rows)
                    return;
                }
                lineasPropuesta.loadGrid(propuestaId, subcontrataId, rows);
            })
            .catch( (err) => {
                messageApi.errorMessageAjax(err);
            })
        }


}