import { JetView } from "webix-jet";
import { usuarioService } from "../services/usuario_service";
import { messageApi } from "../utilities/messages";
import { usuariosDepartamentos } from "../subviews/usuarios_departamentos"
import { languageService} from "../locales/language_service";


var usuarioId = 0;

export default class UsuarioForm extends JetView {
    config() {
        const translate = this.app.getService("locale")._;
        const _usuarioDepartamentos = usuariosDepartamentos.getGrid(this.app);
        const _view = {
            view: "layout",
            id: "usuariosForm",
            rows: [
                {
                    view: "toolbar", padding: 3, elements: [
                        { view: "icon", icon: "mdi mdi-account-key", width: 37, align: "left" },
                        { view: "label", label: translate("Usuarios") }
                    ]
                },
                {
                    view: "form",

                    id: "frmUsuarios",
                    elements: [
                        {
                            cols: [
                                {
                                    view: "text", name: "usuarioId", width: 100, disabled: true,
                                    label: translate("ID"), labelPosition: "top"
                                },
                                {
                                    view: "text", name: "nombre", required: true, id: "firstField",
                                    label: translate("Nombre usuario"), labelPosition: "top"
                                },
                                {
                                    view: "text", name: "login", required: true,
                                    label: translate("Login"), labelPosition: "top"
                                }
                            ]
                        },
                        {
                            cols: [
                                { width: 100 },
                                { view: "text", name: "pass01", label: translate("Contraseña"), type: "password", labelPosition: "top", id: "pass01" },
                                { view: "text", name: "pass02", label: translate("Repita contraseña"), type: "password", labelPosition: "top", id: "pass02" },
                            ]
                        },
                        {
                            cols: [
                                { width: 100 },
                                { view: "text", name: "email", label: translate("Correo electronico"),  labelPosition: "top", id: "email" },
                                { view: "combo",  name: "nivel",label: translate("nivel de usuario"),  labelPosition: "top", id: "cmbNivelUsu", required: true, options: {} },
                            ]
                        },
                        {
                            margin: 5, cols: [
                                { gravity: 5 },
                                { view: "button", label: translate("Cancelar"), click: this.cancel, hotkey: "esc" },
                                { view: "button", label: translate("Aceptar"), click: this.accept, type: "form", hotkey: "enter" }
                            ]
                        }
                    ],
                    rules: {
                        "email": webix.rules.isEmail
                    }
                },
                _usuarioDepartamentos,
                { minheight: 600 }
            ]
        }
        return _view;
    }
    urlChange(view, url) {
        usuarioService.checkLoggedUser();
        languageService.setLanguage(this.app, 'es');
        if (url[0].params.usuarioId) {
            usuarioId = url[0].params.usuarioId;
        }
        if(usuarioId != 0) {
            this.load(usuarioId);
            usuariosDepartamentos.loadDepartamentosGrid(usuarioId);
           
        } else {
            this.loadNivelUsu();
            usuariosDepartamentos.loadDepartamentosGrid(null);
        }
        webix.delay(function () { $$("firstField").focus(); });
    }
    load(usuarioId) {
        usuarioService.getUsuario(usuarioId)
            .then((usuario) => {
                $$("frmUsuarios").setValues(usuario);
                this.loadNivelUsu(usuario.nivel);
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
    cancel() {
        this.$scope.show('/top/usuarios');
    }
    accept() {
        const translate = this.$scope.app.getService("locale")._;
        if (!$$("frmUsuarios").validate()) {
            messageApi.errorMessage(translate("Debe rellenar los campos correctamente"));
            return;
        }
        var pass01 = $$("pass01").getValue();
        var pass02 = $$("pass02").getValue();
        if (pass01 != "" && (pass01 != pass02)) {
            messageApi.errorMessage(translate("Las contraseñas introducidas no coinciden"));
            return;
        }
        var data = $$("frmUsuarios").getValues();
        delete data.pass01;
        delete data.pass02;
        if (pass01 != "")
            data.password = pass01

        if (usuarioId == 0) {
            data.usuarioId = 0;
            usuarioService.postUsuario(data)
                .then((result) => {
                    this.$scope.show('/top/usuarios?usuarioId=' + result.usuarioId);
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
            usuarioService.putUsuario(data)
                .then(() => {
                    this.$scope.show('/top/usuarios?usuarioId=' + data.usuarioId);
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

    loadNivelUsu(nivelUsuId) {
        var parametros = usuarioService.prepareDataForCombo();
        var list = $$("cmbNivelUsu").getPopup().getList();
        list.clearAll();
        list.parse(parametros);
        if (nivelUsuId || nivelUsuId == 0) {
            $$("cmbNivelUsu").setValue(nivelUsuId);
            $$("cmbNivelUsu").refresh();
        }
        return;
    }
    
}