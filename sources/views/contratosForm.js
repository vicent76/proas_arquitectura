import { JetView } from "webix-jet";
import { usuarioService } from "../services/usuario_service";
import { clientesService } from "../services/clientes_service";
// import { tiposProfesionalService } from "../services/tiposProfesional_service";
import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { agentesService } from "../services/agentes_service";
import { contratosService } from "../services/contratos_service";
import { tiposProyectoService } from "../services/tipos_proyesto_service"
import { languageService} from "../locales/language_service";
import { empresasService } from "../services/empresas_service";
import { formasPagoService } from "../services/formas_pago_service";
import { lineasContrato } from "../subviews/lineasContratoGrid";
//import { proveedoresContrato } from "../subviews/proveedoresContratoGrid";
import { basesContrato } from "../subviews/basesContratoGrid";
//import ContratosEpisReport  from "./contratosEpisReport";



var contratoId = 0;
var usuarioId;
var usuario;
var limiteCredito = 0;
var importeCobro = 0;
//var _imprimirWindow;


export default class ContratosForm extends JetView {
    config() {
        const translate = this.app.getService("locale")._;
        const _lineasContrato = lineasContrato.getGrid(this.app);
        //const _proveedoresContrato = proveedoresContrato.getGrid(this.app);
        const _basesContrato = basesContrato.getGrid(this.app);
              
        const _view = {
            view: "tabview",
            cells: [
                {
                    header:  "Contrato",
                    body: {
                        //solapa contratos
                        view: "layout",
                        id: "contratosForm",
                        multiview: true,
                        rows: [
                            {
                                view: "toolbar", padding: 3, elements: [
                                    { view: "icon", icon: "mdi mdi-currency-eur", width: 37, align: "left" },
                                    { view: "label", label: "Contratos" }
                                ]
                            },
                            {
                                view: "form",
                                scroll:"y",
                                id: "frmContratos",
                                maxWidth: 1500,
                                //minHeight: 500,
                                autoheight:true,
                                elements: [
                                    {
                                        cols: [
                                            {
                                                view: "text", id: "contratoId", name: "contratoId", hidden: true,
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
                                                view: "datepicker", id: "fechaContrato", name: "fechaContrato",  width: 150,
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
                                    _lineasContrato,
                                    { minWidth : 100},
                                    _basesContrato
                                ]
                            },
                            
                           
                           
                        ],
                        scroll:true
                    }
                },
                {
                    header:  "Lineas proveedores",
                    body: {
                    //solapa contratos
                    view: "layout",
                    id: "proveedoresGrid",
                    multiview: true,
                    rows: [    
                        //_proveedoresContrato,
                        { minheight: 500},
                    ]
                    }
                    
                }
    ]
        }
        return _view;
    }
    init(view, url) {
       // _imprimirWindow = this.ui(ContratosEpisReport);
        this.cargarEventos();
    }
    
       
    urlChange(view, url) {
        if (url[0].params.NEW) {
            messageApi.normalMessage('Contrato correctamente, puede crear ahora las  lineas asociadas.')
        }
        usuario = usuarioService.checkLoggedUser();
        usuarioId = usuario.usuarioId;
        languageService.setLanguage(this.app, 'es');
        if (url[0].params.contratoId) {
            contratoId = url[0].params.contratoId;
        }
        this.cargarEventos();
        this.load(contratoId);
    }
    load(contratoId) {
        if (contratoId == 0) {
            this.loadEmpresas();
            this.loadAgentes();
            this.loadClientes();
            //this.loadMantenedores();
            this.loadFormasPago();
            this.loadTiposProyecto();  
            $$("fechaContrato").setValue(new Date());//fecha por defecto
            lineasContrato.loadGrid(null, null);
            basesContrato.loadGrid(null);
            //proveedoresContrato.loadGrid(null, null);
            
            return;
        }
        contratosService.getContrato(contratoId)
            .then((contrato) => {
                $$("cmbTiposProyecto").blockEvent();
                delete contrato.empresa;
                delete contrato.cliente;
                delete contrato.tipo;
                delete contrato.mantenedor;
                delete contrato.agente;
                delete contrato.formaPago
                contrato.fechaContrato = new Date(contrato.fechaContrato);
                $$("frmContratos").setValues(contrato);
                //this.loadTiposProfesional(contrato.tipoProfesionalId);
                this.loadAgentes(contrato.agenteId);
                this.loadEmpresas(contrato.empresaId);
                this.loadClientesAgente(contrato.clienteId, contrato.agenteId);
                //this.loadMantenedores(contrato.mantenedorId);
                this.loadTiposProyecto(contrato.tipoProyectoId);  
                lineasContrato.loadGrid(contrato.contratoId);
                basesContrato.loadGrid(contrato.contratoId);
                //proveedoresContrato.loadGrid(contrato.contratoId, _imprimirWindow);
                this.loadFormasPago(contrato.formaPagoId);
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
        this.$scope.show('/top/contratos');
    }
    accept() {
        if (!$$("frmContratos").validate()) {
            messageApi.errorMessage("Debe rellenar los campos correctamente");
            return;
        }
        var data = $$("frmContratos").getValues();
       
        if (contratoId == 0) {
            data.contratoId = 0;
            data.tipoContratoId = 5
            data.coste = 0
            data.porcentajeBeneficio = 0
            data.importeBeneficio = 0
            data.ventaNeta = 0
            data.porcentajeAgente = 0
            data.importeAgente = 0
            data.importeCliente = 0
            data.importeMantenedor = 0
            data.mantenedorId  = null;

            contratosService.postContrato(data)
                .then((result) => {
                    this.$scope.show('/top/contratosForm?contratoId=' + result.contratoId + "&NEW");
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
            contratosService.putContrato(data, data.contratoId)
                .then(() => {
                    this.$scope.show('/top/contratos?contratoId=' + data.contratoId);
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
                var contratos = generalApi.prepareDataForCombo('clienteId', 'nombre', rows);
                var list = $$("clientesList").getList();
                list.clearAll();
                list.parse(contratos);
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
                contratosService.getSiguienteReferencia(row.abrev)
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
        contratosService.getNumServicio()
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