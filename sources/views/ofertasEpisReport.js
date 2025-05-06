import { JetView } from "webix-jet";
import { usuarioService } from "../services/usuario_service";
import { devConfig } from "../config/config";


var myconfig;

export default class OfertasEpisReport extends JetView {
    config() {
        const translate = this.app.getService("locale")._;
        const _view1 = {
            template: "<div id='report_viewer'></div>"
        }
        var _view = {
            view: "window",
            id: "ofertasEpisReport",
            position: "top", move: true, resize: true,
            scroll:"x,y",
            width: 1129,
            height: 775,
            fullscreen: false,
            head: {
                view: "toolbar", cols: [
                    { view: "label", label: translate("IMPRESIÓN DE OFERTAS") },
                    {
                        view: "icon", icon: "mdi mdi-close", click: () => {
                            $$('ofertasEpisReport').hide();
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
    showWindow(ofertaId,file) {
        $$('ofertasEpisReport').show();
        // Create the report viewer with default options
        var options = new Stimulsoft.Viewer.StiViewerOptions();
        Stimulsoft.Base.Localization.StiLocalization.setLocalizationFile("../stireport/localization/es.xml", true);
        Stimulsoft.Base.StiLicense.key = "6vJhGtLLLz2GNviWmUTrhSqnOItdDwjBylQzQcAOiHltN9ZO4D78QwpEoh6+UpBm5mrGyhSAIsuWoljPQdUv6R6vgv" +
            "iStsx8W3jirJvfPH27oRYrC2WIPEmaoAZTNtqb+nDxUpJlSmG62eA46oRJDV8kJ2cJSEx19GMJXYgZvv7yQT9aJHYa" +
            "SrTVD7wdhpNVS1nQC3OtisVd7MQNQeM40GJxcZpyZDPfvld8mK6VX0RTPJsQZ7UcCEH4Y3LaKzA5DmUS+mwSnjXz/J" +
            "Fv1uO2JNkfcioieXfYfTaBIgZlKecarCS5vBgMrXly3m5kw+YwpJ2v+cMXuDk3UrZgrdxNnOhg8ZHPg9ijHxqUomZZ" +
            "BzKpVQU0d06ne60j/liMH5KirAI2JCVfBcBvIcyliJos8LAWr9q/1sPR9y7LmA1eyS1/dXaxmEaqi5ubhLqlf+OS0x" +
            "FX6tlBBgegqHlIj6Fytwvq5YlGAZ0Cra05JhnKh/ohYlADQz6Jbg5sOKyn5EbejvPS3tWr0LRBH2FO6+mJaSEAwzGm" +
            "oWT057ScSvGgQmfx8wCqSF+PgK/zTzjy75Oh";
            StiOptions.WebServer.url = myconfig.report.stiUrl;
        options.appearance.scrollbarsMode = true;
        options.appearance.fullScreenMode = false;
        options.toolbar.showSendEmailButton = false;
        options.toolbar.viewMode = Stimulsoft.Viewer.StiWebViewMode.Continuous;
        var viewer = new Stimulsoft.Viewer.StiViewer(options, "StiViewer", false);
        //var file = "/stireport/reports/factcli_reparaciones_proas.mrt";
        var report = new Stimulsoft.Report.StiReport();
        report.loadFile(file);
        var connectionString = "Server=" + myconfig.report.host + ";";
        connectionString += "Database=" + myconfig.report.database + ";"
        connectionString += "UserId=" + myconfig.report.user + ";"
        connectionString += "Pwd=" + myconfig.report.password + ";";

        var pos = 0;
        for (var i = 0; i < report.dataSources.items.length; i++) {
            var str = report.dataSources.items[i].sqlCommand;
        }
        var sql = report.dataSources.items[pos].sqlCommand;
        sql = sql + " WHERE o.ofertaId = " + ofertaId
        report.dataSources.items[pos].sqlCommand = sql;
       
        viewer.report = report;
        viewer.renderHtml("report_viewer");
        
        
    }
    cancel() {
        $$('ofertasEpisReport').hide();
    }
}