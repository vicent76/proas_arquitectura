import { devConfig } from "../config/config";
export const textosPredeterminadosService = { 
    getTextos: () => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => {
                    var url = conf.urlApi +  "/api/textos_predeterminados";
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

    getTexto: (id) => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => {
                    var url = conf.urlApi +  "/api/textos_predeterminados/" + id;
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
    }
}
