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
                    id: "administracion",icon: "mdi mdi-laptop-chromebook",  value: translate("Administración"), open: false,
                    data: [
                        {id: "parametrosForm", icon: "mdi mdi-settings", value: translate("Parametros")},
                        {id: "usuarios", icon: "mdi mdi-account-key", value: translate("Usuarios")},
                        {id: "capitulos", icon: "mdi mdi-swap-vertical", value: translate("Capitulos")},
                        {id: "estadosParteProfesional", icon: "mdi mdi-swap-horizontal", value: translate("Estados de parte(profesional)")},
                        {id: "estadosPresupuesto", icon: "mdi mdi-sync", value: translate("Estados de presupuesto")},
                        {id: "rechazosPresupuesto", icon: "mdi  mdi-thumb-down", value: translate("Causas rechazo de presupuesto")},
                    ]
                },
                {
                    id: "gestion", icon: "mdi mdi-book",  value: translate("Gestión"), open: true,
                    data: [
                        {id: "ofertas", icon: "mdi mdi-currency-eur", value: translate("Ofertas")},
                        
                    ]
                },
            ]
        };
        return mainMenu;
    }
    init() {
        this.use(plugins.Menu, "main:menu");
    }
}

