import { cookieApi } from "../utilities/cookies";
import { devConfig } from "../config/config";
export const usuarioService = {
    // getUsuarioCookie
    // Obtains usuario infor information from its cookie if there isn't
    // an usuario cookie returns null
    getUsuarioCookie: () => {
        var usuario = cookieApi.getCookie('usuarioArquitectura');
        if (!usuario) return null;
        return JSON.parse(usuario);
    },
    // setUsuarioCookie
    // Saves usuario's information in a cookie
    setUsuarioCookie: (usuario) => {
        cookieApi.setCookie('usuarioArquitectura', JSON.stringify(usuario), 1);
    },
    deleteUsuarioCookie: (usuario) => {
        cookieApi.deleteCookie('usuarioArquitectura');
    },

    getAccesoCookie: () => {
        var Acceso = cookieApi.getCookie('loginArquitectura');
        if (!Acceso) return null;
        return JSON.parse(Acceso);
    },

    setAccesoCookie: (Acceso) => {
        cookieApi.setCookie('loginArquitectura', JSON.stringify(Acceso), 100000);
    },
    deleteAccesoCookie: () => {
        cookieApi.deleteCookie('loginArquitectura');
    },
    checkLoggedUser: () => {
        // Auth url
        // Verify if exists a user cookie
        var usu = usuarioService.getUsuarioCookie();
        var authUrl = "/#!/login";
        if (!usu) {
            window.open(authUrl, '_blank');
            window.close();
            return false;
        }
        return usu;      
    },
    // getLoginEmail
    getLogin: (login, password) => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => {
                    var url = conf.urlApi + "/api/usuarios/login";
                    var data = {
                        "usuario": {
                            "login": login,
                            "password": password
                        }
                    };
                    return webix.ajax()
                        .timeout(10000)
                        .headers({
                            "Content-Type": "application/json"
                        })
                        .post(url, data)
                })
                .then(function (result) {
                    success(result.json());
                })
                .catch(function (inXhr) {
                    fail(inXhr);
                });
        });
    },
    getUsuarios: () => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => {
                    var url = conf.urlApi + "/api/usuarios/";
                    return webix.ajax()
                        .timeout(10000)
                        .headers({
                            "Content-Type": "application/json"
                        })
                        .get(url)
                })
                .then(function (result) {
                    success(result.json());
                })
                .catch(function (inXhr) {
                    fail(inXhr);
                });
        });
    },
    getUsuario: (usuarioId) => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig().
                then(conf => {
                    var url = conf.urlApi + "/api/usuarios/" + usuarioId;
                    return webix.ajax()
                        .timeout(10000)
                        .headers({
                            "Content-Type": "application/json"
                        })
                        .get(url)
                })
                .then((result) => {
                    success(result.json());
                })
                .catch((err) => {
                    fail(err);
                });
        });
    },
    getDepartamentosAsociados: (usuarioId) => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig().
                then(conf => {
                    var url = conf.urlApi + "/api/usuarios/departamentos/" + usuarioId;
                    return webix.ajax()
                        .timeout(10000)
                        .headers({
                            "Content-Type": "application/json"
                        })
                        .get(url)
                })
                .then((result) => {
                    success(result.json());
                })
                .catch((err) => {
                    fail(err);
                });
        });
    },
    postUsuario: (usuario) => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => {
                    var url = conf.urlApi + "/api/usuarios/";
                    return webix.ajax()
                        .timeout(10000)
                        .headers({
                            "Content-Type": "application/json"
                        })
                        .post(url, {usuario: usuario})

                })
                .then((result) => {
                    success(result.json());
                })
                .catch((err) => {
                    fail(err);
                });
        });
    },

    postUsuarioDepartamento: (usuarioDepartamento) => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => {
                    var url = conf.urlApi + "/api/usuarios/departamento";
                    return webix.ajax()
                        .timeout(10000)
                        .headers({
                            "Content-Type": "application/json"
                        })
                        .post(url, {departamento: usuarioDepartamento})

                })
                .then((result) => {
                    success(result.json());
                })
                .catch((err) => {
                    fail(err);
                });
        });
    },
    putUsuario: (usuario) => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => {
                    var url = conf.urlApi + "/api/usuarios/"+ usuario.usuarioId;
                    return webix.ajax()
                        .timeout(10000)
                        .headers({
                            "Content-Type": "application/json"
                        })
                        .put(url,{usuario: usuario})
                })
                .then((result) => {
                    success(result.json());
                })
                .catch((err) => {
                    fail(err);
                });
        });
    },

    putUsuarioDepartamento: (usuarioDepartamentoId, usuarioDepartamento) => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => {
                    var url = conf.urlApi + "/api/usuarios/departamento/"+ usuarioDepartamentoId;
                    return webix.ajax()
                        .timeout(10000)
                        .headers({
                            "Content-Type": "application/json"
                        })
                        .put(url,{departamento: usuarioDepartamento})
                })
                .then((result) => {
                    success(result.json());
                })
                .catch((err) => {
                    fail(err);
                });
        });
    },
    deleteUsuario: (usuarioId) => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => {
                    var url = conf.urlApi + "/api/usuarios/" + usuarioId;
                    return webix.ajax()
                        .timeout(10000)
                        .headers({
                            "Content-Type": "application/json"
                        })
                        .del(url)
                })
                .then((result) => {
                    success(result.json());
                })
                .catch((err) => {
                    fail(err);
                });
        });
    },

    deleteUsuarioDepartamento: (usuarioDepartamentoId) => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => {
                    var url = conf.urlApi + "/api/usuarios/departamento/" + usuarioDepartamentoId;
                    return webix.ajax()
                        .timeout(10000)
                        .headers({
                            "Content-Type": "application/json"
                        })
                        .del(url)
                })
                .then((result) => {
                    success(result.json());
                })
                .catch((err) => {
                    fail(err);
                });
        });
    },

    prepareDataForCombo: () => {
        var posiblesNiveles = [{
            id: 1,
            value: "Usuario"
        }, {
            id: 2,
            value: "Jefe de Equipo"
        }, {
            id: 3,
            value: "Vigilante"
        }];
        return posiblesNiveles;
    }
}