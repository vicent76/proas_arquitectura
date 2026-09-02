import { JetView } from "webix-jet";
import { usuarioService } from "../services/usuario_service";
import { proveedoresService } from "../services/proveedores_service";
import { messageApi } from "../utilities/messages";
import { devConfig } from "../config/config"

var esCliente = false;
var propuestaId = null;
var expedienteId = null;
var subcontrataId = null;
var proveedorId = null;
var usuario = null;
var usuarioId

export default class LoginExterno extends JetView {
    config() {
        var _view = {
            view: "layout",
            css: "loginBack",
            rows: [
                {

                },
                {
                    cols: [
                        {

                        },
                        {
                            rows: [
                                {
                                    view: "form", width: 300, css: "round-border",
                                    id: "frmLoginExterno",
                                    elements: [
                                        {
                                            view: "label", height: 100, align: "center",
                                            label: "<img src='assets/img/logo.png' width='155' height='50' />"
                                        },
                                        {
                                            view: "label", align: "center", id: "version",
                                            label: "VRS"
                                        },

                                        {
                                            view: "text", type: "password", name: "password", id: "password", required: true,
                                            label: "Contraseña", labelPosition: "top"
                                        },
                                        {
                                            view: "checkbox",
                                            id: "recordar",
                                            name: "recordar",
                                            label: "Recordarme en este equipo",
                                            labelWidth: 200,
                                            labelAlign: "left",
                                            value: 0
                                        },
                                        {
                                            margin: 5, cols: [
                                                { view: "button", label: "Aceptar", click: this.accept, type: "form", hotkey: "enter" }
                                            ]
                                        }
                                    ]
                                }
                            ]

                        },
                        {

                        }
                    ]
                },
                {
                }
            ]
        }
        return _view;
    }
    init() {
        var acceso;
        // Obtener la versión
        devConfig.getVersion()
            .then(vrs => {
                $$("version").data.label = "VRS " + vrs.version;
                $$("version").refresh();
                acceso = usuarioService.getAccesoCookieExterno();
                if (acceso) {
                    $$('password').setValue(acceso.password);
                    $$('recordar').setValue(1);
                }
                this.loadData();
            })
            .catch(err => {
                messageApi.errorMessageAjax(err);
            });

    }



    cancel() {

    }
    accept() {
        if (!$$("frmLoginExterno").validate()) {
            messageApi.errorMessage("Debe rellenar los campos correctamente");
            return;
        }
        let usuario;
        var data = $$("frmLoginExterno").getValues();
        var acceso = {};
        proveedoresService.getLoginExterno(data.password)
            .then(result => {
                if (result) {
                    if (result.length == 0) {
                        return messageApi.errorMessage("NIF/CIF incorrecto");
                    } else {
                        if(result.proveedorId != proveedorId) {
                             return messageApi.errorMessage("NIF/CIF incorrecto");
                        }
                    }
                    
                    usuario = result;
                    usuarioService.setUsuarioCookieExterno(usuario);
                    if (data.recordar) {
                        acceso = {
                            password: data.password
                        }
                        usuarioService.setAccesoCookieExterno(acceso)
                    } else {
                        usuarioService.deleteAccesoCookieExterno();
                    }
                    this.$scope.show('/propuestaExternaForm?propuestaId=' + propuestaId + "&subcontrataId=" + subcontrataId + '&expedienteId=' + expedienteId);
                }
            })
            .catch(err => {
                messageApi.errorMessageAjax(err.responseText);
            });
    }

    loadData() {
        const url = this.getUrl();

        if (url[0].params.propuestaId) {
            propuestaId = url[0].params.propuestaId;
        }
        if (url[0].params.subcontrataId) {
            subcontrataId = url[0].params.subcontrataId;
        }
        if (url[0].params.expedienteId) {
            expedienteId = url[0].params.expedienteId;
        }
        if (url[0].params.proveedorId) {
            proveedorId = url[0].params.proveedorId;
        }
    }

}