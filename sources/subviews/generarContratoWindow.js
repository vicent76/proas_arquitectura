import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { usuarioService } from "../services/usuario_service";
import { ofertasService } from "../services/ofertas_service"

var _generarContratoWindowCreated = false;
var translate;
var usuarioId;
var ofertaId = null
export const generarContratoWindow = {
    getWindow: (app) => {
        if (_generarContratoWindowCreated) return; // Evitamos que se cree dos veces la misma venta
        translate = app.getService("locale")._;
        const _view2 = {
            view: "form",
            id: "generarContratofrm",
            gravity: 1,
            rows: [
                {
                    view: "toolbar", padding: 3, elements: [
                        { view: "icon", icon: "mdi mdi-office-building", width: 37, align: "left" },
                        { view: "label", label: "ACEPTAR OFERTA - GENERAR CONTRATO" }
                    ]
                },
                {
                    view: "fieldset",
                    id: "generarContrato",
                    id: "datosAceptacion",
                    body: {
                       
                            rows: [
                               
                                {
                                    cols: [
                                        {
                                            view: "datepicker", id: "fechaAceptacionOferta", name: "fechaAceptacionOferta",  minWidth: 350,
                                            label: "Fecha aceptación oferta", labelPosition: "top", required: true
                                        },
                                    ]
                                },
                                {
                                    cols: [
                                        {
                                            view: "datepicker", id: "fechaInicio", name: "fechaInicio",  minWidth: 150,
                                            label: "Fecha inicio", labelPosition: "top", required: true
                                        },
                                        {
                                            view: "datepicker", id: "fechaFinal", name: "fechaFinal",  minWidth: 150,
                                            label: "Fecha final", labelPosition: "top", required: true
                                        },
                                        {
                                            view: "text", id: 'preaviso', name:'preaviso', width: 190,
                                            label:  'Preaviso', labelPosition: "top", value: 0 
                                             
                                        },
                                    ]
                                },
                                {
                                    cols: [
                                        {
                                            view: "datepicker", id: "fechaPrimeraFactura", name: "fechaPrimeraFactura",  minWidth: 150,
                                            label: "Fecha piemrera factura", labelPosition: "top"
                                        },
                                        {
                                            view: "datepicker", id: "fechaOriginal", name: "fechaOriginal",  minWidth: 150,
                                            label: "Fecha original", labelPosition: "top"
                                        },
                                        {
                                            view:"label", label: "Facturacion parcial", width:140,on: {
                                                onAfterRender: function () {
                                                    this.getNode().style.marginLeft = "10px";
                                                }
                                            },
                                        },
                                        {
                                            view: "checkbox", id: "facturaParcial", name: "facturaParcial", width: 50
                                        },
                                    ]
                                },
                                { height: 15 }, // ← margen superior simulado
                                {
                                    margin: 5, cols: [
                                       
                                        { gravity: 5 },
                                        { view: "button", id: "btnCancelarWindow", label: translate("Cancelar"), css: "webix_danger", click: generarContratoWindow.cancel, hotkey: "esc" },
                                        { view: "button", id: "btnAceptarWindow", label: translate("Aceptar"),    css: "webix_primary", click: generarContratoWindow.accept, type: "form", hotkey: "enter" }
                                    ]
                                }
                            ]
                    },
                    on: {
                        onValidationError:function(key, obj){
                            
                        }
                    }
                }
            ]
        };
        webix.ui({
            view: "window",
            id: "generarContratoWindow",
            position: "center",
            move: true,
            resize: true,
            minWidth: 800,     // 👈 ancho deseado (ajusta según lo que necesites)
            head: {
                view: "toolbar",
                cols: [
                    {},
                    {
                        view: "icon",
                        icon: "mdi mdi-close",
                        click: () => {
                            $$('generarContratoWindow').hide();
                        }
                    }
                ]
            },
            modal: true,
            body: _view2
        });
        
        _generarContratoWindowCreated = true; // La ventana se ha creado e informamos al proceso
        return
    },

    loadWindow: (ofertaid) => {
        ofertaId = ofertaid
        $$('generarContratoWindow').show();
    },

    accept: () => {
        if (!$$("generarContratofrm").validate()) {
            messageApi.errorMessage("Debe rellenar los campos correctamente");
            return;
        }
        var data = $$("generarContratofrm").getValues();
        generarContratoWindow.generarContratoAPI(data)

    },

  
    cancel: () => {
        $$('generarContratoWindow').hide();
    },
   
  
    generarContratoAPI: (d) => {
        var datos = {
            fechaAceptacionOferta: d.fechaAceptacionOferta,
            fechaInicio: d.fechaInicio,
            fechaFinal: d.fechaFinal,
            fechaOriginal: d.fechaOriginal,
            fechaPrimeraFactura: d.fechaPrimeraFactura,
            preaviso: d.preaviso,
            facturaParcial: d.facturaParcial
        }
        ofertasService.postOfertaContrato(datos, ofertaId)
            .then( rows => {
                $$('generarContratoWindow').hide();
                messageApi.normalMessage('Se ha creado corectamente el contrato.\n Lo tiene disponible en el apartado contratos de la gestión.');
            })
            .catch( err => {
                var error = err.response;
                messageApi.errorMessageAjax(err);
            })
    }
}