import {usuarioService} from '../services/usuario_service';
import { devConfig } from "../config/config";

export const webPushApi = {
    pushServicio: (servicioId) => {
        return new Promise((success, fail) => {
            devConfig.getConfig()
                .then(conf => {
                    var url = conf.one_push_url;
                    var user = usuarioService.getUsuarioCookie();
                    var data = {
                        app_id: conf.one_app_id,
                        included_segments: ["Active Users"],
                        contents: { "en": "El usuario " + user.nombre + " ha dado de alta un nuevo servicio. Haga clic en este mensaje para verlo" },
                        headings: { "en": "NUEVA SOLICITUD DE SERVICIO EN LA PLATAFORMA" },
                        url: conf.urlApi + "/ServicioDetalle.html?ServicioId=" + servicioId
                    }
                    return webix.ajax()
                        .timeout(10000)
                        .headers({
                            "Content-Type": "application/json",
                            "Authorization": "Basic " + conf.one_api_key
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
    }
};