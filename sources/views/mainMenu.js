import { JetView, plugins } from "webix-jet";


export default class MainMenu extends JetView {
    config() {
        const translate = this.app.getService("locale")._;
        var mainMenu = {
            view: "sidebar",
            width: 280,
            id: "main:menu",
            activeTitle: true, select: true,
            data: [
                {
                    id: "inicio", icon: "mdi mdi-home", value: "Inicio"
                },
                {
                    id: "gestion", icon: "mdi mdi-book",  value: translate("Gestión"), open: true,
                    data: [
                        {id: "ofertas", icon: "mdi mdi-currency-eur", value: translate("Ofertas")},
                        
                    ]
                }
            ]
        };
        return mainMenu;
    }
    init() {
        this.use(plugins.Menu, "main:menu");
    }
}

