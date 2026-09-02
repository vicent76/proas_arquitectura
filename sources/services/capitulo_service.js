import { cookieApi } from "../utilities/cookies";
import { devConfig } from "../config/config";
export const capituloService = {

    getCapitulos: () => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => {
                    var url = conf.urlApi + "/api/grupo_articulo/departamento/son/tecnicos/" + 5;
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
    getCapitulo: (grupoArticuloId) => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => {
                    var url = conf.urlApi + "/api/grupo_articulo/" + grupoArticuloId;
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
    getCapitulosPorGrupo: (grupoArticuloId) => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig().
                then(conf => {
                    var url = conf.urlApi + "/api/grupo_articulo/departamento/son/tecnicos/"  + 5 + "/" + grupoArticuloId;
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

    postCapitulo: (capitulo) => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => {
                    var url = conf.urlApi + "/api/grupo_articulo/tecnicos";
                    return webix.ajax()
                        .timeout(10000)
                        .headers({
                            "Content-Type": "application/json"
                        })
                        .post(url, {capitulo: capitulo})

                })
                .then((result) => {
                    success(result.json());
                })
                .catch((err) => {
                    fail(err);
                });
        });
    },

 
    putCapitulo: (capitulo) => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => {
                    var url = conf.urlApi + "/api/grupo_articulo/tecnicos/"+ capitulo.grupoArticuloId;
                    return webix.ajax()
                        .timeout(10000)
                        .headers({
                            "Content-Type": "application/json"
                        })
                        .put(url,{capitulo: capitulo})
                })
                .then((result) => {
                    success(result.json());
                })
                .catch((err) => {
                    fail(err);
                });
        });
    },

  
    deleteCapitulo: (grupoArticuloId) => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => {
                    var url = conf.urlApi + "/api/grupo_articulo/" + grupoArticuloId;
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
    }
}