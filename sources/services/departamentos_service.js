import { devConfig } from "../config/config";
export const departamentosService = { 
    getDepartamentos: () => {
        return new webix.promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => {
                    var url = conf.urlApi + "/api/departamentos";
                    return webix.ajax()
                        .timeout(20000)
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
}