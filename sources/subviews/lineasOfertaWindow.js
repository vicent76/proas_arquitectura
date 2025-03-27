// locales_afectados_window
// Esta es una vista no webix jet para mostrar al crear o modificar
// la asociación entre un servicio y los locales afectados ligados a el
import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";

import { clientesService } from "../services/clientes_service";
import { tiposIvaService } from "../services/tipos_iva_service";
import { unidadesService } from "../services/unidades_service";
import { ofertasService } from "../services/ofertas_service";
import { articulosService } from "../services/articulos_service";
import { infoTarifasGridWindow } from "../subviews/info_tarifas_grid";
import { OfertasForm } from "../views/ofertasForm";
import { unidadesObraService } from "../services/unidades_obra_service";
import { capituloService } from "../services/capitulo_service";
import { parametrosService } from "../services/parametros_service";

var _lineasOfertaWindowCreated = false;
var translate;
var ofertaId;
var ofertaLineaId;
var articulos;
var cliId;
var antcod = null;
var datosCalculo = null;
var enCarga = false;
var aplicarFormula = false;
var indiceCorrector = 0;
var importeObra = 0;


export const LineasOfertaWindow = {
    getWindow: (app) => {
        if (_lineasOfertaWindowCreated) return; // Evitamos que se cree dos veces la misma venta
        infoTarifasGridWindow.getGridTarifasWindow(app)
        translate = app.getService("locale")._;
        const _view2 = {
            view: "form",
            id: "LineasOfertafrm",
            scroll: "y",
            scroll: true,
            elements: [
                { template: "Linea del oferta", type: "section" },
                
                {
                    view:"fieldset", 
                    label:"GENERAL",
                    id: "general",
                    body: {
                        rows: [
                            
                            {
                                rows: [
                                    {
                                        cols: [
                                            {
                                                view: "text", id: "capituloLinea", name: "capituloLinea", required: true,
                                                label: "Texto del capitulo", labelPosition: "top", disabled: true
                                            }, 
                                        ]
                                    },
                                    {
                                        cols: [
                                            {
                                                view: "text", id: "linea", name: "linea", required: true,
                                                label: "Linea", labelPosition: "top", width:80
                                            },
                                            {
                                                view: "combo", id: "cmbGrupoArticulo", name: "grupoArticuloId", required: true, options: {},
                                                label: "Capítulo", labelPosition: "top", minwidth: 250
                                            },
                                            {
                                                view: "combo", id: "cmbArticulos", name: "articuloId", minwidth: 200,
                                                label: "Unidad constructiva", labelPosition: "top", options:{
                                                    filter:function(item, input){
                                                        var id = item.id;
                                                        var value1= item.value.toLowerCase();
                                                        return value1.indexOf(input) !== -1 ||  id == input;
                                                    },
                                                    
                                                }
                                            },
                                            {
                                                view: "combo", id: "cmbUnidades", name: "unidadId", options: {},
                                                label: "Unidades", labelPosition: "top", width: 120, width: 150
                                            },
                                            {
                                                view: "text", id: "cantidad", name: "cantidad", required: true,
                                                label: "Cantidad", labelPosition: "top", width:100
                                            },
                                            
                                           
                                        ]
                                    },
                                    {
                                        cols: [
                                            {
                                                view: "textarea", id: "descripcion", name: "descripcion",
                                                label: "Descripción", labelPosition: "top", height: 170
                                            }
                                        ]
                                    }
                                ]
                            },
                            
                        ]
                    }
                },
                {
                    
                    view:"fieldset", 
                    label:"CLIENTE",
                    id: "cliente",
                    body: {
                        rows: [
                            {
                                cols: [
                                    {
                                        view: "combo", id: "cmbTiposIva", name: "tipoIvaId", required: true, options: {},
                                        label: "IVA", labelPosition: "top", width: 180, hidden: true
                                    },
                                    {
                                        view: "text", id: "porcentaje", name: "porcentaje",
                                        label: "Porcentaje", labelPosition: "top", minwidth: 80,format: "1.00", hidden: true
                                    },
                                    {
                                        view: "text", id: "importeCliente", name: "importe",
                                        label: "coste/ud", labelPosition: "top", minwidth: 80,
                                        format: {
                                            edit : function(v){ return webix.Number.format(v, webix.i18n); },
                                            parse : function(v){ return webix.Number.parse(v, webix.i18n); }
                                          }
                                    },
                                    {
                                        view: "text", id: "perdto", name: "perdto",
                                        label: "% Descuento", labelPosition: "top", minwidth: 80,
                                        format: {
                                            edit : function(v){ return webix.Number.format(v, webix.i18n); },
                                            parse : function(v){ return webix.Number.parse(v, webix.i18n); }
                                          }
                                    },           
                                ]
                            },
                            {
                                cols: [
                                    {
                                        view: "text", id: "precioCliente", value: 0, name: "precio",  required: true, 
                                        label: "Precio", labelPosition: "top", minWidth: 100, format: "1,00", disabled: true
                                    },
                                    {
                                        view: "text", id: "dto", value: 0, name: "dto",  required: true, disabled: true,
                                        label: "Importe descuento", labelPosition: "top", minWidth: 100, format: "1.00"
                                    },
                                    {
                                        view: "text", id: "coste", name: "coste", disabled: true,
                                        label: "total coste", labelPosition: "top", minwidth: 80,format: "1,00"
                                    }
                                ]
                            }
                        ]
                    }
                },
              
                {
                    margin: 5, cols: [
                        { gravity: 5 },
                        { view: "button", id: "btnCancelarWindowLineaOferta", label: translate("Cancelar"), click: LineasOfertaWindow.cancel, hotkey: "esc" },
                        { view: "button", id: "btnAceptarWindowLineaOferta", label: translate("Aceptar"), click: LineasOfertaWindow.accept, type: "form" }
                    ]
                }
            ]
            
        };
        webix.ui({
            view: "window",
            id: "lineasOfertaWindow",
            position: "top", move: true, resize: true,
            width: 1100,
            height: 700,
            head: {
                view: "toolbar", cols: [
                    {},
                    {
                        view: "icon", icon: "mdi mdi-close", click: () => {
                            $$('lineasOfertaWindow').hide();
                        }
                    }
                ]
            }, modal: true,
            body: _view2
        });
        _lineasOfertaWindowCreated = true; // La ventana se ha creado e informamos al proceso

        //EVENTOS

        $$("cmbGrupoArticulo").attachEvent("onChange", function(newv, oldv){
            if(newv == '') return;
            LineasOfertaWindow.loadGruposArticulo(newv, null)
            LineasOfertaWindow.loadArticulos(newv, null);
            LineasOfertaWindow.crearTextoDeCapituloAutomatico(newv);
            LineasOfertaWindow.loadCapituloData(newv)
         });

         $$("cmbArticulos").attachEvent("onChange", function(newv, oldv){
             if(newv && newv != "") {
                LineasOfertaWindow.cambioArticulo(newv);
             }
         });

         $$("cantidad").attachEvent("onFocus", function(current_view, prev_view){
            $$('cantidad').setValue('');
            $$('precioCliente').setValue(0);
            $$('coste').setValue(0);
        });

        $$("cantidad").attachEvent("onBlur", function(a, b){
            var uni = $$('cantidad').getValue();
            var preCli = $$('importeCliente').getValue();
        
            if(preCli != "") {
                preCli = parseFloat(preCli);
                var precioCli = parseFloat(uni * preCli)
                $$('precioCliente').setValue(parseFloat(precioCli));

                //calculamos el descuento  del cliente
                var dtoCli =  ($$('dto').getValue());
                if(dtoCli != '' || dtoCli > 0) {
                    dtoCli = parseFloat(dtoCli);
                    $$('coste').setValue(precioCli-dtoCli);
                } else {
                    $$('coste').setValue(precioCli);
                }
            }           
         });

         $$("importeCliente").attachEvent("onChange", function(newv, oldv){
            if(newv == "") { newv = 0}
            var preCli = parseFloat(newv);
            var uni = $$('cantidad').getValue();
  
            if(uni != "") {
                var uni = parseFloat(uni);
            }
           
            if(uni != "") {
                var precioCli = parseFloat(uni * preCli)
                $$('precioCliente').setValue(parseFloat(precioCli));
                 //calculamos el descuento  del cliente
                 var dtoCli =  ($$('dto').getValue());
                 if(dtoCli != '' || dtoCli > 0) {
                     dtoCli = parseFloat(dtoCli);
                     $$('coste').setValue(precioCli-dtoCli);
                 } else {
                     $$('coste').setValue(precioCli);
                 }
            }
         });
       

         $$('perdto').attachEvent("onBlur", function(a, b) {
             //calculo en caso de descuento cliente
             var perdto = $$('perdto').getValue();
             var precio =  $$('precioCliente').getValue()
             if((perdto > 0 || perdto != '') && (precio > 0 || precio != '')) {
                perdto = parseFloat(perdto);
                precio =   parseFloat(precio);

                perdto = perdto / 100;
                var descuento = parseFloat(precio * perdto);
                //se calcula el descuento cliente
                $$('dto').setValue(descuento);
                var resultado = parseFloat(precio-descuento);
                $$('coste').setValue(resultado);
            }

         });

        return
    },
    loadWindow: (ofertaid, ofertaLineaid, cliid, grupoArticuloId, articuloId, datoscalculo, importeobra) => {
        ofertaId = ofertaid;
        ofertaLineaId = ofertaLineaid
        cliId = cliid;
        if(datoscalculo) {
            datosCalculo = datoscalculo
        } else {
             parametrosService.getParametros()
                    .then((parametros) => {
                        if(parametros && parametros[0].indiceCorrector) indiceCorrector = parametros[0].indiceCorrector;
                        importeObra = importeobra
                    })
                    .catch((err) => {
                        messageApi.errorMessageAjax(err);
                    }); 
        }
        $$('lineasOfertaWindow').show();
        if (ofertaLineaId) {
            enCarga = true
            LineasOfertaWindow.bloqueaEventos();
        } else {
            $$("cmbGrupoArticulo").blockEvent();
            enCarga = false;
            LineasOfertaWindow.limpiaWindow(grupoArticuloId, articuloId);
        }
        LineasOfertaWindow.loadTiposIva(4);

    },

    limpiaWindow: (grupoArticuloId, articuloId) => {
        $$('porcentaje').setValue(0);
        $$('importeCliente').setValue(0);
        $$('perdto').setValue(0);
        $$('dto').setValue(0);
        $$('coste').setValue(0);
        $$('precioCliente').setValue(0);
        $$('perdto').setValue(0);
        $$('dto').setValue(0);
        $$('descripcion').setValue('');
        if(grupoArticuloId && articuloId) {
            LineasOfertaWindow.loadGruposArticulo(grupoArticuloId, articuloId);
        } else {
            LineasOfertaWindow.loadGruposArticulo(null, null);
        }
        LineasOfertaWindow.loadUnidades(9);
        LineasOfertaWindow.nuevaLinea();
    },

    loadCapituloData(grupoArticuloId) {
        capituloService.getCapitulo(grupoArticuloId)
        .then(row => {
           if(row) {
                datosCalculo = {
                    indiceCorrector: indiceCorrector,
                    porcen1: row.porcen1 / 100,
                    porcen2: row.porcen2 / 100,
                    porcen3: row.porcen3 / 100,
                    porcen4: row.porcen4 / 100,
                    importeObra: importeObra,
                    limiteImpObra: row.limiteImpObra
                }
           }
        });
    },

    calcularCosto() {
        let resultado;
    
        if (datosCalculo.importeObra > datosCalculo.limiteImpObra) {
            resultado = datosCalculo.importeObra * datosCalculo.porcen1;
        } else {
            let porcentaje = datosCalculo.importeObra * datosCalculo.porcen2;
            if (porcentaje < datosCalculo.costeArticulo) {
                resultado = datosCalculo.costeArticulo;
            } else {
                resultado =  (datosCalculo.importeObra * datosCalculo.porcen3) + ( datosCalculo.limiteImpObra - datosCalculo.importeObra) * datosCalculo.porcen4;
            }
        }
    
        resultado * datosCalculo.indiceCorrector;
        $$('importeCliente').setValue(resultado);
        LineasOfertaWindow.desbloqueaEventos();
        enCarga = true;
    },
    
    

    crearTextoDeCapituloAutomatico: (grupoArticuloId) =>  {
        var numeroCapitulo = Math.floor($$('linea').getValue());
        var nombreCapitulo = "Capitulo " + numeroCapitulo + ": ";
        // ahora hay que buscar el nombre del capitulo para concatenarlo
        articulosService.getGrupoArticulos(grupoArticuloId)
        .then ( row => {
            var capituloAntiguo = $$('capituloLinea').getValue();
            nombreCapitulo += row.nombre;
            if(capituloAntiguo != nombreCapitulo) {
                $$('capituloLinea').setValue(nombreCapitulo);
            }
        })
        .catch ( err => {
            messageApi.errorMessageAjax(err);
        });
    },

    nuevaLinea: () => {
        //limpiaDataLinea();
        ofertasService.getSiguienteLinea(ofertaId)
        .then( row => {
            if(row) {
                $$('linea').setValue(row);
            }
        })
        .catch( err => {
            messageApi.errorMessageAjax(err);
        });
    },

    bloqueaEventos: () => {
        $$("importeCliente").blockEvent();
        $$("cmbArticulos").blockEvent();
        $$("cmbGrupoArticulo").blockEvent();

        ofertasService.getLineaOferta(ofertaLineaId)
        .then(data => {
            var datos = data[0]
            $$("LineasOfertafrm").clear();
            $$("LineasOfertafrm").setValues(datos);
            LineasOfertaWindow.loadUnidades(datos.unidadId);
            LineasOfertaWindow.recuperaCapituloId(datos.articuloId, true);
        })
        .catch((err) => {
            messageApi.errorMessageAjax(err);
        });
    },

    recuperaCapituloId: (articuloId) => {
        articulosService.getArticulo(articuloId)
        .then( row => {
            if(row) {
                LineasOfertaWindow.loadGruposArticulo(row.grupoArticuloId, articuloId)
            }
        })
        .catch( err => {
            messageApi.errorMessageAjax(err);
        })
    },

    desbloqueaEventos: () => {
        $$("importeCliente").unblockEvent();
        $$("cmbArticulos").unblockEvent();
        $$("cmbGrupoArticulo").unblockEvent();
    },
    accept: () => {
        if (!$$("LineasOfertafrm").validate()) {
            messageApi.errorMessage("Debe rellenar los campos correctamente");
            return;
        }        
        LineasOfertaWindow.enviaDatos();
    },

    enviaDatos: () => {
                var data = $$("LineasOfertafrm").getValues();
                data = LineasOfertaWindow.formateaDatos(data);
                // controlamos si es un alta o una modificación.
                if (data.ofertaLineaId) {
                    // Es una modificación
                    ofertasService.putLineaOferta(data, data.ofertaLineaId)
                        .then(row => {
                            // Hay que cerrar la ventana y refrescar el grid
                            $$('lineasOfertaWindow').hide();
                            LineasOfertaWindow.refreshGridCloseWindow(ofertaId);
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
                    // es un alta
                    data.ofertaLineaId = 0;
                    ofertasService.postLineaOferta(data)
                    .then(row => {
                        
                        // Hay que cerrar la ventana y refrescar el grid
                        $$('lineasOfertaWindow').hide();
                        LineasOfertaWindow.refreshGridCloseWindow(ofertaId);
                    })
                    .catch((err) => {
                        messageApi.errorMessageAjax(err);
                    });
                } 
       
    },

    formateaDatos(data) {
        delete data.unidades;
        delete data.grupoArticuloId;
        data.ofertaId = ofertaId;
        data.totalLinea = $$('coste').getValue();
        data.porcentajeBeneficio = 0;
        data.porcentajeAgente = 0;
        data.importeProveedor = $$('importeCliente').getValue()
        return data;
    },

    preparaDatos(data) {
        delete data.cmbDescripcion;
        delete data.tipoProfesionalId;
        data.descripcion = $$('descripcion').getValue();
        
        return data;
    },

    updateFacprove: (data, proId) => {
        facturacionService.putLineaFacprove(data,proId)
            .then(rows => {
                return;
            })
            .catch(err => {
                var error = err.response;
                            var index = error.indexOf("Cannot delete or update a parent row: a foreign key constraint fails");
                            if(index != -1) {
                                messageApi.errorRestriccion()
                            } else {
                                messageApi.errorMessageAjax(err);
                            }
            });
    },

    updateFactura: (data) => {
        data.clienteId = $$('cliId').getValue();//añadimos la id del cliente del servico
        facturacionService.putLineaFactura(data)
            .then(rows => {
                return;
            })
            .catch(err => {
                var error = err.response;
                            var index = error.indexOf("Cannot delete or update a parent row: a foreign key constraint fails");
                            if(index != -1) {
                                messageApi.errorRestriccion()
                            } else {
                                messageApi.errorMessageAjax(err);
                            }
            });
    },

    cancel: () => {
        $$('lineasOfertaWindow').hide();
    },
    refreshGridCloseWindow: (ofertaId) => {
        if(ofertaId) {
            
            LineasOfertaWindow.refreshLineas(ofertaId);
            //LineasOfertaWindow.refreshBases(ofertaId);
        } 
    },

    refreshLineas: (ofertaId) => {
        ofertasService.getLineasOferta(ofertaId)
            .then(rows => {
                var total = 0;
                if(rows != null || rows.length > 0) {
                    $$("lineasOfertaGrid").clearAll();
                    $$("lineasOfertaGrid").parse(generalApi.prepareDataForDataTable("ofertaLineaId", rows));
                    var numReg = $$("lineasOfertaGrid").count();
                    $$("ofertasLineasNReg").config.label = "NREG: " + numReg;
                    $$("ofertasLineasNReg").refresh();
                    $$('lineasOfertaWindow').hide();
                    for(var i = 0; i < rows.length; i++) {
                        total = total + rows[i].totalLinea;
                        $$('importeCli').setValue(total);
                    }
                } else {
                    $$('lineasOfertaWindow').hide();
                    $$('importeCli').setValue(total);
                }
            })
            .catch((err) => {
                messageApi.errorMessageAjax(err);
            });

    },

    refreshBases: (ofertaId) => {
        ofertasService.getBasesOferta(ofertaId)
            .then(rows => {
                if(rows.length > 0) {
                    $$("basesOfertaGrid").clearAll();
                    $$("basesOfertaGrid").parse(generalApi.prepareDataForDataTable("ofertaBaseId", rows));
                    var numReg = $$("basesOfertaGrid").count();
                    $$("basesLineasNReg").config.label = "NREG: " + numReg;
                    $$("basesLineasNReg").refresh();
                }else {
                    $$("basesOfertaGrid").clearAll();
                }
            })
            .catch((err) => {
                messageApi.errorMessageAjax(err);
            });
    },



    loadCmbDescripcion(cod) {
        var concepto = $$('descripcion').getValue();
        var codigos = generalApi.prepareDataForCombo('codigoReparacion', 'nombre', articulos);
        var list = $$("cmbDescripcion").getPopup().getList();
        var descripcion = $$('descripcion').getValue();
                list.clearAll();
                list.parse(codigos);
                if (cod) {
                    $$("cmbDescripcion").setValue(cod);
                    $$("cmbDescripcion").refresh();
                   
                        /* if(antcod != cod) {
                            $$('descripcion').setValue($$("cmbDescripcion").getText());
                        } */
                    
                   if(antcod &&  antcod != cod)  {//si  hay valor y el codigo cambia cargamos el concepto co la sdescripción del articulo
                        $$('descripcion').setValue($$("cmbDescripcion").getText());
                    }
                    else if(concepto == "") {
                        $$('descripcion').setValue($$("cmbDescripcion").getText());
                    }
                    antcod = cod
                }
    },
    loadTiposIva: (tipoIvaId) => {
        tiposIvaService.getTiposIva()
            .then(rows => {
                var tiposIva = generalApi.prepareDataForCombo('tipoIvaId', 'nombre', rows);
                tiposIva.push({id:null, value: ""});
                var list = $$("cmbTiposIva").getPopup().getList();
                list.clearAll();
                list.parse(tiposIva);
                $$("cmbTiposIva").setValue(tipoIvaId);
                $$("cmbTiposIva").refresh();
                return;
            })
    },



    loadGruposArticulo: (grupoArticuloId, articuloId) => {
        capituloService.getCapitulos()
            .then(rows => {
                var gruposArticulos = generalApi.prepareDataForCombo('grupoArticuloId', 'nombre', rows);
                var list = $$("cmbGrupoArticulo").getPopup().getList();
                list.clearAll();
                list.parse(gruposArticulos);
                // Buscar el objeto que coincida con grupoArticuloId
            if (grupoArticuloId) {
                let grupoSeleccionado = rows.find(item => item.grupoArticuloId == grupoArticuloId);
                
                if (grupoSeleccionado) {
                    aplicarFormula = grupoSeleccionado.aplicarFormula
                    $$("cmbGrupoArticulo").setValue(grupoArticuloId);
                    $$("cmbGrupoArticulo").refresh();
                    LineasOfertaWindow.loadArticulos(grupoArticuloId, articuloId);
                }
            } else {
                $$("cmbGrupoArticulo").setValue(null);
                $$("cmbGrupoArticulo").refresh();
                LineasOfertaWindow.loadArticulos(null, articuloId);
            }
            return;
        });
},

    loadArticulos: (grupoArticuloId, articuloId) => {
        if(grupoArticuloId) {
            articulosService.getArticulosGrupo(grupoArticuloId)
            .then(rows => {
                 if(rows) {
                    var articulos = generalApi.prepareDataForCombo('articuloId', 'nombre', rows);
                    var list = $$("cmbArticulos").getPopup().getList();
                    list.clearAll();
                    list.parse(articulos);
    
                    $$("cmbArticulos").setValue(articuloId);
                    $$("cmbArticulos").refresh();
                    if(!enCarga) {
                        LineasOfertaWindow.recuperaCosteArticulo(articuloId);
                    } else {
                        LineasOfertaWindow.desbloqueaEventos();
                    }
                 }
            });
        } else {
            articulosService.getArticulos()
            .then(rows => {
                 if(rows) {
                    var articulos = generalApi.prepareDataForCombo('articuloId', 'nombre', rows);
                    var list = $$("cmbArticulos").getPopup().getList();
                    list.clearAll();
                    list.parse(articulos);
    
                    $$("cmbArticulos").setValue(articuloId);
                    $$("cmbArticulos").refresh();
    
                    LineasOfertaWindow.desbloqueaEventos()
                 }
            });
        }
    },

    loadUnidades: (unidadId) => {
        unidadesService.getUnidades()
            .then(rows => {
                var unidades = generalApi.prepareDataForCombo('unidadId', 'abrev', rows);
                var list = $$("cmbUnidades").getPopup().getList();
                list.clearAll();
                list.parse(unidades);
                $$("cmbUnidades").setValue(unidadId);
                $$("cmbUnidades").refresh();
                return;
            })
    },


    cambioArticulo: (articuloId) => {
        articulosService.getArticulo(articuloId)
        .then ( row => {
            if(row) {
                $$("cmbUnidades").setValue(row.unidadId);
                $$("cmbUnidades").refresh();
                $$('descripcion').setValue(row.descripcion);
                $$('cantidad').setValue(1);
                LineasOfertaWindow.recuperaCosteArticulo(articuloId);
            }
        })
        .catch( err => {
            messageApi.errorMessageAjax(err);
        });
    },

    cambioTipoIva: (tipoIvaId) => {
        tiposIvaService.getTipoIva(tipoIvaId)
            .then(row => {
               if(row) {
                   $$('porcentaje').setValue(row.porcentaje);
               }
            })
    },

    recuperaCosteArticulo(articuloId) {
        if(!articuloId) return;
        unidadesObraService.getUnidadObra( articuloId )
        .then( row => {
            if(row) {
                if(aplicarFormula) {
                    datosCalculo.costeArticulo = row.coste;
                    LineasOfertaWindow.calcularCosto();
                } else {
                    $$('importeCliente').setValue(row.coste);
                    LineasOfertaWindow.desbloqueaEventos();
                }
            }
        })
        .catch( err => {
            var error = err.response;
                            var index = error.indexOf("Cannot delete or update a parent row: a foreign key constraint fails");
                            if(index != -1) {
                                messageApi.errorRestriccion()
                            } else {
                                messageApi.errorMessageAjax(err);
                            }
        })
    },


}