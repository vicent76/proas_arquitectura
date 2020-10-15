import { devConfig } from "../config/config";
export const ofertasService = {
    getOfertas: (usuarioId) => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => {
                    var url = conf.urlApi + "/api/ofertass/usuario/logado/departamento/"+ usuarioId + "/" + 8;
                    return webix.ajax()
                        .timeout(10000)
                        .headers({
                            "Content-Type": "application/json"
                        })
                        .get(url);
                })
                .then((result) => {
                    success(result.json());
                })
                .catch((inXhr) => {
                    fail(inXhr);
                });
        });
    },
    getEmpresa: (empresaId) => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => {
                    var url = conf.urlApi + "/api/empresas/" + empresaId;
                    return webix.ajax()
                        .timeout(10000)
                        .headers({
                            "Content-Type": "application/json"
                        })
                        .get(url);
                })
                .then(function (result) {
                    success(result.json());
                })
                .catch(function (inXhr) {
                    fail(inXhr);
                });
        })

    },
    postEmpresa: (empresa) => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => {
                    var url = conf.urlApi + "/api/empresas";
                    return webix.ajax()
                        .timeout(10000)
                        .headers({
                            "Content-Type": "application/json"
                        })
                        .post(url, {empresa: empresa});
                })
                .then(function (result) {
                    success(result.json());
                })
                .catch(function (inXhr) {
                    fail(inXhr);
                });

        });
    },
    putEmpresa: (empresa) => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => {
                    var url = conf.urlApi + "/api/empresas";
                    return webix.ajax()
                        .timeout(10000)
                        .headers({
                            "Content-Type": "application/json"
                        })
                        .put(url, {empresa: empresa});
                })
                .then(function (result) {
                    success(result.json());
                })
                .catch(function (inXhr) {
                    fail(inXhr);
                });
        });
    },
    deleteEmpresa: (empresaId) => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => {
                    var url = conf.urlApi + "/api/empresas/" + empresaId;
                    return webix.ajax()
                        .timeout(10000)
                        .headers({
                            "Content-Type": "application/json"
                        })
                        .del(url);
                })
                .then(function (result) {
                    success(result.json());
                })
                .catch(function (inXhr) {
                    fail(inXhr);
                });
        });
    }
}