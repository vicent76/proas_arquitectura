import { JetView, plugins } from "webix-jet";
import { usuarioService } from "../services/usuario_service";
import { versionService } from "../services/version_service";


export default class MainFooter extends JetView {
   
	config() {
		var app = this.app;
		const langs = app.getService("locale");
		const themes = app.getService("theme");
		const usu = usuarioService.getUsuarioCookie();
		const translate = this.app.getService("locale")._;
		var mainFooter = {
            view: "label", 
            id: "vers", 
            align:"center",
            label: "NREG: ",
            height: 60,
            minWidth:100,
            
		};
		return mainFooter;
	}
	init() {
         // Obtener la versión
         let ano = new Date().getFullYear()
         versionService.getVersionFooter()
         .then(vrs => {
             $$("vers").config.label = "Proasistencia "+vrs.version+" - Aplicación general © Ariadna Software S.L. " + ano;
             $$("vers").refresh();
         })
         .catch(err => {
             var error = err.response;
                            var index = error.indexOf("Cannot delete or update a parent row: a foreign key constraint fails");
                            if(index != -1) {
                                messageApi.errorRestriccion()
                            } else {
                                messageApi.errorMessageAjax(err);
                            }
         });
	}

}
