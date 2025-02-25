// locales_afectados_window
// Esta es una vista no webix jet para mostrar al crear o modificar
// la asociación entre un servicio y los locales afectados ligados a el
import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { usuarioService } from "../services/usuario_service";
import { departamentosService } from "../services/departamentos_service"

var _usuarioDepartamentosWindowCreated = false;
var translate;
var usuarioId;
var departamentoId;
var usuarioDepartamentoId;

export const usuarioDepartamentosWindow = {
    getWindow: (app) => {
        if (_usuarioDepartamentosWindowCreated) return; // Evitamos que se cree dos veces la misma venta
        translate = app.getService("locale")._;
        const _view2 = {
            view: "form",
            id: "localesAfectadosWin",
            rows: [
                {
                    view: "toolbar", padding: 3, elements: [
                        { view: "icon", icon: "mdi mdi-office-building", width: 37, align: "left" },
                        { view: "label", label: "Departamentos asociados" }
                    ]
                },
                {
                    view: "form",
                    id: "usuariosDepartamentosfrm",
                    elements: [
                        {
                            rows: [
                                { template: "Elija departammento asociado", type: "section" },
                                {
                                    cols: [
                                        {
                                            view: "combo", id: "cmbDepartamentos", name: "cmbDepartamentos", required: true, options: {},
                                            label: "Departamentos", labelPosition: "top"
                                        }
                                    ]
                                }
                            ]
                        },
                        
                        {
                            margin: 5, cols: [
                                { gravity: 5 },
                                { view: "button", id: "btnCancelarWindow", label: translate("Cancelar"), click: usuarioDepartamentosWindow.cancel, hotkey: "esc" },
                                { view: "button", id: "btnAceptarWindow", label: translate("Aceptar"), click: usuarioDepartamentosWindow.accept, type: "form", hotkey: "enter" }
                            ]
                        }
                       
                    ],
                    on: {
                        onValidationError:function(key, obj){
                            
                        }
                    }
                }
            ]
        };
        webix.ui({
            view: "window",
            id: "usuarioDepartamentosWindow",
            position: "center", move: true, resize: true,
            width: 800,
            head: {
                view: "toolbar", cols: [
                    {},
                    {
                        view: "icon", icon: "mdi mdi-close", click: () => {
                            $$('usuarioDepartamentosWindow').hide();
                        }
                    }
                ]
            }, modal: true,
            body: _view2
        });
        _usuarioDepartamentosWindowCreated = true; // La ventana se ha creado e informamos al proceso
        return
    },
    loadWindow: (usuarioid, departamentoid, usuariodepartamentoid) => {
        usuarioId = usuarioid;
        departamentoId = departamentoid
        usuarioDepartamentoId = usuariodepartamentoid;
        $$('usuarioDepartamentosWindow').show();
        if (departamentoId) {
            // Se pretende editar una relación existente
                    usuarioDepartamentosWindow.loadDepartamentos(departamentoId);
              
        } else {
            // Se pretende crear una nueva relación
            usuarioDepartamentosWindow.loadDepartamentos(null);
        }

    },
    accept: () => {
        if (!$$("usuariosDepartamentosfrm").validate()) {
            messageApi.errorMessage("Debe rellenar los campos correctamente");
            return;
        }
        var data = $$("usuariosDepartamentosfrm").getValues();

        var departamento = {}
        if(departamentoId) {
            departamento = {
                usuarioId: usuarioId,
                departamentoId: data.cmbDepartamentos,
                usuarioDepartamentoId: usuarioDepartamentoId
            }
        }else {
            departamento = {
                usuarioId: usuarioId,
                departamentoId: data.cmbDepartamentos,
                usuarioDepartamentoId: 0
            }
        }
        
        if(departamentoId) {
            //es una modificacion
            usuarioService.putUsuarioDepartamento(departamento.usuarioDepartamentoId, departamento)
            .then( rows => {
                $$('usuarioDepartamentosWindow').hide();
                usuarioDepartamentosWindow.refreshGridCloseWindow();
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

        } else {
            //es un alta
            usuarioService.postUsuarioDepartamento(departamento)
            .then( rows => {
                $$('usuarioDepartamentosWindow').hide();
                usuarioDepartamentosWindow.refreshGridCloseWindow();
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

        }
    },

  
    cancel: () => {
        $$('usuarioDepartamentosWindow').hide();
    },
    refreshGridCloseWindow: () => {
       
        
            usuarioService.getDepartamentosAsociados(usuarioId)
            .then(rows => {
                $$("usuarioDepartamentosGrid").clearAll();
                $$("usuarioDepartamentosGrid").parse(generalApi.prepareDataForDataTable("usuarioDepartamentoId", rows));
                //$$('usuarioDepartamentosWindow').hide();
            })
            .catch((err) => {
                $$('usuarioDepartamentosWindow').hide();
                var error = err.response;
                            var index = error.indexOf("Cannot delete or update a parent row: a foreign key constraint fails");
                            if(index != -1) {
                                messageApi.errorRestriccion()
                            } else {
                                messageApi.errorMessageAjax(err);
                            }
            });

    },
       
    loadDepartamentos: (departamentoId) => {
        departamentosService.getDepartamentos()
            .then(rows => {
                var departamentos = generalApi.prepareDataForCombo('departamentoId', 'nombre', rows);
                var list = $$("cmbDepartamentos").getPopup().getList();
                list.clearAll();
                list.parse(departamentos);
                if (departamentoId) {
                    $$("cmbDepartamentos").setValue(departamentoId);
                    $$("cmbDepartamentos").refresh();
                }else {
                    $$("cmbDepartamentos").setValue(null);
                    $$("cmbDepartamentos").refresh();
                }
                return;
            })
    }
    
}