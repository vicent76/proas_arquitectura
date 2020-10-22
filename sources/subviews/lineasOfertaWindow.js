// locales_afectados_window
// Esta es una vista no webix jet para mostrar al crear o modificar
// la asociación entre un servicio y los locales afectados ligados a el
import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";

import { clientesService } from "../services/clientes_service";
import { tiposIvaService } from "../services/tipos_iva_service";

import { proveedoresService } from "../services/proveedores_service";

import { tiposProfesionalService } from "../services/tiposProfesional_service";
import { articulosService } from "../services/articulos_service";
import { infoTarifasGridWindow } from "../subviews/info_tarifas_grid";

var _lineasOfertaWindowCreated = false;
var translate;
var ofertaId;
var ofertaLineaId;
var articulos;
var cliId;
var proId;
 ;
var contaError;
var tipIvaCli = 0;
var texto;
var tarifaProveedorId;
var antcod = null;


export const LineasOfertaWindow = {
    getWindow: (app) => {
        if (_lineasOfertaWindowCreated) return; // Evitamos que se cree dos veces la misma venta
        infoTarifasGridWindow.getGridTarifasWindow(app)
        translate = app.getService("locale")._;
        const _view2 = {
            view: "form",
            id: "LineasOfertafrm",
            elements: [
                { template: "Linea del oferta", type: "section" },
                {
                    cols: [
                       
                        
                        {
                            minWidth:100
                        }
                    ]
                },
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
                                                view:"button", type:"icon", id: "tarifas", width: 120, icon: " mdi mdi-information", css:"webix_secondary", 
                                                tooltip: translate("Mostrar Información de tarifas"), click: () => {
                                                    LineasOfertaWindow.muestraVentanaTarifas();
                                                }
                                            },
                                            {
                                                minWidth:100
                                            },
                                            
                                        ]
                                    },
                                    {
                                        cols: [
                                            {
                                                view: "text", id: "linea", name: "linea", required: true,
                                                label: "Linea", labelPosition: "top", width:50
                                            },
                                            {
                                                view: "combo", id: "cmbGrupoArticulo", name: "cmbGrupoArticulo", required: true, options: {},
                                                label: "Capítulo", labelPosition: "top", width: 120
                                            },
                                            {
                                                view: "combo", id: "cmbArticulos", name: "cmbArticulos", 
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
                                                label: "Unidades", labelPosition: "top", width: 120
                                            },
                                            {
                                                view: "text", id: "cantidad", name: "cantidad", required: true,
                                                label: "Cantidad", labelPosition: "top", width:50
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
                                        view: "text", id: "unidades", name: "unidades",
                                        label: "Unidades", labelPosition: "top", width: 80, format: "1.00"
                                    },
                                    {
                                        view: "text", id: "precioCliente", value: 0, name: "precioCliente",  required: true, 
                                        label: "Precio", labelPosition: "top", minWidth: 100, format: "1.00"
                                    },
                                    {
                                        view: "combo", id: "cmbTiposIvaCliente", name: "tipoIvaClienteId", required: true, options: {},
                                        label: "IVA", labelPosition: "top", minWidth: 120
                                    },
                                    {
                                        view: "text", id: "ivaCliente", name: "ivaCliente",hidden: true,
                                        label: "IVA", labelPosition: "top", width: 80,format: "1,00"
                                    },
                                    {
                                        view: "text", id: "importeCliente", value: 0, name: "importeCliente",  required: false,
                                        label: "Base imponible", labelPosition: "top",format: "1,00",  minWidth: 100,disabled: true
                                    },
                                   /*  {
                                        view: "text", id: "totalClienteIva", value: 0, name: "totalClienteIva",  required: false,
                                        label: "Total Iva", labelPosition: "top",format: "1,00", minWidth:100, disabled: true
                                    },
                                    {
                                        view: "text", id: "importeClienteIva", value: 0, name: "importeClienteIva",  required: false,
                                        label: "Total con Iva", labelPosition: "top",format: "1,00", minWidth:100, disabled:true
                                    } */
                                ]
                            }
                        ]
                    }
                },
                {
                     view:"fieldset", 
                    label:"PROVEEDOR",
                    id: "proveedor",
                    body: {
                        rows: [
                            {
                                cols: [
                                    {
                                        width: 80
                                    },
                                    {
                                        view: "text", id: "precioProveedor", value: 0, name: "precioProveedor",  required: true,
                                        label: "Precio", labelPosition: "top", minWidth: 100, format: "1.00"
                                    },
                                    {
                                        view: "combo", id: "cmbTiposIvaProveedor", name: "tipoIvaProveedorId", required: true, options: {},
                                        label: "IVA", labelPosition: "top", minWidth: 120
                                    },
                                    {
                                        view: "text", id: "ivaProveedor", name: "ivaProveedor",hidden: true,
                                        label: "IVA", labelPosition: "top", minWidth: 80,format: "1,00", disabled:true
                                    },
                                     
                                    {
                                        view: "text", id: "importeProveedor", value: 0, name: "importeProveedor",  required: false,
                                        label: "Base imponible", labelPosition: "top", format: "1,00",  minWidth: 100,disabled: true
                                    },
                                    /* {
                                        view: "text", id: "totalProveedorIva", value: 0, name: "totalProveedorIva",  required: false,
                                        label: "Total Iva", labelPosition: "top",format: "1,00", minWidth:100, disabled: true
                                    }, */
                                   /*  {
                                        view: "text", id: "importeProveedorIva", value: 0, name: "importeProveedorIva",  required: false,
                                        label: "Total con Iva", labelPosition: "top", format: "1,00", minWidth:100,disabled:true
                                    },
                                    {
                                        view: "text", id: "aCuentaProveedor", value: 0, name: "aCuentaProveedor",  required: false,
                                        label: "contado", labelPosition: "top", minWidth:100,  format: "1.00"
                                    }, */
                                    
                                ]
                            }
                        ]
                    }
                },
                {
                                               
                    view: "textarea", id: "comentarios", name: "comentarios",
                    label: "Comentarios", labelPosition: "top", width: 1150,  height: 70
                
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
            position: "center", move: true, resize: true,
            width: 1100,
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

        $$("cmbCodigo").attachEvent("onChange", function(newv, oldv){
            var cod = newv;
            
            
            if(cod || cod != "") {
                //buscamos en el array de articulos
            
                articulos.forEach(e => {
                    if(e.codigoReparacion == cod) {
                        LineasOfertaWindow.loadCmbDescripcion(cod);
                        return;
                    }
                   
                });
               // si se trata de un articulo existente no cargamos las tarifas, puesto que ya existen
                    //recuperamos el precio del articulo en base a la tarifa del cliente
                    if(cliId) {
                        LineasOfertaWindow.recuperaTarifaCliente(cod);
                    }
                    

                    //recuperamos el precio del articulo en base a la tarifa del proveedor
                    if(proId) {
                        LineasOfertaWindow.recuperaTarifaProveedor(cod);
                    }
                
               
               
            }
         });

         $$("cmbTipoProfesionales2").attachEvent("onChange", function(newv, oldv){
             if(newv && newv != "") {
               
                LineasOfertaWindow.loadCodigosArticulos(null, newv)
             }
         });

         
        $$("cmbDescripcion").attachEvent("onChange", function(newv, oldv){
            if(oldv == "" && ofertaLineaId) return false; // si se carga la linea bloqueamos el evento
            var cod = newv;
            if(cod || cod != "") {
                LineasOfertaWindow.loadCodigosArticulos(cod, null)
            }
        });

         $$("unidades").attachEvent("onFocus", function(current, prev){
                $$('unidades').setValue('');
                $$('importeCliente').setValue(0);
                $$('importeProveedor').setValue(0);
               /*  $$('importeClienteIva').setValue(0);
                $$('importeProveedorIva').setValue(0);
                $$('totalClienteIva').setValue(0);
                $$('totalProveedorIva').setValue(0); */
         });
         $$("cmbTiposIvaCliente").attachEvent("onChange", function(newv, oldv){
            var tipo;
             if(newv != ""){
                 tipo = $$('cmbTiposIvaCliente').getText();
                 if(tipo =='Exento') {
                     $$('ivaCliente').setValue(0);
                 }else {
                    tipo = $$('cmbTiposIvaCliente').getText();
                    tipo = tipo.replace('%', '');
                    $$('ivaCliente').setValue(parseFloat(tipo));
                 }
             }
         });

         $$("cmbTiposIvaProveedor").attachEvent("onChange", function(newv, oldv){
            var tipo;
             if(newv != ""){
                 tipo = $$('cmbTiposIvaProveedor').getText();
                 if(tipo =='Exento') {
                     $$('ivaProveedor').setValue(0);
                 }else {
                    tipo = $$('cmbTiposIvaProveedor').getText();
                    tipo = tipo.replace('%', '');
                    $$('ivaProveedor').setValue(parseFloat(tipo));
                 }
             }
         });

         $$("unidades").attachEvent("onChange", function(newv, oldv){
            var uni = parseFloat(newv);
            var prePro = $$('precioProveedor').getValue();
            var preCli = $$('precioCliente').getValue();
            var ivaCliente = $$('ivaCliente').getValue();
            var ivaProveedor = $$('ivaProveedor').getValue();

            if(preCli != "") {
                preCli = parseFloat(preCli);
                var precioCli = parseFloat(uni * preCli)
                $$('importeCliente').setValue(parseFloat(precioCli));
            }
            
            if(prePro != '') {
                prePro = parseFloat(prePro);
                var precioPro = parseFloat(uni * prePro);
                $$('importeProveedor').setValue(precioPro);
            }

            var precioPro = parseFloat(uni * prePro);
            $$('importeProveedor').setValue(precioPro);

            /* if(ivaProveedor !== "" && prePro !== "") {
                var soloIvaPro = ((precioPro * ivaProveedor)/100);
                var ivaPro = precioPro + ((precioPro * ivaProveedor)/100);
                $$('importeProveedorIva').setValue(ivaPro);
                $$('totalProveedorIva').setValue(soloIvaPro);
            }

            if(ivaCliente !== "" && preCli !== "") {
                var soloIvaCli = ((precioCli * ivaCliente)/100);
                var ivaCli = precioCli + ((precioCli * ivaCliente)/100);
                $$('importeClienteIva').setValue(ivaCli);
                $$('totalClienteIva').setValue(soloIvaCli);
            } */

         });

         $$("ivaCliente").attachEvent("onChange", function(newv, oldv){
             if(newv != "") {
                var ivaCliente = parseInt(newv);
             }
             if(newv === 0) {
                var ivaCliente = parseInt(newv);
             }
           
            var preCli = $$('precioCliente').getValue();
            var uni = $$('unidades').getValue();

            /* if(ivaCliente !== "" && preCli !== "") {
                var precioCli = parseFloat(preCli * uni);
                var ivaCli = precioCli + ((precioCli * ivaCliente)/100);
                var soloIvaCli = ((precioCli * ivaCliente)/100);
                $$('importeClienteIva').setValue(ivaCli);
                $$('totalClienteIva').setValue(soloIvaCli);
            } */

         });

         $$("ivaProveedor").attachEvent("onChange", function(newv, oldv){
            if(newv != "") {
               var ivaProveedor = parseInt(newv);
            }
            if(newv === 0) {
               var ivaProveedor = parseInt(newv);
            }
           var prePro = $$('precioProveedor').getValue();
          
           var uni = $$('unidades').getValue();

           

           /* if(ivaProveedor !== "" && prePro !== "") {
               var precioPro = parseFloat(prePro * uni);
               var ivaPro = precioPro + ((precioPro * ivaProveedor)/100);
               var soloIvaPro = ((precioPro * ivaProveedor)/100);
               $$('importeProveedorIva').setValue(ivaPro);
               $$('totalProveedorIva').setValue(soloIvaPro);
           } */
        });

         $$("precioProveedor").attachEvent("onChange", function(newv, oldv){
            var prePro = parseFloat(newv);
            var uni = $$('unidades').getValue();
            var ivaProveedor = $$('ivaProveedor').getValue();
            if(uni != "") {
                var uni = parseFloat(uni);
            }
           
            /* if(uni != "") {
                var precioPro = parseFloat(uni * prePro);
                $$('importeProveedor').setValue(precioPro);

                var ivaPro = precioPro + ((precioPro * ivaProveedor)/100);
                var soloIvaPro = ((precioPro * ivaProveedor)/100);
                $$('importeProveedorIva').setValue(ivaPro);
                $$('totalProveedorIva').setValue(soloIvaPro);
            } */
         });

         $$("precioCliente").attachEvent("onChange", function(newv, oldv){
             if(newv == "") { newv = 0}
            var preCli = parseFloat(newv);
            var uni = $$('unidades').getValue();
            var ivaCliente = $$('ivaCliente').getValue();
            if(uni != "") {
                var uni = parseFloat(uni);
            }
           
            /* if(uni != "") {
                var precioCli = parseFloat(uni * preCli)
                $$('importeCliente').setValue(parseFloat(precioCli));

                
                var ivaCli = precioCli + ((precioCli * ivaCliente)/100);
                var soloIvaCli = ((precioCli * ivaCliente)/100);
                $$('importeClienteIva').setValue(ivaCli);
                $$('totalClienteIva').setValue(soloIvaCli);
            } */
         });

        return
    },
    loadWindow: (ofertaid, ofertaLineaid, cliid, proid) => {
        var tipo;
        tarifaProveedorId = null;
        contaError = 0;
        ofertaId = ofertaid;
        ofertaLineaId = ofertaLineaid
        cliId = cliid;
        proId = proid;
        antcod = null;
        $$('lineasOfertaWindow').show();
        if (ofertaLineaId) {
            LineasOfertaWindow.bloqueaEventos();
            
        } else {
            tipo = $$('cmbTipoProfesionales').getValue();
            $$("LineasOfertafrm").clear();
            $$('unidades').setValue(1);
            $$('precioCliente').setValue(0);
            $$('precioProveedor').setValue(0);
            $$('importeCliente').setValue(0);
            $$('importeProveedor').setValue(0);
            $$('aCuentaProveedor').setValue(0);
            LineasOfertaWindow.loadCodigosArticulos(null, tipo);
            //LineasOfertaWindow.loadTiposIvaCliente();
            //LineasOfertaWindow.loadTiposIvaProveedor(3);
           LineasOfertaWindow.recuperaIvaProveedor(proId);
            LineasOfertaWindow.recuperaIvaCliente(cliId);

        }

    },

    bloqueaEventos: () => {
        $$("cmbCodigo").blockEvent();
        //$$("cmbDescripcion").blockEvent();
        $$("cmbTiposIvaCliente").blockEvent();
        $$("cmbTiposIvaProveedor").blockEvent();
        $$("unidades").blockEvent();
        $$("ivaCliente").blockEvent();
        $$("ivaProveedor").blockEvent();
        $$("precioProveedor").blockEvent();
        $$("precioCliente").blockEvent();

        ofertasService.getLineaOferta(ofertaId, ofertaLineaId)
        .then(data => {
            $$("LineasOfertafrm").clear();
            $$("LineasOfertafrm").setValues(data);
            //recuperamos el tipo profesional correspondiente al articulo
            articulosService.getArticuloCodigo(data.codigoArticulo)
            .then( (rows) => {
                if(rows) {
                    LineasOfertaWindow.loadCodigosArticulos(data.codigoArticulo, rows.tipoProfesionalId);
                    tipIvaCli = data.tipoIvaClienteId;
                    //LineasOfertaWindow.loadTiposIvaProveedor(data.tipoIvaProveedorId);
                    LineasOfertaWindow.loadTiposIvaCliente(data.tipoIvaClienteId);
                    LineasOfertaWindow.loadTiposIvaProveedor(data.tipoIvaProveedorId);
                    //$$("cmbCodigo").unblockEvent();
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
    },

    desbloqueaEventos: () => {
        $$("cmbCodigo").unblockEvent();
        $$("cmbDescripcion").unblockEvent();
        $$("cmbTiposIvaCliente").unblockEvent();
        $$("cmbTiposIvaProveedor").unblockEvent();
        $$("unidades").unblockEvent();
        $$("ivaCliente").unblockEvent();
        $$("ivaProveedor").unblockEvent();
        $$("precioProveedor").unblockEvent();
        $$("precioCliente").unblockEvent();
    },
    accept: () => {
        var ivaCli = $$('ivaCliente').getValue();
        var ivaPro =  $$('ivaProveedor').getValue();
        if (!$$("LineasOfertafrm").validate()) {
            messageApi.errorMessage("Debe rellenar los campos correctamente");
            return;
        }
        if(!ivaCli || ivaCli == '') {
            messageApi.errorMessage("Error interno, no hay iva de cliente, seleccionelo de nuevo");
            return;
        } else if (!ivaPro || ivaPro == '') {
            messageApi.errorMessage("Error interno, no hay iva de proveedor, seleccionelo de nuevo");
            return;
        }
        
        LineasOfertaWindow.enviaDatos();
    },

    enviaDatos: () => {
                var data = $$("LineasOfertafrm").getValues();
                data = LineasOfertaWindow.preparaDatos(data);
                
                // controlamos si es un alta o una modificación.
                if (data.ofertaLineaId) {
                    // Es una modificación
                    if(data.facproveLineaId || data.facturaLineaId) {// si hay facturas asociadas
                        webix.confirm({
                            title: translate("AVISO"),
                            text: translate("Este oferta tiene facturas asociadas que resultarán afectadas con las modificaciones. ¿ Desea continuar ?"),
                            type: "confirm-warning",
                            callback: (action) => {
                                if (action === true) {
                                    data.codigoArticulo = data.codigoId
                                    delete data.codigoId;
                                    ofertasService.putLineaOferta(data)
                                        .then(row => {
                                            //comprobamos si hay una factura asociada
                                            if(data.facproveLineaId){
                                                LineasOfertaWindow.updateFacprove(data, proId);
                                            }
                                            if(data.facturaLineaId){
                                                LineasOfertaWindow.updateFactura(data);
                                            }
                                            // Hay que cerrar la ventana y refrescar el grid
                                            $$('lineasOfertaWindow').hide();
                                            $$('importeCli').setValue(row.importe_cliente);
                                            $$('importePro').setValue(row.importe_profesional);
                                            $$('importeCliIva').setValue(row.importe_cliente_iva);
                                            $$('importeProIva').setValue(row.importe_profesional_iva);
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
        
                                }
                            }
                    });
                        
                    }else {//no hay facturas asociadas
                        data.codigoArticulo = data.codigoId
                        delete data.codigoId;
                        ofertasService.putLineaOferta(data)
                        .then(row => {
                            // Hay que cerrar la ventana y refrescar el grid
                            $$('lineasOfertaWindow').hide();
                            $$('importeCli').setValue(row.importe_cliente);
                            $$('importePro').setValue(row.importe_profesional);
                            $$('importeCliIva').setValue(row.importe_cliente_iva);
                            $$('importeProIva').setValue(row.importe_profesional_iva);
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
                    }
                } else {
                    // es un alta
                    var facturaId = $$('facturaId').getValue();
                    var facproveId = $$('facproveId').getValue();
                    data.codigoArticulo = data.codigoId
                    delete data.codigoId;
                    ofertasService.postLineaOferta(data, ofertaId)
                    .then(row => {
                        //si hay factura asociada se crea la linea en la factura
                        if(facturaId || facturaId != '') {
                            facturacionService.postLineaOfertaFactura(row.lineaOfertaId, facturaId)
                            .then( result => {

                            })
                            .catch( err => {
                                messageApi.errorMessageAjax(err.message);
                            })
                        }
                        //si hay factura de proveedor asociada se crea la linea en la factura
                        if(facproveId || facproveId != '') {
                            facturacionService.postLineaOfertaFacprove(row.lineaOfertaId, facproveId, proId)
                            .then( result => {

                            })
                            .catch( err => {
                                messageApi.errorMessageAjax(err.message);
                            })
                        }
                        // Hay que cerrar la ventana y refrescar el grid
                        $$('lineasOfertaWindow').hide();
                        $$('importeCli').setValue(row.importe_cliente);
                        $$('importePro').setValue(row.importe_profesional);
                        $$('importeCliIva').setValue(row.importe_cliente_iva);
                        $$('importeProIva').setValue(row.importe_profesional_iva);
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
                } 
       
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
            ofertasService.getLineasOferta(ofertaId)
            .then(rows => {
                if(rows != null) {
                    $$("LineasOfertaGrid").clearAll();
                    $$("LineasOfertaGrid").parse(generalApi.prepareDataForDataTable("ofertaLineaId", rows));
                    OfertasFormWindow.estableceNumLineas(rows.length);
                    lineasOferta.estableceContado(rows)
                }else {
                    $$("LineasOfertaGrid").clearAll();
                    OfertasFormWindow.estableceNumLineas(0);
                    $$('aCuentaProfesional').setValue(0);
                    return;
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
        
        } else {
            ofertasService.getLineasOfertaServicio()
            .then(rows => {
                $$("LineasOfertaGrid").clearAll();
                $$("LineasOfertaGrid").parse(generalApi.prepareDataForDataTable("ofertaLineaId", rows));
                $$('lineasOfertaWindow').hide();
                OfertasFormWindow.estableceNumLineas(rows.length);
            })
            .catch((err) => {
                $$('lineasOfertaWindow').hide();
                var error = err.response;
                            var index = error.indexOf("Cannot delete or update a parent row: a foreign key constraint fails");
                            if(index != -1) {
                                messageApi.errorRestriccion()
                            } else {
                                messageApi.errorMessageAjax(err);
                            }
            });

        }
       
    },

    loadCodigosArticulos: (codigoReparacion, tipoProfesionalId) => {
        $$('tarifas').show();
        var tipo;
        if(tipoProfesionalId) {
            tipo = tipoProfesionalId;
           
        } else {
            tipo = $$("cmbTipoProfesionales2").getValue();
        }
        proveedoresService.getTarifaProveedorProfesion(tipo, $$("cmbProveedores").getValue())
            .then(rows => {
                if(rows.length == 0) {
                    messageApi.errorMessage("No existe ningúna tarifa asociada a este proveedor.");
                    $$('tarifas').hide();
                   
                }

                if(!tarifaProveedorId && rows.length > 0) {
                    tarifaProveedorId = rows[0].tarifaProveedorId;
                    LineasOfertaWindow.loadTiposProfesionales(tipo);
                }

                //eliminamos campos nulos
                for(var i= 0; i < rows.length; i++) {
                    if(!rows[i].codigoReparacion) {
                        rows.splice(i,1);
                        i = 0
                    }
                }
                //del resultado de eliminar volvemos a comprobar si campos nulos
                for(var i= 0; i < rows.length; i++) {
                    if(!rows[i].codigoReparacion) {
                        rows.splice(i,1);
                        i = 0
                    }
                }

                //si el IVa es nulo lo ponemos como exento
                for(var i= 0; i < rows.length; i++) {
                    if(!rows[i].porceIva) {
                        rows[i].porceIva = 0
                    }
                }

                
                
                articulos = rows//guardamos los articulos
                //procesamos los campos que no son nulos
                var codigos = generalApi.prepareDataForCombo('codigoReparacion', 'codigoReparacion', rows);
                var list = $$("cmbCodigo").getPopup().getList();
                list.clearAll();
                list.parse(codigos);
                if (codigoReparacion) {
                    $$("cmbCodigo").setValue(codigoReparacion);
                    $$("cmbCodigo").refresh();
                    LineasOfertaWindow.loadCmbDescripcion(codigoReparacion);  //cargamos el combo de concepto
                } else {
                    LineasOfertaWindow.loadCmbDescripcion(null);  //cargamos el combo de concepto
                    //$$("cmbCodigo").setValue(null);
                    //$$("cmbDescripcion").setValue(null);
                }  
                return;
            })
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
    loadTiposIvaCliente: (tipoIvaClienteId) => {
        tiposIvaService.getTiposIva()
            .then(rows => {
                var tiposIva = generalApi.prepareDataForCombo('tipoIvaId', 'nombre', rows);
                tiposIva.push({id:null, value: ""});
                var list = $$("cmbTiposIvaCliente").getPopup().getList();
                list.clearAll();
                list.parse(tiposIva);
                if (tipoIvaClienteId) {
                    $$("cmbTiposIvaCliente").setValue(tipoIvaClienteId);
                    $$("cmbTiposIvaCliente").refresh();
                }
                return;
            })
    },

    loadTiposIvaProveedor: (tipoIvaProveedorId) => {
        tiposIvaService.getTiposIva()
            .then(rows => {
                var tiposIva = generalApi.prepareDataForCombo('tipoIvaId', 'nombre', rows);
                var list = $$("cmbTiposIvaProveedor").getPopup().getList();
                list.clearAll();
                list.parse(tiposIva);
                if (tipoIvaProveedorId) {
                    $$("cmbTiposIvaProveedor").setValue(tipoIvaProveedorId);
                    $$("cmbTiposIvaProveedor").refresh();
                }
                setTimeout(LineasOfertaWindow.desbloqueaEventos, 1000);
                //
                return;
            })
    },


    recuperaIvaCliente(cliId) {
        clientesService.getCliente(cliId)
        .then( rows => {
            if(rows.tipoIvaId) {
                this.loadTiposIvaCliente(rows.tipoIvaId);
            } else {
                this.loadTiposIvaCliente(3);
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
        });
    },

    recuperaIvaProveedor(proId) {
        proveedoresService.getProveedor(proId)
        .then( rows => {
            if(rows.tipoIvaId) {
                this.loadTiposIvaProveedor(rows.tipoIvaId);
            } else {
                this.loadTiposIvaProveedor(3);
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
        });
    },


    recuperaTarifaCliente(codigoReparacion) {
        clientesService.getPrecioUnitarioArticulo(cliId, codigoReparacion)
        .then( rows => {
            if(rows.length > 0) {
                $$('precioCliente').setValue(rows[0].precioCliente);

                //miramos si hay unidades y actualizamos totales en función del nuevo precio
                var uni = $$('unidades').getValue();

                if(uni != "") {
                    var preCli = parseFloat($$('precioCliente').getValue());
                    $$('importeCliente').setValue(parseFloat(uni * preCli));
                }
            }
            if(rows.length == 0) {
                $$('precioCliente').setValue(0);
                LineasOfertaWindow.recuperaPrecioVenta(codigoReparacion);
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

    recuperaPrecioVenta(codigo) {
        articulos.forEach(e => {
            if(e.codigoReparacion == codigo)  $$('precioCliente').setValue(e.precioVenta);
        });
    },

    recuperaTarifaProveedor(codigoReparacion) {
        proveedoresService.getPrecioUnitarioArticulo(proId, codigoReparacion)
        .then( rows => {
            if(rows.length > 0) {
                $$('precioProveedor').setValue(rows[0].precioProveedor)
                //miramos si hay unidades y actualizamos totales en función del nuevo precio
                var uni = $$('unidades').getValue();
                if(uni != "") {
                    var prePro = parseFloat($$('precioProveedor').getValue());
                    var precioPro = parseFloat(uni * prePro);
                    $$('importeProveedor').setValue(precioPro);

                }
            }
            if(rows.length == 0) {
                $$('precioProveedor').setValue(0);
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

    loadTiposProfesionales: (tipoProfesionalId) => {
        tiposProfesionalService.getTiposProfesionalesTarifa(tarifaProveedorId)
            .then(rows => {
                var tiposProfesionales = generalApi.prepareDataForCombo('tipoProfesionalId', 'nombre', rows);
                var list = $$("cmbTipoProfesionales2").getPopup().getList();
                list.clearAll();
                list.parse(tiposProfesionales);
                if (tipoProfesionalId) {
                    $$("cmbTipoProfesionales2").setValue(tipoProfesionalId);
                    $$("cmbTipoProfesionales2").refresh();
                }
                return;
            })
    },

    muestraVentanaTarifas: () => {
        var tipo =  $$("cmbTipoProfesionales2").getValue();
        infoTarifasGridWindow.loadWindow(cliId, proId, tipo);
    }

}