import { devConfig } from "../config/config";
export const tiposProyectoService = {
    getTiposProyecto: (usuario) => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => {
                    var url = conf.urlApi + "/api/tipos_proyectos/departamento/tecnico/" + usuario + "/" + 5;
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
                .catch((inXhr) => {
                    fail(inXhr);
                });
        });
    },
    getTipoProyecto: (tipoProyectoId) => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => {
                    var url = conf.urlApi + "/api/tipos_proyectos/" + tipoProyectoId;
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
                .catch((inXhr) => {
                    fail(inXhr);
                });
        });
    },

    postTipoProyecto: (tipoProyecto) => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => {
                    var url = conf.urlApi + "/api/tipos_proyectos";
                    return webix.ajax()
                        .timeout(10000)
                        .headers({
                            "Content-Type": "application/json"
                        })
                        .post(url, {tipoProyecto: tipoProyecto})

                })
                .then((result) => {
                    success(result.json());
                })
                .catch((err) => {
                    fail(err);
                });
        });
    },

 
    putTipoProyecto: (tipoProyecto) => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => {
                    var url = conf.urlApi + "/api/tipos_proyectos/"+ tipoProyecto.tipoProyectoId;
                    return webix.ajax()
                        .timeout(10000)
                        .headers({
                            "Content-Type": "application/json"
                        })
                        .put(url,{tipoProyecto: tipoProyecto})
                })
                .then((result) => {
                    success(result.json());
                })
                .catch((err) => {
                    fail(err);
                });
        });
    },

  
    deleteTipoProyecto: (tipoProyectoId) => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => {
                    var url = conf.urlApi + "/api/tipos_proyectos/" + tipoProyectoId;
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