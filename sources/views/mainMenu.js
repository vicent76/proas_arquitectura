import { JetView, plugins } from "webix-jet";

export default class MainMenu extends JetView {
    config() {
        const _ = this.app.getService("locale")._;

        return {
            view: "sidebar",
            width: 280,
            id: "main:menu",
            activeTitle: true,
            select: true,
            collapsed: true,
            data: [
                { id: "inicio", icon: "mdi mdi-home", value: "Inicio" },
                {
                    id: "administracion", icon: "mdi mdi-laptop-chromebook",
                    value: _("Administración"),
                    data: [
                        { id: "usuarios", icon: "mdi mdi-account-key", value: _("Usuarios") },
                        { id: "tiposProyecto", icon: "mdi mdi-swap-vertical", value: _("Tipos de proyecto") },
                        { id: "capitulos", icon: "mdi mdi-folder", value: _("Capítulos") },
                        { id: "unidadesObra", icon: "mdi mdi-swap-horizontal", value: _("Unidades de obra") }
                    ]
                },
                {
                    id: "gestion", icon: "mdi mdi-book", value: _("Gestión"), open: true,
                    data: [
                        { id: "expedientes", icon: "mdi mdi-note-text", value: _("Expedientes") },
                        { id: "ofertas", icon: "mdi mdi-currency-eur", value: _("Ofertas de venta") }
                    ]
                }
            ],
            on: {
                onAfterSelect: (id) => {
                    if (id === "expedientes") {
                        webix.storage.local.remove("tabsExpedientesActive");
                    }

                    // Aquí puedes agregar más acciones por id
                    console.log("Menú seleccionado:", id);
                }
            }
        };
    }

    init() {
        this.use(plugins.Menu, "main:menu");
    }
}
