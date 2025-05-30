import { JetView } from "webix-jet";
import { usuarioService } from "../services/usuario_service";
import { clientesService } from "../services/clientes_service";
// import { tiposProfesionalService } from "../services/tiposProfesional_service";
import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { agentesService } from "../services/agentes_service";
import { ofertasService } from "../services/ofertas_service";
import { tiposProyectoService } from "../services/tipos_proyecto_service"
import { languageService} from "../locales/language_service";
import { empresasService } from "../services/empresas_service";
import { formasPagoService } from "../services/formas_pago_service";
import { lineasOferta } from "../subviews/lineasOfertaGrid";
import { proveedoresOferta } from "../subviews/proveedoresOfertaGrid";
import { basesOferta } from "../subviews/basesOfertaGrid";
import OfertasEpisReport  from "./ofertasEpisReport";
import { expedientesService } from "../services/expedientes_service";



var ofertaId = 0;
var expedienteId = 0;
var usuarioId;
var usuario;
var limiteCredito = 0;
var importeCobro = 0;
var _imprimirWindow;


export default class OfertasForm extends JetView {
    config() {
        const translate = this.app.getService("locale")._;
        const _lineasOferta = lineasOferta.getGrid(this.app);
        const _proveedoresOferta = proveedoresOferta.getGrid(this.app);
        const _basesOferta = basesOferta.getGrid(this.app);
              
        const _view = {
            view: "tabview",
            cells: [
                {
                    header:  "Oferta",
                    body: {
                        //solapa ofertas
                        view: "layout",
                        id: "ofertasForm",
                        multiview: true,
                        rows: [
                            {
                                view: "toolbar", padding: 3, elements: [
                                    { view: "icon", icon: "mdi mdi-currency-eur", width: 37, align: "left" },
                                    { view: "label", label: "Ofertas" }
                                ]
                            },
                            {
                                view: "form",
                                scroll:"y",
                                id: "frmOfertas",
                                maxWidth: 1500,
                                //minHeight: 500,
                                autoheight:true,
                                elements: [
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
                                            {
                                                view: "combo", id: "cmbTiposProyecto", name: "tipoProyectoId",required: true, 
                                                label: "Tipo proyecto", labelPosition: "top", options:{}
                                            }
                                        ]
                                    },
                                    {
                                        cols: [
                                            {
                                                view: "combo", id: "cmbClientes", name: "clienteId", required: true,
                                                label: "Cliente (empezar busquedas con @)", labelPosition: "top",
                                                suggest:{
                                                    view:"mentionsuggest",
                                                    id: "clientesList",
                                                    data: [] 
                                                }        
                                            },
                                            {
                                                minWidth:200
                                            },
                                            {
                                                view: "combo", id: "cmbAgentes", name: "agenteId", required: true,
                                                label: "Agente (empezar busquedas con @)", labelPosition: "top",
                                                suggest:{
                                                    view:"mentionsuggest",
                                                    id: "agentesList",
                                                    data: [] 
                                                }        
                                            }
                                        ]
                                    },
                                    
                                    {
                                        cols: [
                                            {
                                                view: "combo", id: "cmbFormasPago", name: "formaPagoId", required: true, options: {},
                                                label: "Forma de pago", labelPosition: "top", minWidth: 250
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
                                    _basesOferta
                                ]
                            },
                            
                           
                           
                        ],
                        scroll:true
                    }
                },
                {
                    header:  "Lineas proveedores",
                    body: {
                    //solapa ofertas
                    view: "layout",
                    id: "proveedoresGrid",
                    multiview: true,
                    rows: [    
                        _proveedoresOferta,
                        { minheight: 500},
                    ]
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
        this.cargarEventos();
        this.load(ofertaId, expedienteId);
    }
    load(ofertaId, expedienteId) {
        if (ofertaId == 0 && expedienteId > 0) {
            expedientesService.getExpediente(expedienteId)
            .then((expediente) => {
                this.loadEmpresas(expediente.empresaId);
                this.loadAgentes(expediente.agenteId);
                this.loadClientesAgente(expediente.clienteId, expediente.agenteId);
                this.loadFormasPago();
                this.loadTiposProyecto();  
                $$("fechaOferta").setValue(new Date(expediente.fecha));//fecha por defecto
                this.$$("referencia").setValue(expediente.referencia)
                lineasOferta.loadGrid(null, null);
                basesOferta.loadGrid(null);
                proveedoresOferta.loadGrid(null, null);    
            })
            .catch((err) => {
                messageApi.errorMessageAjax(err);
            }); 
            return;
        }
        ofertasService.getOferta(ofertaId)
            .then((oferta) => {
                $$("cmbTiposProyecto").blockEvent();
                delete oferta.empresa;
                delete oferta.cliente;
                delete oferta.tipo;
                delete oferta.mantenedor;
                delete oferta.agente;
                delete oferta.formaPago
                oferta.fechaOferta = new Date(oferta.fechaOferta);
                $$("frmOfertas").setValues(oferta);
                //this.loadTiposProfesional(oferta.tipoProfesionalId);
                this.loadAgentes(oferta.agenteId);
                this.loadEmpresas(oferta.empresaId);
                this.loadClientesAgente(oferta.clienteId, oferta.agenteId);
                //this.loadMantenedores(oferta.mantenedorId);
                this.loadTiposProyecto(oferta.tipoProyectoId);  
                lineasOferta.loadGrid(oferta.ofertaId, _imprimirWindow);
                basesOferta.loadGrid(oferta.ofertaId);
                proveedoresOferta.loadGrid(oferta.ofertaId, _imprimirWindow);
                this.loadFormasPago(oferta.formaPagoId);
                $$("cmbTiposProyecto").unblockEvent();
                
            })
            .catch((err) => {
                messageApi.errorMessageAjax(err);
            }); 
    }

    cargarEventos() {

        $$('clientesList').attachEvent("onValueSuggest", (obj) =>{
            this.loadAgenteCliente(obj.id);
            this.loadClienteData(obj.id);
        });
      
        $$("agentesList").attachEvent("onValueSuggest", (obj) => {
            this.loadClientesAgente(null, obj.id);
        });

        $$("cmbTiposProyecto").attachEvent("onChange", (newv, oldv) => {
           if(newv == "" || !newv) return;
           this.cambioTipoProyecto(newv)
        });
    }

    cancel() {
        this.$scope.show('/top/ofertas');
    }
    accept() {
        if (!$$("frmOfertas").validate()) {
            messageApi.errorMessage("Debe rellenar los campos correctamente");
            return;
        }
        var data = $$("frmOfertas").getValues();
       
        if (ofertaId == 0) {
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
            data.esCoste = 0;

            ofertasService.postOferta(data)
                .then((result) => {
                    this.$scope.show('/top/ofertasForm?ofertaId=' + result.ofertaId + "&NEW");
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
            data.porcentajeBeneficio = 0
            data.importeBeneficio = 0
            data.porcentajeAgente = 0
            data.importeAgente = 0
            data.importeMantenedor = 0
            ofertasService.putOferta(data, data.ofertaId)
                .then(() => {
                    this.$scope.show('/top/ofertas?ofertaId=' + data.ofertaId);
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
                    $$("cmbEmpresas").setValue(10);
                    $$("cmbEmpresas").refresh();
                }
                return;
            });
    }

    loadAgentes(agenteId, clienteId) {
        agentesService.getAgentes()
        .then(rows => {
            

            var agentes = generalApi.prepareDataForCombo('comercialId', 'nombre', rows);
            var list = $$("agentesList").getList();
            list.clearAll();
            list.parse(agentes);
            if(agenteId) { 
                //$$('texto').setValue(agenteId)
                $$("cmbAgentes").setValue(agenteId);
                $$("cmbAgentes").refresh();
            }
            return;
        });
}
    loadClientesAgente(clienteId, agenteId) {
        if(agenteId) {
            clientesService.getClientesAgenteActivos(agenteId)
            .then(rows => {
                var ofertas = generalApi.prepareDataForCombo('clienteId', 'nombre', rows);
                var list = $$("clientesList").getList();
                list.clearAll();
                list.parse(ofertas);
                if (clienteId) {
                    $$("cmbClientes").setValue(clienteId);
                    $$("cmbClientes").refresh();
                }else {
                    $$("cmbClientes").setValue(null);
                    $$("cmbClientes").refresh();
                }
                return;
            });
        }
    }

    loadClientes() {
            clientesService.getClientesActivos()
            .then(rows => {
                var clientes = generalApi.prepareDataForCombo('clienteId', 'nombre', rows);
                clientes.sort(function (a, b) {
                    if (a.value > b.value) {
                      return 1;
                    }
                    if (a.value < b.value) {
                      return -1;
                    }
                    // a must be equal to b
                    return 0;
                  });
                var list = $$("clientesList").getList();
                list.clearAll();
                list.parse(clientes);
                    $$("cmbClientes").setValue(null);
                    $$("cmbClientes").refresh();
                
                return;
            });
    }

    loadClienteData(clienteId) {
        if(clienteId) {
            clientesService.getCliente(clienteId)
            .then(rows => {
                $$('cmbFormasPago').setValue(rows.formaPagoId);
                $$('cmbFormasPago').refresh()
            });
        }
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

    
    loadFormasPago(formaPagoId) {
        formasPagoService.getFormasPago()
        .then( rows => {
            var formaspago = generalApi.prepareDataForCombo('formaPagoId', 'nombre', rows);
                var list = $$("cmbFormasPago").getPopup().getList();
                list.clearAll();
                list.parse(formaspago);
                $$("cmbFormasPago").setValue(formaPagoId);
                $$("cmbFormasPago").refresh();
        })
        .catch( err => {
            messageApi.errorMessageAjax(err);
        })
    }

    loadTiposProfesionales(tipoProfesionalId) {
        tiposProfesionalService.getTiposProfesional()
        .then(rows => {
            var tiposProfesionales = generalApi.prepareDataForCombo('tipoProfesionalId', 'nombre', rows);
            var list = $$("cmbTiposProfesional").getPopup().getList();
            list.clearAll();
            list.parse(tiposProfesionales);
            if(tipoProfesionalId) { 
                $$("cmbTiposProfesional").setValue(tipoProfesionalId);
                $$("cmbTiposProfesional").refresh();
            }
        });
    }

    loadTiposProyecto(tipoProyectoId) {
        tiposProyectoService.getTiposProyecto(usuarioId)
        .then(rows => {
            var tiposProyecto = generalApi.prepareDataForCombo('tipoProyectoId', 'nombre', rows);
            var list = $$("cmbTiposProyecto").getPopup().getList();
            list.clearAll();
            list.parse(tiposProyecto);
            if(tiposProyectoId) { 
                $$("cmbTiposProyecto").setValue(tiposProyectoId);
                $$("cmbTiposProyecto").refresh();
            }
        });
    }


   
    loadAgenteCliente(clienteId) {
        if(clienteId) {
            agentesService.getAgenteCliente(clienteId)
            .then(rows => {
                this.loadAgentes(rows[0].comercialId,clienteId);
                    //$$("cmbAgentes").setValue(rows[0].comercialId);
                    //$$("cmbAgentes").refresh();
                
                return;
            });
        }
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
}