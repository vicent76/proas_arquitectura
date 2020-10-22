import { devConfig } from "../config/config";
export const articulosService = { 
    getArticulos: () => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => {
                    var url = conf.urlApi + "/api/articulos";
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

    getArticuloCodigo: (codigoReparacion) => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => { 
                    var url = conf.urlApi + "/api/articulos/codigo/"+ codigoReparacion;
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

    getArticulosTarifas: (clienteId, proveedorId, tipoProfesionalId) => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => { 
                    var url = conf.urlApi + "/api/articulos/tarifas/cliente/proveedor/"+ clienteId + "/" + proveedorId + "/" + tipoProfesionalId;
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
}
