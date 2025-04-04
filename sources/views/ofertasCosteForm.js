import { JetView } from "webix-jet";
import { usuarioService } from "../services/usuario_service";
import { clientesService } from "../services/clientes_service";
import { colaboradoresService } from "../services/colaboradores_service";
import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { agentesService } from "../services/agentes_service";
import { ofertasService } from "../services/ofertas_service";
import { tiposProyectoService } from "../services/tipos_proyecto_service"
import { languageService} from "../locales/language_service";
import { empresasService } from "../services/empresas_service";
import { formasPagoService } from "../services/formas_pago_service";
import { lineasOferta } from "../subviews/lineasOfertaGrid";
//import { basesOferta } from "../subviews/basesOfertaGrid";
import OfertasEpisReport  from "./ofertasEpisReport";
import { expedientesService } from "../services/expedientes_service";
import { capituloService } from "../services/capitulo_service";
import { parametrosService } from "../services/parametros_service";
import { unidadesObraService } from "../services/unidades_obra_service";
import { LineasOfertaWindow } from "../subviews/lineasOfertaWindow";

var isLoading = false; // Variable de control


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

export default class OfertasCosteForm extends JetView {
    config() {
        const translate = this.app.getService("locale")._;
        const _lineasOferta = lineasOferta.getGrid(this.app);
        //const _basesOferta = basesOferta.getGrid(this.app);
              
        const _view = {
            //solapa ofertas
            view: "layout",
            id: "ofertasCosteForm",
            multiview: true,
            rows: [
                {
                    view: "toolbar", padding: 3, elements: [
                        { view: "icon", icon: "mdi mdi-currency-eur", width: 37, align: "left" },
                        { view: "label", label: "Oferta de coste" }
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
                                {
                                    view: "combo", id: "cmbExpedientes", name: "expedienteId", disabled: true, 
                                    label: "Expediente", labelPosition: "top", options:{}
                                },
                                {
                                    view:"label", label: "Valorado", width:60,on: {
                                        onAfterRender: function () {
                                            this.getNode().style.marginLeft = "10px";
                                        }
                                    },
                                },
                                {
                                    view: "checkbox", id: "valorado", name: "valorado", width: 50
                                },
                                {
                                    view:"label", label: "Desglosado", width:80
                                },
                                {
                                    view: "checkbox", id: "desglosado", name: "desglosado", width: 50
                                },
                                {
                                    view:"label", label: "IVA", width:30
                                },
                                {
                                    view: "checkbox", id: "mostrarIva", name: "mostrarIva", width: 50
                                },
                            ]
                        },
                        {
                            cols: [
                                  {
                                    view: "combo", id: "cmbClientes", name: "clienteId", required: true, minWidth:300,
                                    label: "Cliente", labelPosition: "top",
                                    options:{},
                                    on: {
                                        "onChange": (newv, oldv) => {
                                            if (isLoading) return; 
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
                                    view: "text", id: 'importeCli', name: 'importeCliente', disabled: true, width: 180,
                                    label: "Importe cliente", labelPosition: "top", value: 0 ,format: "1,00"
                                     
                                },
                            
                                        
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
                                            if (isLoading) return; 
                                            var id = newv;
                                            this.loadClientesAgente(null, id, null);
                                                /* if(cliId) {
                                                    this.loadClientesAgente(cliId, id, null);
                                                    //this.loadProId(cliId, id);
                                                }else {
                                                    this.loadClientesAgente(null, id, null);
                                                    //this.loadProId(null, id);
                                               
                                                } */
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
                                /* {
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
                        {
                            cols: [
                                {
                                    rows: [
                                        { view: "label", label: "Tipos de Proyecto", align: "left" },
                                        {
                                            view: "list",
                                            id: "listTiposProyecto",
                                            template: "#value#", // Muestra el campo 'nombre' de los datos
                                            select: true, // Permite seleccionar elementos
                                            autoheight: false,
                                            height: 200,
                                            scroll: "y",
                                            on: {
                                                onItemClick: function (id) {
                                                    this.$scope.loadCapitulos(id);
                                                }
                                            }
                                        }
                                    ]
                                },
                                {
                                    rows: [
                                        { view: "label", label: "Capítulos", align: "left" },
                                        {
                                            view: "list",
                                            id: "listCapitulos",
                                            template: "#value#", // Muestra el campo 'nombre' de los datos
                                            select: true, // Permite seleccionar elementos
                                            autoheight: false,
                                            height: 200,
                                            scroll: "y",
                                            on: {
                                                onItemClick: function (id) {
                                                    cap = id;
                                                    this.$scope.loadUnidadesObra(id);
                                                }
                                            }
                                        }
                                    ]
                                },
                                {
                                    rows: [
                                        { view: "label", label: "Partidas", align: "left" },
                                        {
                                            view: "list",
                                            id: "listUnidadesObra",
                                            template: "#value#", // Muestra el campo 'nombre' de los datos
                                            select: true, // Permite seleccionar elementos
                                            autoheight: false,
                                            height: 200,
                                            scroll: "y",
                                            on: {
                                                onItemClick: function (id) {
                                                    var cliId = $$('cmbClientes').getValue();
                                                    var data = {
                                                        indiceCorrector: indiceCorrector,
                                                        porcen1: porcen1,
                                                        porcen2: porcen2,
                                                        porcen3: porcen3,
                                                        porcen4: porcen4,
                                                        importeObra: importeObra,
                                                        limiteImpObra: limiteImpObra
                                                    }
                                                    
                                                    LineasOfertaWindow.loadWindow(ofertaId, null, cliId, cap, id, data);
                                                }
                                            }
                                        }
                                    ]
                                }
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
        isLoading = true; // Se activa el flag antes de cargar datos
        //PRIMERO RECUPERAMOS EL INDICE CORRECTOR
        parametrosService.getParametros()
        .then((parametros) => {
            if(parametros && parametros[0].indiceCorrector) indiceCorrector = parametros[0].indiceCorrector;
            if (ofertaId == 0 && expedienteId > 0) {
                expedientesService.getExpediente(expedienteId)
                .then((expediente) => {
                    tipoProyectoId = expediente.tipoProyectoId
                    this.loadEmpresas(expediente.empresaId);
                    this.loadAgentes(expediente.agenteId);
                    this.loadClientesAgente(expediente.clienteId, expediente.agenteId);
                    this.loadTiposProyecto(expediente.tipoProyectoId);  
                    this.loadExpediente(expediente);
                    $$("fechaOferta").setValue(new Date(expediente.fecha));//fecha por defecto
        
        
                    this.buscaColaboradoresActivos("", "comercialId", "cmbComerciales", expediente.comercialId);
                    this.buscaColaboradoresActivos("", "jefeGrupoId", "cmbJefeGrupo", expediente.jefeGrupoId)
                    //this.buscaColaboradoresActivos("", "jefeObrasId", "cmbJefeObras", expediente.jefeObrasId);
                    //this.buscaColaboradoresActivos("", "oficinaTecnicaId", "cmbOficinaTecnica", expediente.oficinaTecnicaId);
                    this.buscaColaboradoresActivos("", "asesorTecnicoId", "cmbAsesorTecnico", expediente.asesorTecnicoId);

                    var f = new Date(expediente.fecha).getFullYear()
                    this.getReferencia(expediente.referencia + '_PC_' + f);
    
                    //this.loadMantenedores();
                    lineasOferta.loadGrid(null, null, importeObra);
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
                    this.loadAgentes(oferta.agenteId);
                    this.loadEmpresas(oferta.empresaId);
                    this.loadClientesAgente(oferta.clienteId, oferta.agenteId);
                    //this.loadMantenedores(oferta.mantenedorId);
                    this.loadTiposProyecto(oferta.tipoProyectoId);  
                    lineasOferta.loadGrid(oferta.ofertaId, _imprimirWindow, importeObra);
                    $$('valorado').setValue(oferta.valorado);
                    $$('desglosado').setValue(oferta.desglosado);
                    $$('mostrarIva').setValue(oferta.mostrarIva);
    
                    ////
    
                    this.buscaColaboradoresActivos("", "comercialId", "cmbComerciales", oferta.comercialId);
                    this.buscaColaboradoresActivos("", "jefeGrupoId", "cmbJefeGrupo", oferta.jefeGrupoId)
                    //this.buscaColaboradoresActivos("", "jefeObrasId", "cmbJefeObras", oferta.jefeObrasId);
                    //this.buscaColaboradoresActivos("", "oficinaTecnicaId", "cmbOficinaTecnica", oferta.oficinaTecnicaId);
                    this.buscaColaboradoresActivos("", "asesorTecnicoId", "cmbAsesorTecnico", oferta.asesorTecnicoId);
    
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
        this.$scope.show('/top/expedientesForm?expedienteId=' + expedienteId + '&desdeCoste=true');
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
            data.esCoste = 1

            ofertasService.postOferta(data)
                .then((result) => {
                    this.$scope.show('/top/ofertasCosteForm?ofertaId=' + result.ofertaId + "&NEW");
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
            data.total = data.importeCliente;
            data.totalConIva = data.importeCliente;
            data.coste = data.importeCliente;

            ofertasService.putOferta(data, data.ofertaId)
                .then(() => {
                    this.$scope.show('/top/expedientesForm?expedienteId=' + expedienteId + '&desdeCoste=true');
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

    loadAgentes(agenteId) {
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
                var clientes = generalApi.prepareDataForCombo('clienteId', 'nombre', rows);
                var list = $$("cmbClientes").getList();
                list.clearAll();
                list.parse(clientes);
                if (clienteId) {
                    //cliId = clienteId; 
                    $$("cmbClientes").setValue(clienteId);
                    $$("cmbClientes").refresh();
                }else {
                    //cliId = null;
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

    getReferencia(abrev) {
        expedientesService.getSiguienteReferencia(abrev)
                .then( row => {
                    var nuevaReferencia = row;
                    this.$$('referencia').setValue(nuevaReferencia);
                    isLoading = false;
                })
                .catch( err => {
                    messageApi.errorMessageAjax(err);
                });
    }




/*     loadTiposProyecto(tipoProyectoId) {
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
 */

    loadTiposProyecto(tipoProyectoId) {
        tiposProyectoService.getTiposProyecto(usuarioId)
        .then(rows => {
            var tiposProyecto = generalApi.prepareDataForCombo('tipoProyectoId', 'nombre', rows);
            var list = $$("listTiposProyecto"); // Obtener la lista en lugar del combo
    
            list.clearAll(); // Limpiar la lista antes de cargar los nuevos datos
            list.parse(tiposProyecto); // Cargar los datos en la lista
    
            if (tipoProyectoId) {
                list.select(tipoProyectoId); // Selecciona el ítem si hay un ID
                this.loadCapitulos(tipoProyectoId);
            }
        });
    }

    
    loadCapitulos(tipoProyectoId) {
        capituloService.getCapitulosPorGrupo(tipoProyectoId)
        .then(rows => {
            var capitulos = generalApi.prepareDataForCombo('grupoArticuloId', 'nombre', rows);
            var list = $$("listCapitulos"); // Obtener la lista en lugar del combo
    
            list.clearAll(); // Limpiar la lista antes de cargar los nuevos datos
            list.parse(capitulos); // Cargar los datos en la lista
        });
    }

    loadCapituloData(grupoArticuloId) {
        capituloService.getCapitulo(grupoArticuloId)
        .then(row => {
           if(row) {
                let capitulo = row;
                limiteImpObra = capitulo.limiteImpObra
                porcen1 = capitulo.porcen1 / 100;
                porcen2 = capitulo.porcen2 / 100;
                porcen3 = capitulo.porcen3 / 100;
                porcen4 = capitulo.porcen4 / 100;
           }
        });
    }

    loadUnidadesObra(grupoArticuloId) {
        unidadesObraService.getUnidadesObraGrupo(grupoArticuloId)
        .then(rows => {
            var capitulos = generalApi.prepareDataForCombo('articuloId', 'nombre', rows);
            var list = $$("listUnidadesObra"); // Obtener la lista en lugar del combo
    
            list.clearAll(); // Limpiar la lista antes de cargar los nuevos datos
            list.parse(capitulos); // Cargar los datos en la lista
            //ahora buscamos los datos de capitulo
            this.loadCapituloData(grupoArticuloId)
            .then(rows => {
                
            });
            
        });
    }
    
   
    loadAgenteCliente(clienteId) {
        if(clienteId) {
            //cliId = clienteId;
            agentesService.getAgenteCliente(clienteId)
            .then(rows => {
                this.loadAgentes(rows[0].comercialId);
                //this.loadClienteData(clienteId)
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

    /////

    
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
                        popup.show(); 
                    }
    
                    
                })
                .catch(error => {
                    console.error("Error al buscar agentes activos:", error);
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