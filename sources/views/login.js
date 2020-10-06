import { JetView } from "webix-jet";
import { usuarioService } from "../services/usuario_service";
import { messageApi } from "../utilities/messages";
import { devConfig } from "../config/config"

var esCliente = false;

export default class Login extends JetView {
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
                                    id: "frmLogin",
                                    elements: [
                                        {
                                            view: "label", height: 100, align: "center",
                                            label: "<img src='assets/img/logo.png'/>"
                                        },
                                        {
                                            view: "label", align: "center", id: "version",
                                            label: "VRS"
                                        },
                                        {
                                            view: "text", name: "login", id: "login", required: true,
                                            label: "Usuario", labelPosition: "top"
                                        },
                                        {
                                            view: "text", type: "password", name: "password", id: "password", required: true,
                                            label: "Contraseña", labelPosition: "top"
                                        },
                                        {
                                            view:"checkbox", 
                                            id:"recordar", 
                                            name: "recordar",
                                            label:"Recordarme en este equipo", 
                                            labelWidth:200, 
                                            labelAlign:"left",
                                            value:0
                                        },       
                                        {
                                            margin: 5, cols: [
                                                { view: "button", label: "Aceptar", click: this.accept, type: "form", hotkey: "enter" },
                                                { view: "button", label: "Cancelar", click: this.cancel, hotkey: "esc" }
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
                acceso = usuarioService.getAccesoCookie();
                if(acceso) {
                    $$("login").setValue(acceso.login);
                    $$('password').setValue(acceso.password);
                    $$('recordar').setValue(1);
                }
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

    }
    cancel() {

    }
    accept() {
        if (!$$("frmLogin").validate()) {
            messageApi.errorMessage("Debe rellenar los campos correctamente");
            return;
        }
        let usuario;
        var data = $$("frmLogin").getValues();
        var acceso = {};
        usuarioService.getLogin(data.login, data.password)
            .then(result => {
                if(result) {
                    usuario = result;
                    usuarioService.setUsuarioCookie(usuario);
                    if(data.recordar)  {
                        acceso = {
                            login: data.login,
                            password: data.password
                        }
                        usuarioService.setAccesoCookie(acceso)
                    } else {
                        usuarioService.deleteAccesoCookie();
                    }
                    this.$scope.show('top/inicio');
                } 
            })
            .catch(err => {
                messageApi.errorMessageAjax(err.response);
            });
    }
}