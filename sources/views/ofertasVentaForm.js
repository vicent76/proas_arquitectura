import { JetView } from "webix-jet";
import { usuarioService } from "../services/usuario_service";
import { clientesService } from "../services/clientes_service";
import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { ofertasService } from "../services/ofertas_service";
import { formasPagoService } from "../services/formas_pago_service";
import { tiposProyectoService } from "../services/tipos_proyecto_service"
import { languageService} from "../locales/language_service";
import { empresasService } from "../services/empresas_service";
import { lineasOfertaVenta } from "../subviews/lineasOfertaVentaGrid";
import OfertasEpisReport  from "./ofertasEpisReport";
import { expedientesService } from "../services/expedientes_service";
import { parametrosService } from "../services/parametros_service";
import { textosPredeterminadosService } from "../services/textosPredeterminados_service"
import { agentesService } from "../services/agentes_service";

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
var importeObra = 0;
var tipoProyectoId;
var agenteId = 0;
var comercialId = 0;
var jefeGrupoId = 0;
var jefeObrasId = 0;
var oficinaTecnicaId = 0;
var asesorTecnicoId = 0;
//
var coste = 0;
var importeBeneficio = 0;
var ventaNeta = 0;
var importeAgente = 0

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
                                scroll:"xy",
                                id: "frmOfertas",
                                minWidth: 500,
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
                                                view: "combo", id: "cmbPresupuestosCoste", name: "ofertaCosteId", 
                                                label: "Presupuesto de coste", labelPosition: "top", options:{},
                                                on: {
                                                    "onChange": (newv, oldv) => {
                                                        if (isLoading) return; 
                                                        var id = newv;
                                                        this.loadLienasCosteData(id);
                                                    }
                                                }
                                            },
                                            {
                                                view: "text", id: 'increMediciones', name:'increMediciones', width: 180,
                                                label:  'Incr. mediciones (%)', labelPosition: "top", value: 0 ,format: "1,00"
                                                 
                                            },
                                            {
                                                view: "text", id: 'porcentajeBeneficio', name:'porcentajeBeneficio', width: 180,
                                                label:  'Incr. beneficio ind. (%)', labelPosition: "top", value: 0 ,format: "1,00",
                                                on:{
                                                    "onTimedKeyPress": () => {
                                                        this.calculaBI()
                                                    }
                                                }
                                                 
                                            },
                                            {
                                                view: "text", id: 'porcentajeAgente', name:'porcentajeAgente', width: 180,
                                                label:  'Incr. comercial (%)', labelPosition: "top", value: 0 ,format: "1,00",
                                                on:{
                                                    "onTimedKeyPress": () => {
                                                        this.calculaBI()
                                                    }
                                                }
                                                 
                                            },
                                        ]
                                    },
                                    {
                                        cols: [
                                         
                                           // Columna: Conceptos excluidos
                                           {
                                            rows: [
                                              {
                                                cols: [
                                                  {
                                                    view: "richselect",
                                                    id: "cmbTitulos",
                                                    name: "tituloId",
                                                    label: "Título",
                                                    width: 400,       // Controla el ancho total del campo
                                                    gravity: 1,
                                                    options: {},
                                                    on: {
                                                      onChange: function (newId) {
                                                        this.$scope.cambioTextosPredeterminadosTitulos(newId);
                                                      }
                                                    }
                                                  },
                                                  {} // Espacio vacío para completar la fila
                                                ]
                                              },
                                              {
                                                view: "textarea",
                                                id: "tituloTexto",
                                                name: "tituloTexto",
                                                required: true,
                                                height: 155,
                                                labelWidth: 150
                                              }
                                            ]
                                          }
                                          
                                        ]
                                      },
                                      {
                                        cols: [
                                          // Columna 1: Sistema de pago
                                          {
                                            gravity: 1,
                                            rows: [
                                              {
                                                cols: [
                                                  {
                                                    view: "richselect",
                                                    id: "cmbSistemaPago",
                                                    name: "sistemaPagoId",
                                                    label: "Sistema de pago",
                                                    labelWidth: 150, // Ajusta el ancho del label para evitar cortes
                                                    options: {},
                                                    gravity: 1, // Ocupa la mitad del espacio
                                                    width: 400,       // Controla el ancho total del campo
                                                    on: {
                                                      onChange: function (newId) {
                                                        this.$scope.cambioTextosPredeterminados(newId);
                                                      }
                                                    }
                                                  },
                                                  {} // espacio vacío para completar la fila
                                                ]
                                              },
                                              {
                                                view: "textarea",
                                                id: "sistemaPago",
                                                name: "sistemaPago",
                                                height: 155,
                                                labelWidth: 150, // Asegura que el label sea del mismo tamaño que el de richselect
                                              }
                                            ]
                                          },
                                      
                                          // Columna 2: Conceptos excluidos
                                          {
                                            gravity: 1,
                                            rows: [
                                              {
                                                cols: [
                                                  {
                                                    view: "richselect",
                                                    id: "cmbConceptosExcluidos",
                                                    name: "conceptoExcluidoId",
                                                    label: "Conceptos excluidos",
                                                    labelWidth: 150, // Igual al de la columna anterior
                                                    width: 400,       // Controla el ancho total del campo
                                                    options: {},
                                                    gravity: 1,
                                                    on: {
                                                      onChange: function (newId) {
                                                        this.$scope.cambioTextosPredeterminadosExcluidos(newId);
                                                      }
                                                    }
                                                  },
                                                  {} // espacio vacío
                                                ]
                                              },
                                              {
                                                view: "textarea",
                                                id: "conceptosExcluidos",
                                                name: "conceptosExcluidos",
                                                height: 155,
                                                labelWidth: 150, // Iguala el ancho del label
                                              }
                                            ]
                                          },
                                      
                                          // Columna 3: Observaciones (ajustado)
                                          {
                                            gravity: 1,
                                            rows: [
                                              {}, // Espacio arriba para alinear con otros elementos
                                              {
                                                rows: [
                                                    {
                                                        template: "Observaciones",
                                                        type: "clean",     // Elimina bordes y padding extra
                                                        css: { "font-weight": "500", "padding-left": "6px" },
                                                        height: 20
                                                      },
                                                  {
                                                    height: 5 // Espacio entre la label y el textarea
                                                  },
                                                  {
                                                    view: "textarea",
                                                    id: "observaciones",
                                                    name: "observaciones",
                                                    height: 155,
                                                    gravity: 1
                                                  }
                                                ]
                                              }
                                            ]
                                          },
                                          
                                      
                                          // Columna 4: Botones
                                          {
                                            gravity: 1,
                                            rows: [
                                              {
                                                template: "", height: 38 // espacio para alinear con los demás elementos
                                              },
                                              {
                                                padding: 10,
                                                rows: [
                                                  {
                                                    align: "center",
                                                    cols: [
                                                      {
                                                        view: "button",
                                                        label: "Cancelar",
                                                        click: this.cancel,
                                                        hotkey: "esc",
                                                        css: "webix_danger",
                                                        width: 80
                                                      },
                                                      {
                                                        view: "button",
                                                        label: "Guardar",
                                                        click: () => this.accept(true),
                                                        css: "webix_primary",
                                                        type: "form",
                                                        width: 80
                                                      }
                                                    ]
                                                  },
                                                  {
                                                    align: "center",
                                                    cols: [
                                                      {
                                                        view: "button",
                                                        label: "Guardar sin salir",
                                                        click: () => this.accept(false),
                                                        type: "form",
                                                        width: 160
                                                      }
                                                    ]
                                                  },
                                                  {
                                                    align: "center",
                                                    cols: [
                                                      {
                                                        view: "button",
                                                        label: "Imprimir oferta",
                                                        id: "btnImprimir",
                                                        type: "form",
                                                        width: 160
                                                      }
                                                    ]
                                                  }
                                                ]
                                              }
                                            ]
                                          }
                                        ]
                                      },
                                      
                                     
                                      
                                      
                                      
                                          // Botones debajo de todo
                                         
                                          
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
       this.imprimirWindow = this.ui(OfertasEpisReport);
        $$('btnImprimir').attachEvent("onItemClick", function(id, e, node){
            var empresaId = $$('cmbEmpresas').getValue();
                    empresasService.getEmpresa(empresaId)
                    .then((data)=> {
                        if(!data.infOfertas) { 
                            messageApi.errorMessage('Esta empresa no tiene plantilla de oferta asociada');
                            return
                        } else {
                            var rep = data.infOfertas;
                            //var rep = 'oferta_general'
                            var file = "/stireport/reports/"+ rep +".mrt";
                            this.$scope.imprimirWindow.showWindow(ofertaId, file);
                            
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
                    })
                       
        });
        this.cargarEventos();
    }
    
       
    urlChange(view, url) {
        if (url[0].params.NEW) {
            messageApi.normalMessage('Oferta guardada correctamente.')
        }
        if (url[0].params.MOD) {
            messageApi.normalMessage('Oferta guardada correctamente.')
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
            if (ofertaId == 0 && expedienteId > 0) {
                expedientesService.getExpediente(expedienteId)
                .then((expediente) => {
                    tipoProyectoId = expediente.tipoProyectoId
                    this.loadEmpresas(expediente.empresaId);
                    this.loadExpediente(expediente);
                    this.loadPresupuestosCoste(expedienteId, null);
                    this.loadClientes(expediente.clienteId);
                    this.loadFormasPago(expediente.formaPagoId);
                    this.loadSistemaPago(expediente.empresaId, null);
                    this.loadConceptosExcluidos(expediente.empresaId, null);
                    this.loadTitulos(expediente.empresaId, null);
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
            isLoading = true; // Se activa el flag antes de cargar datos
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
                    this.loadFormasPago(oferta.formaPagoId);
                    $$('valorado').setValue(oferta.valorado);
                    $$('desglosado').setValue(oferta.desglosado);
                    $$('mostrarIva').setValue(oferta.mostrarIva);
                    this.loadSistemaPago(oferta.empresaId, oferta.sistemaPagoId);
                    this.loadConceptosExcluidos(oferta.empresaId, oferta.conceptoExcluidoId);
                    this.loadTitulos(oferta.empresaId, oferta.tituloId);
                    expedientesService.getExpediente(expedienteId)
                    .then((expediente) => {
                       
                        this.loadExpediente(expediente);
                        isLoading = false; 
                        
                    })
                    .catch((err) => {
                        messageApi.errorMessageAjax(err);
                    }); 
                    
                })
                .catch((err) => {
                    messageApi.errorMessageAjax(err);
                }); 
        
    }

    calculaBI() {
        var porcentajeBeneficioLinea  = $$('porcentajeBeneficio').getValue()  / 100 || 0;
        var datatable = $$("lineasOfertaVentaGrid");

        var totaAlCliente = 0;
        datatable.eachRow(function (rowId) {
            var row = datatable.getItem(rowId);
           
            var precio = parseFloat(row.costeLinea) || 0;
            var cantidad = parseFloat(row.cantidad) || 0;
          
            var porcentajeAgente = parseFloat($$('porcentajeAgente').getValue());
          

            var importeBeneficioLinea = porcentajeBeneficioLinea * precio;
            var importe = precio / cantidad;
            var ventaNeta =  precio + importeBeneficioLinea;

            var totalLinea = ventaNeta / ((100 - porcentajeAgente) / 100);
            var importeAgenteLinea = totalLinea - (precio + importeBeneficioLinea);
            

            totaAlCliente = totaAlCliente + totalLinea;
            row.totalLinea = totalLinea;
            row.importeAgenteLinea = importeAgenteLinea;
            row.porcentajeBeneficioLinea = porcentajeBeneficioLinea * 100;
            row.importeBeneficioLinea = importeBeneficioLinea;
            row.importe = importe;
            row.precio = precio;
            row.coste = precio;
            row.ventaNetaLinea = ventaNeta;
            

            datatable.updateItem(rowId, row);
        });
        $$('importeCli').setValue(totaAlCliente);
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
    
    accept(opcion) {
        if (!$$("frmOfertas").validate()) {
            messageApi.errorMessage("Debe rellenar los campos correctamente");
            return;
        }
        var data = $$("frmOfertas").getValues();

        delete data.increMediciones;
        delete data.textoPredeterminadoId;
        if(data.sistemaPagoId == '') data.sistemaPagoId = null;
        if(data.conceptoExcluidoId == '') data.conceptoExcluidoId = null;
        if (ofertaId == 0) {
            var datalineas = $$("lineasOfertaVentaGrid").serialize();

            console.log(datalineas);
            if(datalineas.length > 0) {
                data.lineas = this.limpiaDatalineas(datalineas, 'POST');
            }
         
            
    
            data.tipoProyectoId = tipoProyectoId;
            data.ofertaId = 0;
            data.tipoOfertaId = 5
            data.importeMantenedor = 0
            data.mantenedorId  = null;
            data.expedienteId = expedienteId;
            data.coste = coste;
            data.importeBeneficio = importeBeneficio;
            data.ventaNeta = ventaNeta
            data.importeAgente = importeAgente;
            data.esCoste = 0
            //
            data.agenteId = agenteId;
            data.comercialId = comercialId;
            data.jefeGrupoId = jefeGrupoId;
            data.jefeObrasId = jefeObrasId;
            data.oficinaTecnicaId = oficinaTecnicaId;
            data.asesorTecnicoId = asesorTecnicoId;

            ofertasService.postOfertaVenta(data)
            .then((result) => {
                this.show('/top/ofertasVentaForm?ofertaId=' + result.ofertaId + "&NEW");
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
            var datalineas = $$("lineasOfertaVentaGrid").serialize();

            console.log(datalineas);
            if(datalineas.length > 0) {
                data.lineas = this.limpiaDatalineas(datalineas, 'PUT');
            }
         
            delete data.direccion;
            delete data.codpostal;
            delete data.poblacion;
            delete data.provincia;
            delete data.tipoViaId;
            delete data.comercialCliente;
            //
            data.importeMantenedor = 0
            ofertasService.putOfertaVenta(data)
                .then(() => {
                    if(opcion) {
                        this.show('/top/expedientesForm?expedienteId=' + expedienteId + '&ofertaVentaId=' + data.ofertaId +  '&desdeVenta=true');
                    } else {
                        this.show('/top/ofertasVentaForm?ofertaId=' + data.ofertaId + "&MOD");
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

    limpiaDatalineas(lineas, command) {
        let newL = [];
        coste = 0;
        importeBeneficio = 0;
        ventaNeta = 0;
        importeAgente = 0;
        for(let l of lineas) {
            let lin = {
                ofertaLineaId: 0,
                ofertaId: 0,
                linea: l.linea,
                unidadId: l.unidadId,
                articuloId: l.articuloId,
                tipoIvaId: l.tipoIvaId,
                porcentaje: l.porcentaje,
                descripcion: l.descripcion,
                cantidad: l.cantidad,
                importe: l.importe,
                totalLinea: l.totalLinea,
                coste: l.coste,
                porcentajeBeneficio: l.porcentajeBeneficioLinea,
                importeBeneficioLinea: l.importeBeneficioLinea,
                porcentajeAgente: l.porcentajeAgente,
                importeAgenteLinea: l.importeAgenteLinea,
                ventaNetaLinea: l.ventaNetaLinea,
                capituloLinea: l.capituloLinea,
                proveedorId: l.proveedorId,
                importeProveedor: l.importeProveedor,
                totalLineaProveedor: l.totalLineaProveedor,
                costeLineaProveedor: l.importeProveedor,
                tipoIvaProveedorId: l.tipoIvaProveedorId,
                porcentajeProveedor: l.porcentajeProveedor,
                precio: l.precio,
                perdto: l.perdto,
                perdtoProveedor: l.perdtoProveedor,
                dto: l.dto,
                precioProveedor: l.precioProveedor,
                dtoProveedor: l.dtoProveedor,
                totalLineaProveedorIva: l.totalLineaProveedorIva,
                esTarifa: l.esTarifa
            }
            coste = coste + l.coste;
            importeBeneficio = importeBeneficio + l.importeBeneficioLinea
            ventaNeta = ventaNeta + l.ventaNetaLinea;
            importeAgente = importeAgente + l.importeAgenteLinea
            if(command == 'PUT') {
                lin.ofertaId = l.ofertaId;
                lin.ofertaLineaId  = l.ofertaLineaId;
            }
            newL.push(lin);
        }
        return newL;
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

    loadSistemaPago(empresaId, sistemaPagoId) {
        textosPredeterminadosService.getTextosTiposPago(1, empresaId, 5)
        .then( (rows) => {
            var textos = generalApi.prepareDataForCombo('textoPredeterminadoId', 'abrev', rows);
            var list = $$("cmbSistemaPago").getPopup().getList();
            list.clearAll();
            list.parse(textos);
            if(sistemaPagoId) {
                $$("cmbSistemaPago").setValue(sistemaPagoId);
                $$("cmbSistemaPago").refresh();
                return
            }
            $$("cmbSistemaPago").setValue(null);
            $$("cmbSistemaPago").refresh();
        })
        .catch( (err) => {
            messageApi.errorMessageAjax(err);
        })
    }

    loadConceptosExcluidos(empresaId, conceptoExcluidoId) {
        textosPredeterminadosService.getTextosExcluidos(2, empresaId, 5)
        .then( (rows) => {
            var textos = generalApi.prepareDataForCombo('textoPredeterminadoId', 'abrev', rows);
            var list = $$("cmbConceptosExcluidos").getPopup().getList();
            list.clearAll();
            list.parse(textos);
            if(conceptoExcluidoId) {
                $$("cmbConceptosExcluidos").setValue(conceptoExcluidoId);
                $$("cmbConceptosExcluidos").refresh();
                return
            }
            $$("cmbConceptosExcluidos").setValue(null);
            $$("cmbConceptosExcluidos").refresh();
        })
        .catch( (err) => {
            messageApi.errorMessageAjax(err);
        })
    }

    cambioTextosPredeterminados(id) {
        if (!id) {
            return;
        }
        textosPredeterminadosService.getTexto(id)
        .then( (row) => {
            $$("sistemaPago").setValue(row.texto);
        })
        .catch( (err) => {
            messageApi.errorMessageAjax(err);
        })
    }

    cambioTextosPredeterminadosExcluidos(id) {
        if (!id) {
            return;
        }
        textosPredeterminadosService.getTexto(id)
        .then( (row) => {
            $$("conceptosExcluidos").setValue(row.texto);
        })
        .catch( (err) => {
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
            messageApi.errorMessageAjax(err);
        });
    }

    loadLienasCosteData(presupuestoCosteId) {
        ofertasService.getLineasOferta(presupuestoCosteId)
        .then( (rows) => {
            if(rows.length == 0) {
                messageApi.errorMessage("El presupuesto de coste seleccionado no tiene partidas.");
                lineasOfertaVenta.loadGrid(ofertaId, _imprimirWindow, rows)
                return;
            }
            this.asignaColaboradores(rows[0])
            this.obtenerPorcentajeDelAgente(rows[0].agenteId, rows[0].empresaId, rows[0].tipoOfertaId);
            this.obtenerPorcentajeBeneficio();
            lineasOfertaVenta.loadGrid(ofertaId, _imprimirWindow, rows);
            this.loadDatos(rows[0]);
        })
        .catch( (err) => {
            messageApi.errorMessageAjax(err);
        })
    }

    asignaColaboradores(data) {
        agenteId = data.agenteId;
        comercialId =data.comercialId;
        jefeGrupoId = data.jefeGrupoId;
        jefeObrasId =data.jefeObrasId;
        oficinaTecnicaId = data.oficinaTecnicaId;
        asesorTecnicoId = data.asesorTecnicoId;
    }

    obtenerPorcentajeDelAgente(agenteId, empresaId, departamentoId) {
        agentesService.getComisionAgente(agenteId, empresaId, departamentoId)
        .then( (row) => {
            if(!row) {
                $$('porcentajeAgente').setValue(0);
            } else {
                $$('porcentajeAgente').setValue(row);
            }
        })
        .catch( (err) => {
            messageApi.errorMessageAjax(err);
        })
    }


    obtenerPorcentajeBeneficio(agenteId, empresaId, departamentoId) {
        parametrosService.getParametros()
        .then( (parametros) => {
            if(!parametros) {
                $$('porcentajeBeneficio').setValue(0);
            } else {
                $$('porcentajeBeneficio').setValue(parametros[0].margenArquitectura);
            }
        })
        .catch( (err) => {
            messageApi.errorMessageAjax(err);
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

    loadDatos(data) {
        $$('valorado').setValue(data.valorado);
        $$('desglosado').setValue(data.desglosado);
        $$('mostrarIva').setValue(data.mostrarIva);
    }

     
    loadTitulos(empresaId, tituloId) {
        textosPredeterminadosService.getTitulos(3, empresaId, 5)
        .then( (rows) => {
            var textos = generalApi.prepareDataForCombo('textoPredeterminadoId', 'abrev', rows);
            var list = $$("cmbTitulos").getPopup().getList();
            list.clearAll();
            list.parse(textos);
            if(tituloId) {
                $$("cmbTitulos").setValue(tituloId);
                $$("cmbTitulos").refresh();
                return
            }
            $$("cmbTitulos").setValue(null);
            $$("cmbTitulos").refresh();
        })
        .catch( (err) => {
            messageApi.errorMessageAjax(err);
        })
    }

        cambioTextosPredeterminadosTitulos(id) {
            if (!id) {
                return;
            }
            textosPredeterminadosService.getTexto(id)
            .then( (row) => {
                var compose = "PRESUPUESTO REF. " + $$('cmbPresupuestosCoste').getText() + " " + row.texto
                $$("tituloTexto").setValue(compose);
            })
            .catch( (err) => {
                messageApi.errorMessageAjax(err);
            })
        }
    
}