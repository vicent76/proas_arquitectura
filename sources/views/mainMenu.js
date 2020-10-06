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
                /* {
                    id: "Reparaciones", icon: "mdi mdi-book",  value: translate("Reparaciones"), open: true,
                    data: [
                        {id: "facturas", icon: "mdi mdi-currency-eur", value: translate("Facturas")},
                        {id: "servicios", icon: "mdi mdi-transcribe", value: translate("Servicios")},
                        {id: "tarifas", icon: "mdi mdi-format-list-numbers", value: translate("Tarifas")}
                    ]
                } */
            ]
        };
        return mainMenu;
    }
    init() {
        this.use(plugins.Menu, "main:menu");
    }
}

