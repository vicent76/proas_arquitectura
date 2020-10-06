import { devConfig } from "../config/config";

export const messageApi = {
    errorMessageAjax: (inXhr) => {
        var msg = inXhr.response;
        webix.alert({
            type: "alert-error",
            title: "ERROR",
            text: msg
        });

    },
    errorMessage: (msg) => {
        webix.alert({
            type: "alert-error",
            title: "ERROR",
            text: msg
        });
    },
    normalMessage: (msg) => {
        webix.alert({
            title: "INFORMATION",
            text: msg
        });
    },

    errorRestriccion: () => {
        var msg = "Hay registros dependientes de esta entrada. No se puede eliminar."
        webix.alert({
            title: "INFORMATION",
            text: msg
        });
    }

}