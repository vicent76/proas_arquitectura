import { devConfig } from "../config/config";
export const proveedoresService = {
    getProveedores: () => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => {
                    var url = conf.urlApi + "/api/proveedores";
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
    
    getProveedor: (proveedorId) => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => {
                    var url = conf.urlApi + "/api/proveedores/" + proveedorId;
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

    getPrecioUnitarioArticulo(proveedorId, articuloId) {
        return new webix.promise((success, fail) => {
            devConfig.getConfig().
            then(conf => {
                var url = conf.urlApi + "/api/proveedores/tarifa/por/articuloId/" + proveedorId + "/" + articuloId;
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
        })

    },

    getTarifaProveedorProfesion(tipoProfesionalId, proveedorId) {
        if(!tipoProfesionalId || tipoProfesionalId == "") tipoProfesionalId = 0;
        return new webix.promise((success, fail) => {
            devConfig.getConfig().
            then(conf => {
                var url = conf.urlApi + "/api/tarifas_proveedor/articulos/proveedor/" + proveedorId +"/" + tipoProfesionalId;
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
        })

    }
    
}