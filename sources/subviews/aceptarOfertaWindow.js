// locales_afectados_window
// Esta es una vista no webix jet para mostrar al crear o modificar
// la asociación entre un servicio y los locales afectados ligados a el
import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";

var _aceptarOfertaWindowCreated = false;
var translate;


export const AceptarOfertaWindow = {
    getWindow: (app) => {
        if (_aceptarOfertaWindowCreated) return; // Evitamos que se cree dos veces la misma venta
        translate = app.getService("locale")._;
        try{
            const _view = {
                view: "form",
                id: "AceptarOfertafrm",
                elements: [
                    { template: "Aceptar oferta", type: "section" },
                    
                                
                        {
                            rows: [
                                {
                                    cols: [
                                        {
                                            view: "datepicker", id: "fechaAceptacionOferta", name: "fechaAceptacionOferta",  width: 150,
                                            label: "Fecha de aceptacion de la oferta", labelPosition: "top", required: true
                                        },
                                        {
                                            minWidth:100
                                        }
                                    ]
                                },
                                {
                                    cols: [
                                        {
                                            view: "datepicker", id: "fechaInicio", name: "fechaInicio",  width: 150,
                                            label: "Fecha de inicio", labelPosition: "top", required: true
                                        },
                                        {
                                            view: "datepicker", id: "fechaFinal", name: "fechaFinal",  width: 150,
                                            label: "Fecha final", labelPosition: "top", required: true
                                        },
                                        {
                                            view: "text", id: "referencia", name: "referencia",
                                            label: "Preaviso (dias)", labelPosition: "top", width:250, format:"1"
                                        },
                                       
                                    ]
                                },
                                {
                                    cols: [
                                        {
                                            view: "text", id: "fechaPrimeraFactura", name: "fechaPrimeraFactura",
                                            label: "Fecha primera factura", labelPosition: "top", width:250
                                        },
                                        {
                                            view: "text", id: "fechaOriginal", name: "fechaOriginal", 
                                            label: "Fecha original", labelPosition: "top", width:250
                                        },
                                        {
                                            view:"label", label: "Facturación parcial", width:100
                                        },
                                        {
                                            view: "checkbox", id: "chkFacturaParcial", name: "chkFacturaParcial", width: 50
                                         },
                                    ]
                                }
                            ]
                        },
                    {
                        margin: 5, cols: [
                            { gravity: 5 },
                            { view: "button", id: "btnCancelarWindowAceptarOferta", label: translate("Cancelar"), click: AceptarOfertaWindow.cancel, hotkey: "esc" },
                            { view: "button", id: "btnAceptarWindowAceptarOferta", label: translate("Aceptar"), click: AceptarOfertaWindow.accept, type: "form" }
                        ]
                    }
                ]
                
            };
         
      
          webix.ui({
                view: "window",
                id: "aceptarOfertaWindow",
                position: "center", move: true, resize: true,
                width: 1100,
                head: {
                    view: "toolbar", cols: [
                        {},
                        {
                            view: "icon", icon: "mdi mdi-close", click: () => {
                                $$('aceptarOfertaWindow').hide();
                            }
                        }
                    ]
                }, modal: true,
                body: {
                    template:"hola"
                }
            });

            _aceptarOfertaWindowCreated = true; // La ventana se ha creado e informamos al proceso
    
            return

        }catch(e) {
            console.log(e);
        }
       
    },
    loadWindow: () => {
        //$$('aceptarOfertaWindow').show();
    }
}