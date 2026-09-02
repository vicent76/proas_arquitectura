
import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { contactosExpedienteService } from "../services/contactosExpediente_service";

var _contactosExpedienteWindowCreated = false;
var translate;
var parteId;
var contaError;


export const ContactosExpedienteWindow = {
    getWindow: (app) => {
        if (_contactosExpedienteWindowCreated) return; // Evitamos que se cree dos veces la misma venta
        translate = app.getService("locale")._;
        const _view2 = {
            view: "form",
            id: "contactosExpedienteWin",
            rows: [
                {
                    view: "toolbar", padding: 3, elements: [
                        { view: "icon", icon: "mdi mdi-office-building", width: 37, align: "left" },
                        { view: "label", label: "Contacto del Expediente" }
                    ]
                },
                {
                    view: "form",
                    id: "ContactosExpedientefrm",
                    elements: [
                        {
                            rows: [
                                { template: "Persona de contacto", type: "section" },
                                {
                                    cols: [
                                        {
                                            view: "text", id: "contactoNombre", name: "contactoNombre", required: true,
                                            label: "Nombre", labelPosition: "top"
                                        },
                                        {
                                            view: "text", id: "telefono1", name: "telefono1",
                                            label: "Telefono (1)", labelPosition: "top"
                                        },
                                        {
                                            view: "text", id: "telefono2", name: "telefono2",
                                            label: "Telefono (2)", labelPosition: "top"
                                        },
                                        {
                                            view: "text", id: "correoContacto", value: null, name: "correo", validate: webix.rules.isEmail, required: false,
                                            label: "Correo", labelPosition: "top"
                                        }
                                    ]
                                }
                            ]
                        },
                        {

                            view: "textarea", id: "observacionesContacto", name: "observaciones",
                            label: "Observaciones", labelPosition: "top"

                        },
                        {
                            margin: 5, cols: [
                                { gravity: 5 },
                                { view: "button", id: "btnCancelarContactoWindow", label: translate("Cancelar"), click: ContactosExpedienteWindow.cancel, hotkey: "esc" },
                                { view: "button", id: "btnAceptarContactoWindow", label: translate("Aceptar"), click: ContactosExpedienteWindow.accept, type: "form", hotkey: "enter" }
                            ]
                        }

                    ],
                    on: {
                        onValidationError: function (key, obj) {
                            /*contaError ++
                            if(key == "correo" && obj.correo == "" && contaError == 1) {
                                ContactosExpedienteWindow.enviaDatos();
                            } 
                            if(key == "correo" && obj.correo != "" && contaError == 1) {
                                messageApi.errorMessage(translate("El correo es incorrecto"));
                                return;
                            }
                            else if(key != "correo"  && contaError == 1) {
                                messageApi.errorMessage(translate("debe rellenar los campos correctamente"));
                                return;
                            }*/
                        }
                    }
                }
            ]
        };
        webix.ui({
            view: "window",
            id: "contactosExpedienteWindow",
            position: "center", move: true, resize: true,
            width: 800,
            head: {
                view: "toolbar", cols: [
                    {},
                    {
                        view: "icon", icon: "mdi mdi-close", click: () => {
                            $$('contactosExpedienteWindow').hide();
                        }
                    }
                ]
            }, modal: true,
            body: _view2,
            on: {
                onShow: function () {
                    webix.delay(() => {
                        $$("contactoNombre").focus();
                    });
                }
            }
        });
        _contactosExpedienteWindowCreated = true; // La ventana se ha creado e informamos al proceso
        return
    },
    loadWindow: (expedienteId, contactoExpedienteId) => {
        $$('btnAceptarContactoWindow').enable();//activamos ek botton de aceptar
        contaError = 0;
        $$('contactosExpedienteWindow').show();
        if (contactoExpedienteId) {
            // Se pretende editar una relación existente
            contactosExpedienteService.getContacto(contactoExpedienteId)
                .then(data => {
                    $$("ContactosExpedientefrm").setValues(data);
                })
                .catch((err) => {
                    var error = err.response;
                    var index = error.indexOf("Cannot delete or update a parent row: a foreign key constraint fails");
                    if (index != -1) {
                        messageApi.errorRestriccion()
                    } else {
                        messageApi.errorMessageAjax(err);
                    }
                });
        } else {
            // Se pretende crear una nueva relación
            var data = {
                expedienteId: expedienteId
            };
            $$("ContactosExpedientefrm").setValues(data);
        }

    },
    accept: () => {
        contaError = 0;
        var correo = $$('correoContacto').getValue();

        if (correo.length == 0) {
            if (!$$('contactoNombre').validate()) {
                messageApi.errorMessage(translate("debe rellenar los campos correctamente"));
                return;
            }

        }
        if (correo.length > 0) {
            if (!$$('contactoNombre').validate() || !$$('correoContacto').validate()) {
                messageApi.errorMessage(translate("debe rellenar los campos correctamente"));
                return;
            }
        }
        ContactosExpedienteWindow.enviaDatos();
    },

    enviaDatos: () => {
        $$('btnAceptarContactoWindow').disable();//desactivamos el botan para que no se puedan producir mas llamadas hasta que finalice el proceso
        var data = $$("ContactosExpedientefrm").getValues();
        // controlamos si es un alta o una modificación.
        if (data.contactoExpedienteId) {
            // Es una modificación
            contactosExpedienteService.putContacto(data)
                .then(row => {
                    // Hay que cerrar la ventana y refrescar el grid
                    $$('contactosExpedienteWindow').hide();
                    ContactosExpedienteWindow.refreshGridCloseWindow(data.expedienteId);
                })
                .catch((err) => {
                    var error = err.response;
                    var index = error.indexOf("Cannot delete or update a parent row: a foreign key constraint fails");
                    if (index != -1) {
                        messageApi.errorRestriccion()
                    } else {
                        messageApi.errorMessageAjax(err);
                    }
                });
        } else {
            // es un alta
            data.contactoExpedienteId = 0;
            contactosExpedienteService.postContacto(data)
                .then(row => {
                    // Hay que cerrar la ventana y refrescar el grid
                    $$('contactosExpedienteWindow').hide();
                    ContactosExpedienteWindow.refreshGridCloseWindow(data.expedienteId);
                })
                .catch((err) => {
                    var error = err.response;
                    var index = error.indexOf("Cannot delete or update a parent row: a foreign key constraint fails");
                    if (index != -1) {
                        messageApi.errorRestriccion()
                    } else {
                        messageApi.errorMessageAjax(err);
                    }
                });
        }
    },
    cancel: () => {
        $$('contactosExpedienteWindow').hide();
    },
    refreshGridCloseWindow: (expedienteId) => {
        contactosExpedienteService.getContactosExpediente(expedienteId)
            .then(rows => {
                $$("contactosExpedienteGrid").clearAll();
                $$("contactosExpedienteGrid").parse(generalApi.prepareDataForDataTable("contactoExpedienteId", rows));
                $$('contactosExpedienteWindow').hide();
            })
            .catch((err) => {
                $$('contactosExpedienteWindow').hide();
                var error = err.response;
                var index = error.indexOf("Cannot delete or update a parent row: a foreign key constraint fails");
                if (index != -1) {
                    messageApi.errorRestriccion()
                } else {
                    messageApi.errorMessageAjax(err);
                }
            });
    }

}