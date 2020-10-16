import { JetView } from "webix-jet";
import { usuarioService } from "../services/usuario_service";
// import { clientesService } from "../services/clientes_service";
// import { tiposProfesionalService } from "../services/tiposProfesional_service";
import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
// import { agentesService } from "../services/agentes_service";

import { languageService} from "../locales/language_service";
//import { empresasService } from "../services/empresas_service";


var ofertaId = 0;
var parteId = 0;
var usuarioId;
var usuario;
var _servicio;
var cliId = null;
var limiteCredito = 0;
var importeCobro = 0;


export default class OfertasForm extends JetView {
    config() {
        const translate = this.app.getService("locale")._;

        const _view = {
            view: "tabview",
            cells: [
                {
                    header:  "Oferta",
                    body: {
                        //solapa servicios
                        view: "layout",
                        id: "ofertasForm",
                        multiview: true,
                        rows: [
                            {
                                view: "toolbar", padding: 3, elements: [
                                    { view: "icon", icon: "mdi mdi-transcribe", width: 37, align: "left" },
                                    { view: "label", label: "Avisos" }
                                ]
                            },
                            {
                                view: "form",
                                scroll:"y",
                                id: "frmOfertas",
                                elements: [
                                    {
                                        cols: [
                                            {
                                                view: "text", id: "ofertaId", name: "ofertaId", hidden: true,
                                                label: "ID", labelPosition: "top", width: 50, disabled: true
                                            },
                                            {
                                                view: "text", id: "referencia", name: "referencia", disabled: true,
                                                label: "Referencia", labelPosition: "top", width:250
                                            },
                                            {
                                                view: "combo", id: "cmbEmpresas", name: "empresaId", required: true, options: {},
                                                label: "Empresa", labelPosition: "top", width: 350
                                            },
                                            {
                                                view: "datepicker", id: "fechaOferta", name: "fechaOferta",  width: 150,
                                                label: "Fecha de Solicitud", labelPosition: "top"
                                            },
                                            {
                                                view: "combo", id: "cmbTipoProyecto", name: "tipoProyectoId",required: true, 
                                                label: "Tipo proyecto", labelPosition: "top", minWidth: 350,
                                                options:{}
                                            }
                                        ]
                                    },
                                    {
                                        cols: [
                                            {
                                                view: "combo", id: "cmbProId", name: "proId",required: true, 
                                                label: "Cliente", labelPosition: "top", width: 130,
                                                options:{}
                                            },
                                            {
                                                view: "combo", id: "cmbClientes", name: "clienteId", required: true,
                                                label: "Nombre Cliente (empezar busquedas con @)", labelPosition: "top",
                                                suggest:{
                                                    view:"mentionsuggest",
                                                    id: "clientesList",
                                                    data: [] 
                                                }        
                                            },
                                            {
                                                view: "combo", id: "cmbAgentes", name: "agenteId", required: true,
                                                label: "Agente (empezar busquedas con @)", labelPosition: "top",
                                                suggest:{
                                                    view:"mentionsuggest",
                                                    id: "agentesList",
                                                    data: [] 
                                                }        
                                            }, 
                                           
                                           
                                            
                                            
                                            
                                           
                                            
                                        ]
                                    },
                                    
                                    {
                                        cols: [
                                            {
                                                view: "text", id: "direccionTrabajo", name: "direccionTrabajo", required: true, width: 250,
                                                label: "Direccion de trabajo", labelPosition: "top"
                                            },
                                            {
                                                view: "combo", id: "cmbTiposProfesional", name: "tipoProfesionalId", options: {},
                                                label: "Profesión", labelPosition: "top", width: 150
                                            },
                                            
                                        ]
                                    },
                                    //_partes_grid,
                                    {minheight: 600},
                                    {
                                        cols: [
                                           
                                            {
                                                view: "textarea", id: "observacionesAgente", name: "observacionesAgente",
                                                label: "Observaciones del agente", labelPosition: "top", height: 60
                    
                                            },
                                            {
                                                rows: [
                                                    {
                                                        padding: 20,cols: [
                                                            
                                                            { view: "button", label: "Cancelar", click: this.cancel, hotkey: "esc" },
                                                            { view: "button", label: "Aceptar", click: this.accept, type: "form" }
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                   
                                    //_localesAfectados,
                                    { minheight: 600 },
                                ]
                            }
                        ],
                        scroll:true
                    }
                },
                {
                    header:  "Lineas proveedores",
                    body: {
                        rows:[
                            
                        ]
                    }
                }
    ]
        }
        return _view;
    }
    init(view, url) {
        //this.cargarEventos();
    }
    
       
    urlChange(view, url) {
        
        if (url[0].params.NEW) {
            messageApi.normalMessage('Aviso creado correctamente, puede crear ahora los locales asociados. Se ha creado un parte por defecto para este Aviso.')
        }
        usuario = usuarioService.checkLoggedUser();
        usuarioId = usuario.usuarioId;
        languageService.setLanguage(this.app, 'es');
        if (url[0].params.ofertaId) {
            ofertaId = url[0].params.ofertaId;
        }
        this.load(ofertaId);

        //this.cargarEventos()
    }
    load(ofertaId) {
        /* if (ofertaId == 0) {
            this.loadEmpresas();
            this.loadAgentes();
            this.loadClientes();
            this.loadProId();
            this.loadUsuarios(usuario.usuarioId);//cargamos el usuario logado por defecto
           
            
            $$("fechaOferta").setValue(new Date());//fecha por defecto

             var fecha = new Date();
             var fechaStr = webix.i18n.timeFormatStr(fecha);
             fechaStr = fechaStr.replace(/\:/, '');
             $$('horaEntrada').setValue(fechaStr); //hora por defecto
            anticiposProveedor.loadGrid(ofertaId);
            anticiposCliente.loadGrid(ofertaId);
            return;
        }
        ofertasService.getOferta(ofertaId)
            .then((servicio) => {
                _servicio = servicio;
                servicio.fechaOferta = new Date(servicio.fechaOferta);
                $$("frmOfertas").setValues(servicio);
                //this.loadTiposProfesional(servicio.tipoProfesionalId);
                this.loadAgentes(servicio.agenteId);
                this.loadEmpresas(servicio.empresaId);
                this.loadClientesAgente(servicio.clienteId, servicio.agenteId);
                this.loadProId(servicio.clienteId, servicio.agenteId)
                this.loadUsuarios(servicio.usuarioId);
                localesAfectados.loadGrid(ofertaId);
                partesGrid.loadEstadosParte(ofertaId);
                this.compruebaCobrosCliente(servicio.clienteId);
                anticiposProveedor.loadGrid(ofertaId);
                anticiposCliente.loadGrid(ofertaId);
                
                //this.show("./localesAfectados?ofertaId=" + ofertaId);
            })
            .catch((err) => {
                var error = err.response;
                            var index = error.indexOf("Cannot delete or update a parent row: a foreign key constraint fails");
                            if(index != -1) {
                                messageApi.errorRestriccion()
                            } else {
                                messageApi.errorMessageAjax(err);
                            }
            }); */
    }

    cargarEventos() {
        this.$$("cmbClientes").attachEvent("onChange", (newv, oldv) => {
            if(newv == oldv || newv == null) {
                return;
            } else {
                this.loadClienteData(newv, oldv);
                //if(!cambioAgente) {
                    this.loadAgenteCliente(newv);
                //}
               
            }
        });

      
        $$("cmbAgentes").attachEvent("onChange", (newv, oldv, obj) => {
            var id = $$('cmbAgentes').getValue();
            if(newv == null) { newv = oldv}
            if(cliId) {
                this.loadClientesAgente(cliId, id);
                this.loadProId(cliId, id);
            }else {
                this.loadClientesAgente(null, newv);
                this.loadProId(null, newv);
                $$("direccionTrabajo").setValue(null);
            }
            //cambioAgente = true
        });

        this.$$("cmbProId").attachEvent("onChange", (newv, oldv) => {
            if(newv == oldv || newv == null) {
                return;
            } else {
                this.loadClientesAgente(newv, $$('cmbAgentes').getValue());
            }
        });

        $$("horaEntrada").attachEvent("onItemClick", function(){
            $$('horaEntrada').setValue(null);
         });

       
         
    }

    cancel() {
        this.$scope.show('/top/ofertas');
    }
    accept() {
        const translate = this.$scope.app.getService("locale")._;
        if (!$$("frmOfertas").validate()) {
            messageApi.errorMessage("Debe rellenar los campos correctamente");
            return;
        }
        var data = $$("frmOfertas").getValues();
        if(data.usuarioId == "") {
            data.usuarioId = null;
        }
        delete data.proId;
        //formateamos la hora en formato base de datos
        var horaEnt = data.horaEntrada;
        var hora = horaEnt.slice(0, 2 );
        var minuto = horaEnt.slice(2);
        data.horaEntrada = hora + ":" + minuto
        if(!data.tipoProfesionalId) {
            delete data.tipoProfesionalId;
        }
        if (ofertaId == 0) {
            data.ofertaId = 0;
            
            data.nombreCliente = $$('cmbClientes').data.text;
            serviciosService.postServicio(data)
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
            data.nombreCliente = $$('cmbClientes').data.text
            serviciosService.putServicio(data)
                .then(() => {
                    this.$scope.show('/top/servicios?ofertaId=' + data.ofertaId);
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
        if(clienteId) {
            cliId = clienteId;   
        } else {
            cliId = null;
        }
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
            cliId = null;
            return;
        });
}
    loadClientesAgente(clienteId, agenteId) {
        if(agenteId) {
            clientesService.getClientesAgenteActivos(agenteId)
            .then(rows => {
                var servicios = generalApi.prepareDataForCombo('clienteId', 'nombre', rows);
                var list = $$("clientesList").getList();
                list.clearAll();
                list.parse(servicios);
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

    loadProId(clienteId, agenteId) {
        if(agenteId) {
            clientesService.getClientesAgenteActivos(agenteId)
            .then(rows => {
                var clientes = generalApi.prepareDataForCombo('clienteId', 'proId', rows);
                var list = $$("cmbProId").getPopup().getList();
                list.clearAll();
                list.parse(clientes);
                if (clienteId) {
                    $$("cmbProId").setValue(clienteId);
                    $$("cmbProId").refresh();
                }else {
                    $$("cmbProId").setValue(null);
                    $$("cmbProId").refresh();
                }
                return;
            });
        } else {
            clientesService.getClientesActivos()
            .then(rows => {
                var clientes = generalApi.prepareDataForCombo('clienteId', 'proId', rows);
                var list = $$("cmbProId").getPopup().getList();
                list.clearAll();
                list.parse(clientes);
                    $$("cmbProId").setValue(null);
                    $$("cmbProId").refresh();
                
                return;
            });
        }
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
            return;
        });
    }

    loadClienteData(clienteId, antiguoCliId) {
        if(clienteId) {
            //if (ofertaId != 0) return;
            clientesService.getCliente(clienteId)
            .then(rows => {
                if(ofertaId == 0) {
                    $$("direccionTrabajo").setValue(rows.direccion2);
                } else {
                    if(antiguoCliId != "" && antiguoCliId != null) {
                        $$("direccionTrabajo").setValue(rows.direccion2);
                    } else {
                        $$("direccionTrabajo").setValue(_servicio.direccionTrabajo);
                    }
                }
                this.loadProId(clienteId, $$('cmbAgentes').getValue());
                return;
            });
        }
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
        serviciosService.getNumServicio()
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