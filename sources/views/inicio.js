import { JetView } from "webix-jet";
import { usuarioService } from "../services/usuario_service";
import { languageService} from "../locales/language_service";


export default class Inicio extends JetView {
    config() {
		const translate = this.app.getService("locale")._;
        return   {
            view: "label", height: 800,
            label: "<img src='assets/img/arquitectura.png' width='100%' />"
        }
    }
    init() {
        usuarioService.checkLoggedUser();
        languageService.setLanguage(this.app, 'es');
    }
}
