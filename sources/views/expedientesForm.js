import { JetView } from "webix-jet";
import { usuarioService } from "../services/usuario_service";
import { clientesService } from "../services/clientes_service";
import { estadosService } from "../services/estados_service";
import { tiposViaService } from "../services/tipos_via_service";
import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { agentesService } from "../services/agentes_service";
import { colaboradoresService } from "../services/colaboradores_service";
import { expedientesService } from "../services/expedientes_service";
import { tiposProyectoService } from "../services/tipos_proyecto_service"
import { languageService} from "../locales/language_service";
import { empresasService } from "../services/empresas_service";
import OfertasEpisReport  from "./ofertasEpisReport";
import { ofertasCoste } from '../subviews/ofertasCosteGrid'
import { ofertasVenta } from '../subviews/ofertasVentaGrid'




var expedienteId = 0;
var usuarioId;
var usuario;
var limiteCredito = 0;
var importeCobro = 0;
var _imprimirWindow;
var desdeCoste = null;
var isLoading = false; // Variable de control
var formaPagoId = null;

export default class ExpedientesForm extends JetView {
    config() {
        const translate = this.app.getService("locale")._;
        const _ofertasCoste = ofertasCoste.getGrid(this.app);
        const _ofertasVenta = ofertasVenta.getGrid(this.app);
       
        const _view = {
            view: "tabview",
            id: "tabViewExpediente",
            cells: [
                {
                    header:  "Datos",
                    width: 100,
                    body: {
                        //solapa expedientes
                        view: "layout",
                        id: "expedientesForm",
                        multiview: true,
                        rows: [
                            {
                                view: "toolbar", padding: 3, css: {"background-color": "#F4F5F9"}, elements: [
                                    { view: "icon", icon: "mdi mdi-currency-eur", width: 37, align: "left" },
                                    { view: "label", label: "Expediente" }
                                ]
                            },
                            {
                                view: "form",
                                scroll:"y",
                                id: "frmExpedientes",
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
                                                view: "text", id: "expedienteId", name: "expedienteId", hidden: true,
                                                label: "ID", labelPosition: "top", width: 100, disabled: true
                                            },
                                            {
                                                view: "text", id: "referencia", name: "referencia", required: true,
                                                label: "Referencia", labelPosition: "top", maxWidth:130
                                            },
                                            {
                                                view: "combo", id: "cmbEmpresas", name: "empresaId", required: true, options: {},
                                                label: "Empresa", labelPosition: "top", maxWidth: 280
                                            },
                                            {
                                                view: "combo", id: "cmbEstados", name: "estadoExpedienteId", required: true, options: {},
                                                label: "Estado", labelPosition: "top", maxWidth: 100
                                            },
                                            {
                                                view: "combo", id: "cmbClientes", name: "clienteId", required: true, minWidth:300,
                                                label: "Cliente", labelPosition: "top",
                                                options:{},
                                                on: {
                                                    "onChange": (newv, oldv) => {
                                                        if(isLoading) return;
                                                        var id = newv;
                                                        this.loadAgenteCliente(id);
                                                    },
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
                                                view: "text", id: "titulo", name: "titulo", required: true,
                                                label: "Titulo", labelPosition: "top", maxwidth:250
                                            },
                                            {
                                                view: "datepicker", id: "fecha", name: "fecha",  maxWidth: 150,
                                                label: "Fecha", labelPosition: "top", required: true
                                            },
                                            {
                                                view: "combo", id: "cmbTiposProyecto", name: "tipoProyectoId",required: true, 
                                                label: "Tipo proyecto", labelPosition: "top", options:{}
                                            },
                                        ]
                                    },
                                    {
                                        cols: [
                                            {
                                                view: "combo", id: "cmbTiposVia", name: "tipoViaId", options: {},
                                                label: "tipo de via", labelPosition: "top", maxWidth: 150
                                            },
                                            {
                                                view: "text", id: "direccion", name: "direccion",
                                                label: "Direccion", labelPosition: "top"
                                            },
                                            {
                                                view: "text", id: "poblacion", name: "poblacion", 
                                                label: "Población", labelPosition: "top", maxWidth:130
                                            },
                                            {
                                                view: "text", id: "codPostal", name: "codPostal", 
                                                label: "Cod. postal", labelPosition: "top", maxWidth:130
                                            },
                                            {
                                                view: "text", id: "provincia", name: "provincia", 
                                                label: "Provincia", labelPosition: "top", maxWidth:130
                                            },
                                            {
                                                view: "text", id: "contacto", name: "contacto",
                                                label: "Contacto", labelPosition: "top"
                                            },
                                            {
                                                view: "text", type: "numeric",  id: 'importeObra', name: 'importeObra',
                                                label: "Importe de la obra", labelPosition: "top", value: 0 ,
                                                format: {
                                                    edit : function(v){ return webix.Number.format(v, webix.i18n); },
                                                    parse : function(v){ return webix.Number.parse(v, webix.i18n); }
                                                  }
                                            }
                                        ]
                                    },
                                    {
                                        view: "toolbar", padding: 3, css: {"background-color": "#F4F5F9"}, elements: [
                                            { view: "icon", icon: "mdi mdi-currency-eur", width: 37, align: "left" },
                                            { view: "label", label: "Colaboradores" }
                                        ]
                                    },
                                    {
                                        cols: [
                                            {
                                                view: "combo", id: "cmbAgentes", name: "agenteId",required: true, 
                                                label: "Agente", labelPosition: "top", minWidth: 130,
                                                options:{},
                                                on: {
                                                    "onChange": (newv, oldv) => {
                                                        if(isLoading) return;
                                                        var id = newv;
                                                        this.loadClientesAgente(null, id, null);
                                                    },
                                                    onTimedKeyPress: function() {
                                                        var input = $$('cmbAgentes').getText(); // Obtiene el valor actual del campo de texto
                                                        if (input.length >= 3) {
                                                            // Llama a la función para buscar coincidencias en la base de datos
                                                            this.buscaAgentesActivos(input);
                                                        }
                                                        if(input === "*") {
                                                            this.buscaAgentesActivos(input);
                                                        }
                                                    }.bind(this)
                                                }
                                            },
                                            {
                                                view: "combo", id: "cmbComerciales", name: "comercialId", 
                                                label: "Comercial", labelPosition: "top", minWidth: 130,
                                                options:{},
                                                on: {
                                                    onTimedKeyPress: function() {
                                                        var input = $$('cmbComerciales').getText(); // Obtiene el valor actual del campo de texto
                                                        let name = $$("cmbComerciales").config.name;
                                                        if (input.length >= 3) {
                                                            // Llama a la función para buscar coincidencias en la base de datos
                                                            this.buscaColaboradoresActivos(input, name, "cmbComerciales", null);
                                                        }
                                                        if(input === "*") {
                                                            this.buscaColaboradoresActivos(input, name, "cmbComerciales", null);
                                                        }
                                                    }.bind(this)
                                                }
                                            },
                                            {
                                                view: "combo", id: "cmbJefeGrupo", name: "jefeGrupoId", 
                                                label: "Jefe de grupo", labelPosition: "top", minWidth: 130,
                                                options:{},
                                                on: {
                                                    onTimedKeyPress: function() {
                                                        var input = $$('cmbJefeGrupo').getText(); // Obtiene el valor actual del campo de texto
                                                        let name = $$("cmbJefeGrupo").config.name;
                                                        if (input.length >= 3) {
                                                            // Llama a la función para buscar coincidencias en la base de datos
                                                            this.buscaColaboradoresActivos(input, name, "cmbJefeGrupo", null);
                                                        }
                                                        if(input === "*") {
                                                            this.buscaColaboradoresActivos(input, name, "cmbJefeGrupo", null);
                                                        }
                                                    }.bind(this)
                                                }
                                            },
                                           
                                         /*    {
                                                view: "combo", id: "cmbJefeObras", name: "jefeObrasId", 
                                                label: "Jefe de obras", labelPosition: "top", minWidth: 130,
                                                options:{},
                                                on: {
                                                    onTimedKeyPress: function() {
                                                        var input = $$('cmbJefeObras').getText(); // Obtiene el valor actual del campo de texto
                                                        let name = $$("cmbJefeObras").config.name;
                                                        if (input.length >= 3) {
                                                            // Llama a la función para buscar coincidencias en la base de datos
                                                            this.buscaColaboradoresActivos(input, name, "cmbJefeGrupo", null);
                                                        }
                                                        if(input === "*") {
                                                            this.buscaColaboradoresActivos(input, name, "cmbJefeGrupo", null);
                                                        }
                                                    }.bind(this)
                                                }
                                            }, */
                                           /*  {
                                                view: "combo", id: "cmbOficinaTecnica", name: "oficinaTecnicaId", 
                                                label: "Oficina técnica", labelPosition: "top", minWidth: 130,
                                                options:{},
                                                on: {
                                                    onTimedKeyPress: function() {
                                                        var input = $$('cmbOficinaTecnica').getText(); // Obtiene el valor actual del campo de texto
                                                        let name = $$("cmbOficinaTecnica").config.name;
                                                        if (input.length >= 3) {
                                                            // Llama a la función para buscar coincidencias en la base de datos
                                                            this.buscaColaboradoresActivos(input, name, "cmbOficinaTecnica", null);
                                                        }
                                                        if(input === "*") {
                                                            this.buscaColaboradoresActivos(input, name, "cmbOficinaTecnica", null);
                                                        }
                                                    }.bind(this)
                                                }
                                            }, */
                                            {
                                                view: "combo", id: "cmbAsesorTecnico", name: "asesorTecnicoId", 
                                                label: "Asesor técnico", labelPosition: "top", minWidth: 130,
                                                options:{},
                                                on: {
                                                    onTimedKeyPress: function() {
                                                        var input = $$('cmbAsesorTecnico').getText(); // Obtiene el valor actual del campo de texto
                                                        let name = $$("cmbAsesorTecnico").config.name;
                                                        if (input.length >= 3) {
                                                            // Llama a la función para buscar coincidencias en la base de datos
                                                            this.buscaColaboradoresActivos(input, name, "cmbAsesorTecnico", null);
                                                        }
                                                        if(input === "*") {
                                                            this.buscaColaboradoresActivos(input, name, "cmbAsesorTecnico", null);
                                                        }
                                                    }.bind(this)
                                                }
                                            },
                                        ]
                                    },
                                    
                                   /*  {
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
                                    }, */
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
                                ]
                            },
                            
                           
                           
                        ],
                        scroll:true
                    }
                },
                {
                    header:  "Costes",
                    width: 100,
                    body: {
                    view: "layout",
                    id: "presupuestoCosteGrid",
                    multiview: true,
                    rows: [
                        _ofertasCoste
                    ]
                    }
                    
                },
                {
                    header:  "Ventas",
                    width: 100,
                    body: {
                        view: "layout",
                        id: "presupuestoVentaGrid",
                        multiview: true,
                        rows: [
                            _ofertasVenta
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
        languageService.setLanguage(this.app, 'es');
        
    }

       
    urlChange(view, url) {
        if (url[0].params.NEW) {
            messageApi.normalMessage('Expediente correctamente, puede crear ahora las  lineas asociadas.')
        }
        usuario = usuarioService.checkLoggedUser();
        usuarioId = usuario.usuarioId;
        languageService.setLanguage(this.app, 'es');
        if (url[0].params.expedienteId) {
            expedienteId = url[0].params.expedienteId;
        }
        if (url[0].params.desdeCoste) {
            desdeCoste = url[0].params.desdeCoste;
        } else {
            desdeCoste = null;
        }
        //this.cargarEventos();
        this.load(expedienteId);
    }

    load(expedienteId) {
        if(desdeCoste) { 
            const savedTab = localStorage.getItem("activeTab");
            if (savedTab) {
                $$("tabViewExpediente").setValue(savedTab);  // Activa la pestaña recuperada
            }
        } else {
            localStorage.removeItem("activeTab")
        }
        
        if (expedienteId == 0) {
            this.loadEmpresas();
            this.loadAgentes();
            this.loadClientes();
            this.loadEstados();
            this.loadTiposVia();
            this.loadTiposProyecto();  
            //
          
            this.buscaColaboradoresActivos("", "comercialId", "cmbComerciales", null);
            this.buscaColaboradoresActivos("", "jefeGrupoId", "cmbJefeGrupo", null);
            //this.buscaColaboradoresActivos("", "jefeObrasId", "cmbJefeObras", null);
            //this.buscaColaboradoresActivos("", "oficinaTecnicaId", "cmbOficinaTecnica", null);
            this.buscaColaboradoresActivos("", "asesorTecnicoId", "cmbAsesorTecnico", null);
            //this.loadMantenedores();
            //this.loadFormasPago();
            //this.loadTiposProyecto();  
            $$("fecha").setValue(new Date());//fecha por defecto
            //lineasOferta.loadGrid(null, null);
            //basesOferta.loadGrid(null);f
            //proveedoresOferta.loadGrid(null, null);
            
            return;
        }
        isLoading = true; // Se activa el flag antes de cargar datos
        expedientesService.getExpediente(expedienteId)
            .then((expediente) => {
                $$("cmbTiposProyecto").blockEvent();
                this.loadTiposProyecto(expediente.tipoProyectoId);  
                delete expediente.empresa;
                delete expediente.cliente;
                delete expediente.estado;
                delete expediente.agente;
                delete expediente.comercial;
                delete expediente.jefeGrupo;
                delete expediente.jefeObras;
                delete expediente.oficinatecnica;
                delete expediente.asesorTecnico;
                expediente.fecha = new Date(expediente.fecha);
                formaPagoId = expediente.formaPagoId;
                $$("frmExpedientes").setValues(expediente);
                //this.loadTiposProfesional(expediente.tipoProfesionalId);
                //this.loadAgentes(expediente.agenteId);
                this.loadEmpresas(expediente.empresaId);
                this.loadClientesAgente(expediente.clienteId, expediente.agenteId);
                this.loadEstados(expediente.estadoExpedienteId);
                this.loadTiposVia(expediente.tipoViaId);
                this.loadAgentes(expediente.agenteId)
                this.buscaColaboradoresActivos("", "comercialId", "cmbComerciales", expediente.comercialId);
                this.buscaColaboradoresActivos("", "jefeGrupoId", "cmbJefeGrupo", expediente.jefeGrupoId)
                //this.buscaColaboradoresActivos("", "jefeObrasId", "cmbJefeObras", expediente.jefeObrasId);
                //this.buscaColaboradoresActivos("", "oficinaTecnicaId", "cmbOficinaTecnica", expediente.oficinaTecnicaId);
                this.buscaColaboradoresActivos("", "asesorTecnicoId", "cmbAsesorTecnico", expediente.asesorTecnicoId);
                $$("cmbTiposProyecto").unblockEvent();

                ofertasCoste.loadGrid(expediente.expedienteId, null, expediente.importeObra);
                ofertasVenta.loadGrid(expediente.expedienteId, null, expediente.importeObra)
                
            })
            .catch((err) => {
                messageApi.errorMessageAjax(err);
            }); 
    }

    cargarEventos() {
        $$("cmbTiposProyecto").attachEvent("onChange", (newv, oldv) => {
           if(newv == "" || !newv) return;
           this.cambioTipoProyecto(newv)
        });
    }

    cancel() {
        this.$scope.show('/top/expedientes');
    }
    accept() {
        if (!$$("frmExpedientes").validate()) {
            messageApi.errorMessage("Debe rellenar los campos correctamente");
            return;
        }
        var data = $$("frmExpedientes").getValues();
       if(data.jefeGrupoId == '') data.jefeGrupoId = null;
       if(data.asesorTecnicoId == '') data.asesorTecnicoId = null;
       data.formaPagoId = formaPagoId;
        if (expedienteId == 0) {
            data.expedienteId = 0;
            expedientesService.postExpediente(data)
                .then((result) => {
                    this.$scope.show('/top/expedientesForm?expedienteId=' + result.expedienteId + "&NEW");
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
            
            expedientesService.putExpediente(data, data.expedienteId)
                .then(() => {
                    this.$scope.show('/top/expedientes?expedienteId=' + data.expedienteId);
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

    loadAgentes(agenteId) {
        agentesService.getAgentes()
        .then(rows => {
            var agentes = generalApi.prepareDataForCombo('comercialId', 'nombre', rows);
            var list = $$("cmbAgentes").getList();
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


    loadEstados(estadoExpedienteId) {
        estadosService.getEstados()
        .then(rows => {
            var estados = generalApi.prepareDataForCombo('estadoExpedienteId', 'nombre', rows);
            var list = $$("cmbEstados").getPopup().getList();
            list.clearAll();
            list.parse(estados);
            if(estadoExpedienteId) { 
                $$("cmbEstados").setValue(estadoExpedienteId);
                $$("cmbEstados").refresh();
            }
            return;
        });
    }

    
    loadTiposVia(tipoViaId) {
        tiposViaService.getTiposVia()
        .then(rows => {
            var tiposVia = generalApi.prepareDataForCombo('tipoViaId', 'nombre', rows);
            var list = $$("cmbTiposVia").getPopup().getList();
            list.clearAll();
            list.parse(tiposVia);
            if(tipoViaId) { 
                $$("cmbTiposVia").setValue(tipoViaId);
                $$("cmbTiposVia").refresh();
            }
            return;
        });
    }

    loadClientesAgente(clienteId, agenteId) {
        if(agenteId) {
            clientesService.getClientesAgenteActivos(agenteId)
            .then(rows => {
                var clientes = generalApi.prepareDataForCombo('clienteId', 'nombre', rows);
                var list = $$("cmbClientes").getList();
                list.clearAll();
                list.parse(clientes);
                if (clienteId) {
                    $$("cmbClientes").setValue(clienteId);
                    $$("cmbClientes").refresh();
                }else {
                    $$("cmbClientes").setValue(null);
                    $$("cmbClientes").refresh();
                }
                isLoading = false;
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
                var list = $$("cmbClientes").getList();
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
            .then(row => {
                this.loadTiposVia(row.tipoViaId2);
                $$('direccion').setValue(row.direccion2);
                $$('poblacion').setValue(row.poblacion2);
                $$('provincia').setValue(row.provincia2);
                $$('codPostal').setValue(row.codPostal2);
                this.buscaColaboradoresActivos("", "comercialId", "cmbComerciales", row.colaboradorId);
                formaPagoId = row.formaPagoId;
            });
        }
    }


   

    cambioTipoProyecto(tipoProyectoId) {
        tiposProyectoService.getTipoProyecto(tipoProyectoId)
        .then( row => {
            if(row) {
                expedientesService.getSiguienteReferencia(row.abrev)
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

    
/*     loadFormasPago(formaPagoId) {
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
    } */

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
                this.loadAgentes(rows[0].comercialId);
                this.loadClienteData(clienteId);
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
        expedientesService.getNumServicio()
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

    
    buscaAgentesActivos(query) {  
        // Modifica la función para pasar la consulta al servicio
        agentesService.getAgentesActivosQuery(query)
            .then(rows => {
                var agentes = generalApi.prepareDataForCombo('comercialId', 'nombre', rows);
                var list = $$("cmbAgentes").getPopup().getList();;
                var  popup = $$("cmbAgentes").getPopup();
                list.clearAll();
                list.parse(agentes);
                //$$("cmbAgentes").setValue();
                //$$("cmbAgentes").refresh();
                popup.show(); 
            })
            .catch(error => {
                console.error("Error al buscar agentes activos:", error);
            });
    }

    buscaColaboradoresActivos(query, name, cmbId, colaboradorId) { 
        let tipoComercial = 0;

        switch (name) {
            case "comercialId":
               tipoComercial = 2
                break;
            case "jefeGrupoId":
                tipoComercial = 3
                break;
            case "jefeObrasId":
                tipoComercial = 5
                break;
            case "oficinaTecnicaId":
                tipoComercial = 6
                break;
            case "asesorTecnicoId":
                tipoComercial = 7
                break;
            default:
                console.log("No hacemos nada.");
        }
        
        console.log(name);
        colaboradoresService.getColaboradoresActivosQuery(query, tipoComercial)
            .then(rows => {
                var comerciales = generalApi.prepareDataForCombo("comercialId", 'nombre', rows);
                var list = $$(cmbId).getList();
                var  popup = $$(cmbId).getPopup();
                list.clearAll();
                list.parse(comerciales);
                //$$("cmbAgentes").setValue();
                //$$("cmbAgentes").refresh();
                if(colaboradorId) { 
                    //$$('texto').setValue(agenteId)
                    $$(cmbId).setValue(colaboradorId);
                    $$(cmbId).refresh();
                }  else{
                    $$(cmbId).setValue(null);
                    $$(cmbId).refresh();
                }

                
            })
            .catch(error => {
                console.error("Error al buscar agentes activos:", error);
            });
    }

    loadComerciales(comercialId) {
        colaboradoresService.getColaboradores()
        .then(rows => {
            var comerciales = generalApi.prepareDataForCombo('comercialId', 'nombre', rows);
            var list = $$("cmbComerciales").getList();
            list.clearAll();
            list.parse(comerciales);
            if(comercialId) { 
                //$$('texto').setValue(agenteId)
                $$("cmbComerciales").setValue(comercialId);
                $$("cmbComerciales").refresh();
            }
            return;
        });
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
                //$$("cmbAgentes").setValue();
                //$$("cmbAgentes").refresh();
                popup.show(); 
            })
            .catch(error => {
                console.error("Error al buscar clientes activos:", error);
            });
    }
}