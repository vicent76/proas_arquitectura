import { cookieApi } from "../utilities/cookies";
import { devConfig } from "../config/config";

export const contactosExpedienteService = {
    getContactos: () => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => {
                    var url = conf.urlApi + "/api/contactos_expedientes";
                    return webix.ajax()
                        .timeout(20000)
                        .headers({
                            "Content-Type": "application/json",
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
    getSyncContactos: () => {
        var url = devConfig.getApiUrl() + "/api/contactos_expedientes";
        var res = webix.ajax()
            .headers({
                "Content-Type": "application/json",
            })
            .sync()
            .get(url);
        var result = { data: null, err: null };
        if (res.status != 200) {
            result.err = res;
        } else {
            result.data = JSON.parse(res.response);
        }
        return result;
    },
    getContacto: (contactoExpedienteId) => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig().
                then(conf => {
                    var url = conf.urlApi + "/api/contactos_expedientes/" + contactoExpedienteId;
                    return webix.ajax()
                        .timeout(20000)
                        .headers({
                            "Content-Type": "application/json",
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
    getContactosExpediente: (expedienteId) => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig().
                then(conf => {
                    var url = conf.urlApi + "/api/contactos_expedientes/contactos/" + expedienteId;
                    return webix.ajax()
                        .timeout(20000)
                        .headers({
                            "Content-Type": "application/json",
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
    postContacto: (contacto) => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => {
                    var url = conf.urlApi + "/api/contactos_expedientes";
                    return webix.ajax()
                        .timeout(20000)
                        .headers({
                            "Content-Type": "application/json"
                        })
                        .post(url, { contactoExpediente: contacto })

                })
                .then((result) => {
                    success(result.json());
                })
                .catch((err) => {
                    fail(err);
                });
        });
    },
    putContacto: (contacto) => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => {
                    var url = conf.urlApi + "/api/contactos_expedientes/" + contacto.contactoExpedienteId;
                    return webix.ajax()
                        .timeout(20000)
                        .headers({
                            "Content-Type": "application/json",
                        })
                        .put(url, { contactoExpediente: contacto })
                })
                .then((result) => {
                    success(result.json());
                })
                .catch((err) => {
                    fail(err);
                });
        });
    },
    deleteContacto: (contactoExpedienteId) => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => {
                    var url = conf.urlApi + "/api/contactos_expedientes/" + contactoExpedienteId;
                    return webix.ajax()
                        .timeout(20000)
                        .headers({
                            "Content-Type": "application/json",
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
    }
}