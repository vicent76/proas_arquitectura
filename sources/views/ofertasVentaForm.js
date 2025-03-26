import { JetView } from "webix-jet";
import { usuarioService } from "../services/usuario_service";
import { clientesService } from "../services/clientes_service";
import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { ofertasService } from "../services/ofertas_service";
import { tiposProyectoService } from "../services/tipos_proyecto_service"
import { languageService} from "../locales/language_service";
import { empresasService } from "../services/empresas_service";
import { lineasOfertaVenta } from "../subviews/lineasOfertaVentaGrid";
import OfertasEpisReport  from "./ofertasEpisReport";
import { expedientesService } from "../services/expedientes_service";
import { parametrosService } from "../services/parametros_service";



var ofertaId = 0;
var expedienteId = 0;
var usuarioId;
var usuario;
var limiteCredito = 0;
var importeCobro = 0;
var _imprimirWindow;
var cliId = null;
var cap = null;
var indiceCorrector = 0;
var limiteImpObra = 0;
var porcen1 = 0;
var porcen2 = 0;
var porcen3 = 0;
var porcen4 = 0;
var importeObra = 0;
var tipoProyectoId

export default class OfertasVentaForm extends JetView {
    config() {
        const translate = this.app.getService("locale")._;
        const _lineasOferta = lineasOfertaVenta.getGrid(this.app);       
        const _view = {
            view: "tabview",
            cells: [
                {
                    header:  "Oferta",
                    body: {
                        //solapa ofertas
                        view: "layout",
                        id: "ofertasVentaForm",
                        multiview: true,
                        rows: [
                            {
                                view: "toolbar", padding: 3, elements: [
                                    { view: "icon", icon: "mdi mdi-currency-eur", width: 37, align: "left" },
                                    { view: "label", label: "Oferta de venta" }
                                ]
                            },
                            {
                                view: "form",
                                scroll:"y",
                                id: "frmOfertas",
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
                                                view: "text", id: "ofertaId", name: "ofertaId", hidden: true,
                                                label: "ID", labelPosition: "top", width: 50, disabled: true
                                            },
                                            {
                                                view: "text", id: "referencia", name: "referencia", required: true,
                                                label: "Referencia", labelPosition: "top", width:250
                                            },
                                            {
                                                view: "combo", id: "cmbEmpresas", name: "empresaId", required: true, options: {},
                                                label: "Empresa", labelPosition: "top", width: 250
                                            },
                                            {
                                                view: "datepicker", id: "fechaOferta", name: "fechaOferta",  width: 150,
                                                label: "Fecha de Solicitud", labelPosition: "top", required: true
                                            },
                                          /*   {
                                                view: "combo", id: "cmbTiposProyecto", name: "tipoProyectoId",required: true, 
                                                label: "Tipo proyecto", labelPosition: "top", options:{}
                                            }, */
                                            {
                                                view: "combo", id: "cmbExpedientes", name: "expedienteId", disabled: true, 
                                                label: "Expediente", labelPosition: "top", options:{}
                                            }
                                        ]
                                    },
                                    {
                                        cols: [
                                              {
                                                view: "combo", id: "cmbClientes", name: "clienteId", required: true, minWidth:300,
                                                label: "Cliente", labelPosition: "top",
                                                options:{},
                                                on: {
                                                    onTimedKeyPress: function() {
                                                        var input = $$('cmbClientes').getText(); // Obtiene el valor actual del campo de texto
                                                        if (input.length >= 3) {
                                                            // Llama a la función para buscar coincidencias en la base de datos
                                                            this.buscaClientesActivos(input);
                                                        }
                                                        if(input === "*") {
                                                            this.buscaClientesActivos(input);
                                                        }
                                                    }.bind(this)
                                                }
                                            },
                                            {
                                                view: "text", id: 'importeCli', name: 'importeCliente', disabled: true, width: 180,
                                                label: "Importe cliente", labelPosition: "top", value: 0 ,format: "1,00"
                                                 
                                            },
                                        
                                                    
                                        ]
                                    },
                                    {
                                        cols: [
                                            {
                                                view: "combo", id: "cmbPresupuestosCoste", name: "presupuestoCosteId", 
                                                label: "Coste", labelPosition: "top", options:{},
                                                on: {
                                                    "onChange": (newv, oldv) => {
                                                        var id = newv;
                                                        this.loadLienasCosteData(id);
                                                    }
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        cols: [
                                           
                                            {
                                                view: "textarea", id: "observaciones", name: "observaciones",
                                                label: "Observaciones", labelPosition: "top", height: 140
                    
                                            },
                                            {
                                                rows: [
                                                    {
                                                        padding: 50,cols: [
                                                            { view: "button", label: "Cancelar", click: this.cancel, hotkey: "esc" },
                                                            { view: "button", label: "Aceptar", click: this.accept, type: "form" }
                                                        ]
                                                    }
                                                ]
                                            },
                                        ]
                                    },    
                                    _lineasOferta,
                                    { minWidth : 100},
                                   /*  _basesOferta */
                                ]
                            },
                            
                           
                           
                        ],
                        scroll:true
                    }
                }
    ]
        }
        return _view;
    }
    init(view, url) {
        _imprimirWindow = this.ui(OfertasEpisReport);
        this.cargarEventos();
    }
    
       
    urlChange(view, url) {
        if (url[0].params.NEW) {
            messageApi.normalMessage('Oferta correctamente, puede crear ahora las  lineas asociadas.')
        }
        usuario = usuarioService.checkLoggedUser();
        usuarioId = usuario.usuarioId;
        languageService.setLanguage(this.app, 'es');
        if (url[0].params.ofertaId) {
            ofertaId = url[0].params.ofertaId;
        }
        if (url[0].params.expedienteId) {
            expedienteId = url[0].params.expedienteId;
        }
        if (url[0].params.importeObra) {
            importeObra = parseFloat(url[0].params.importeObra);
        }
        this.cargarEventos();
        this.load(ofertaId, expedienteId);
    }
    load(ofertaId, expedienteId) {
        //PRIMERO RECUPERAMOS EL INDICE CORRECTOR
        parametrosService.getParametros()
        .then((parametros) => {
            if(parametros && parametros[0].indiceCorrector) indiceCorrector = parametros[0].indiceCorrector;
            if (ofertaId == 0 && expedienteId > 0) {
                expedientesService.getExpediente(expedienteId)
                .then((expediente) => {
                    tipoProyectoId = expediente.tipoProyectoId
                    this.loadEmpresas(expediente.empresaId);
                    this.loadExpediente(expediente);
                    this.loadPresupuestosCoste(expedienteId, null);
                    this.loadClientes(expediente.clienteId);
                    $$("fechaOferta").setValue(new Date(expediente.fecha));//fecha por defecto
                    this.$$("referencia").setValue(expediente.referencia);
                    lineasOfertaVenta.loadGrid(null, null, []);
                    //basesOferta.loadGrid(null); 
                })
                .catch((err) => {
                    messageApi.errorMessageAjax(err);
                }); 
                return;
            }
            ofertasService.getOferta(ofertaId)
                .then((oferta) => {
                    //$$("cmbTiposProyecto").blockEvent();
                    delete oferta.empresa;
                    delete oferta.cliente;
                    delete oferta.tipo;
                    delete oferta.mantenedor;
                    delete oferta.agente;
                    delete oferta.formaPago
                    oferta.fechaOferta = new Date(oferta.fechaOferta);
                    $$("frmOfertas").setValues(oferta);
                    this.loadEmpresas(oferta.empresaId);
                    lineasOfertaVenta.loadGrid(oferta.ofertaId, _imprimirWindow, []);
                    this.loadPresupuestosCoste(expedienteId, oferta.ofertaCosteId);
                    this.loadClientes(oferta.clienteId);
                    //basesOferta.loadGrid(oferta.ofertaId);
                    expedientesService.getExpediente(expedienteId)
                    .then((expediente) => {
                       
                        this.loadExpediente(expediente);
                        
                    })
                    .catch((err) => {
                        messageApi.errorMessageAjax(err);
                    }); 
                    
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
  
       /*  $$("cmbTiposProyecto").attachEvent("onChange", (newv, oldv) => {
           if(newv == "" || !newv) return;
           //this.cambioTipoProyecto(newv)
        }); */
    }

    cancel() {
        this.$scope.show('/top/expedientesForm?expedienteId=' + expedienteId + '&desdeVenta=true');
    }
    accept() {
        if (!$$("frmOfertas").validate()) {
            messageApi.errorMessage("Debe rellenar los campos correctamente");
            return;
        }
        var data = $$("frmOfertas").getValues();
        
        
       
        if (ofertaId == 0) {
            data.tipoProyectoId = tipoProyectoId;
            data.ofertaId = 0;
            data.tipoOfertaId = 5
            data.coste = 0
            data.porcentajeBeneficio = 0
            data.importeBeneficio = 0
            data.ventaNeta = 0
            data.porcentajeAgente = 0
            data.importeAgente = 0
            data.importeCliente = 0
            data.importeMantenedor = 0
            data.mantenedorId  = null;
            data.expedienteId = expedienteId;
            data.esCoste = 0

            ofertasService.postOferta(data)
                .then((result) => {
                    this.$scope.show('/top/ofertasVentaForm?ofertaId=' + result.ofertaId + "&NEW");
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
            delete data.direccion;
            delete data.codpostal;
            delete data.poblacion;
            delete data.provincia;
            delete data.tipoViaId;
            delete data.comercialCliente;
            //
            data.porcentajeBeneficio = 0
            data.importeBeneficio = 0
            data.porcentajeAgente = 0
            data.importeAgente = 0
            data.importeMantenedor = 0
            ofertasService.putOferta(data, data.ofertaId)
                .then(() => {
                    this.$scope.show('/top/expedientesForm?expedienteId=' + expedienteId + '&desdeVenta=true');
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

    loadEmpresas(empresaId) {
        empresasService.getEmpresas()
            .then(rows => {
                var empresas = generalApi.prepareDataForCombo('empresaId', 'nombre', rows);
                var list = $$("cmbEmpresas").getPopup().getList();
                list.clearAll();
                list.parse(empresas);
                if(empresaId) { 
                    $$("cmbEmpresas").setValue(empresaId);
                    $$("cmbEmpresas").refresh();
                }else {
                    $$("cmbEmpresas").setValue(2);
                    $$("cmbEmpresas").refresh();
                }
                return;
            });
    }

    loadClientes(clienteId) {
            clientesService.getClientesActivos()
            .then(rows => {
                var clientes = generalApi.prepareDataForCombo('clienteId', 'nombre', rows);
               
                var list = $$("cmbClientes").getList();
                list.clearAll();
                list.parse(clientes);
                    $$("cmbClientes").setValue(clienteId);
                    $$("cmbClientes").refresh();
                
                return;
            });
    }

   

    cambioTipoProyecto(tipoProyectoId) {
        tiposProyectoService.getTipoProyecto(tipoProyectoId)
        .then( row => {
            if(row) {
                ofertasService.getSiguienteReferencia(row.abrev)
                .then( row => {
                    var nuevaReferencia = row;
                    this.$$('referencia').setValue(nuevaReferencia);
                })
                .catch( err => {
                    messageApi.errorMessageAjax(err);
                });
            }
        })
        .catch( err => {
            messageApi.errorMessageAjax(err);
        })
    }

   
    loadUsuarios(usuarioId) {
        usuarioService.getUsuarios()
            .then(rows => {
                var usuarios = generalApi.prepareDataForCombo('usuarioId', 'nombre', rows);
                var list = $$("cmbUsuarios").getPopup().getList();
                list.clearAll();
                list.parse(usuarios);
                if (usuarioId) {
                    $$("cmbUsuarios").setValue(usuarioId);
                    $$("cmbUsuarios").refresh();
                } else {
                    $$("cmbUsuarios").setValue(null);
                    $$("cmbUsuarios").refresh();
                }
                return;
            })
    }

    loadNumero() {
        ofertasService.getNumServicio()
        .then(row => {
            $$('numServicio').setValue(row);
        })
        .catch(err => {
            var error = err.response;
                            var index = error.indexOf("Cannot delete or update a parent row: a foreign key constraint fails");
                            if(index != -1) {
                                messageApi.errorRestriccion()
                            } else {
                                messageApi.errorMessageAjax(err);
                            }
        })
    }

    loadExpediente(expediente) {
        let rows = [];
        rows.push(expediente);
                var expedientes = generalApi.prepareDataForCombo('expedienteId', 'titulo', rows);
                var list = $$("cmbExpedientes").getPopup().getList();
                list.clearAll();
                list.parse(expedientes);
                $$("cmbExpedientes").setValue(expediente.expedienteId);
                $$("cmbExpedientes").refresh();
                return;
    }

    loadPresupuestosCoste(expedienteId, presupuestosCosteId) {
        if(!expedienteId) return;
        ofertasService.getOfertasExpediente(expedienteId, 1)
        .then( (rows) => {
            var presupuestosCoste = generalApi.prepareDataForCombo('ofertaId', 'referencia', rows);
            var list = $$("cmbPresupuestosCoste").getPopup().getList();
            list.clearAll();
            list.parse(presupuestosCoste);
            $$("cmbPresupuestosCoste").setValue(presupuestosCosteId);
            $$("cmbPresupuestosCoste").refresh();
        return;
        })
        .catch( (err) => {
            messageApi.errorMessageAjax(err);
        })
    }

    compruebaCobrosCliente(clienteId) {
        clientesService.getCliente(clienteId)
        .then( (row) => {
            if(row) {
                clientesService.getCobrosCliente(clienteId)
                .then(rows => {
                    limiteCredito = row.limiteCredito;
                    rows.forEach(c => {
                        if ( !c.seguro )
                        {
                            importeCobro += parseFloat(c.impvenci);
                        }
                    });
                    if(importeCobro > limiteCredito) {
                        messageApi.normalMessage('ATENCION!!!, este cliente ha superado su limete de credito');
                    }
                })
                .catch(err => {
                    messageApi.errorMessageAjax(err);
                });
            }

        })
        .catch( (err) => {

        });
    }

    loadLienasCosteData(presupuestoCosteId) {
        ofertasService.getLineasOferta(presupuestoCosteId)
        .then( (rows) => {
            lineasOfertaVenta.loadGrid(ofertaId, _imprimirWindow, rows)
        })
        .catch( (err) => {

        })
    }


    buscaClientesActivos(query) {  
        // Modifica la función para pasar la consulta al servicio
        clientesService.getClientesActivosQuery(query)
            .then(rows => {
                var clientes = generalApi.prepareDataForCombo('clienteId', 'nombre', rows);
                var list = $$("cmbClientes").getPopup().getList();;
                var  popup = $$("cmbClientes").getPopup();
                list.clearAll();
                list.parse(clientes);
                popup.show(); 
            })
            .catch(error => {
                console.error("Error al buscar clientes activos:", error);
            });
    }
    
}