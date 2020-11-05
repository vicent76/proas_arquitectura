import { JetView } from "webix-jet";
import { devConfig } from "../config/config";



export default class ImprimirWindow extends JetView {
    config() {
        const translate = this.app.getService("locale")._;
        const _view1 = {
            template: "<div id='report_viewer'></div>"
        }
        var _view = {
            view: "window",
            id: "imprimirWindow",
            position: "center", move: true, resize: true,
            //width: 200,
            //height: 400,
            fullscreen: true,
            head: {
                view: "toolbar", cols: [
                    { view: "label", label: translate("IMPRESIÓN DE FACTURAS") },
                    {
                        view: "icon", icon: "mdi mdi-close", click: () => {
                            $$('imprimirWindow').hide();
                        }
                    }
                ]
            }, modal: true,
            body: _view1
        };
        return _view;
    }
    init(view, url) {
        devConfig.getConfigMysql()
        .then(conf => {
            myconfig= conf
        })
        .catch((inXhr) => {
            fail(inXhr);
        });
    }
    showWindow(ofertaId, file) {
       
    }
    cancel() {
        $$('imprimirWindow').hide();
    }
}