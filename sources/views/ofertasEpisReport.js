import { JetView } from "webix-jet";
import { usuarioService } from "../services/usuario_service";
import { devConfig } from "../config/config";
import { parametrosService } from "../services/parametros_service";
import { messageApi } from "../utilities/messages";


var myconfig;
let propuestaId = 0, ofertaId = 0;

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
            scroll: "x,y",
            width: 1129,
            height: 775,
            fullscreen: false,
            head: {
                view: "toolbar", cols: [
                    { view: "label", id: "ofertasEpisReportLabel", label: "IMPRESIÓN DE OFERTAS" },
                    {
                        view: "icon", icon: "mdi mdi-close", click: () => {
                            $$('ofertasEpisReport').hide();
                            //$$("ofertasEpisReport").destructor();
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
                myconfig = conf
            })
            .catch((inXhr) => {
                fail(inXhr);
            });
    }
    showWindow(ofertaid, propuestaid, file, valorado, documentacion) {
        ofertaId = ofertaid;
        propuestaId = propuestaid;
        // Create the report viewer with default options
        parametrosService.getStiParams()
            .then(data => {
                var options = new Stimulsoft.Viewer.StiViewerOptions();

                Stimulsoft.Base.StiLicense.key = data.sti_key_oldest
                StiOptions.WebServer.url = myconfig.report.stiUrl;
                options.appearance.scrollbarsMode = true;
                options.appearance.fullScreenMode = false;
                options.toolbar.showSendEmailButton = false;
                options.toolbar.viewMode = Stimulsoft.Viewer.StiWebViewMode.Continuous;
                var viewer = new Stimulsoft.Viewer.StiViewer(options, "StiViewer", false);
                //var file = "/stireport/reports/factcli_reparaciones_proas.mrt";
                var report = new Stimulsoft.Report.StiReport();
                report.loadFile(file);

                // 🌍 Cultura
                report.dictionary.culture = "es-ES";
                report.cultureName = "es-ES";
                Stimulsoft.Base.Localization.Culture = "es-ES";
                Stimulsoft.Base.Localization.CultureName = "es-ES";
                Stimulsoft.Base.Localization.StiLocalization.setLocalizationFile("../../stireport/localization/es.xml", true);
                if (!documentacion) {
                    if (propuestaId) $$("ofertasEpisReportLabel").setValue("IMPRESIÓN DE HOJA DE ENCARGO");

                    $$('ofertasEpisReport').show();



                    if (propuestaId) {
                        // ✅ Fecha formateada manualmente
                        const fechaOriginal = new Date(); // <-- reemplázalo con tu propuesta.fechaOferta
                        const fechaFormateada = fechaOriginal.toLocaleDateString("es-ES", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                        });

                        // 📌 Asignar variable del reporte
                        report.dictionary.variables.getByName("fechaOfertaFormateada").valueObject = fechaFormateada;

                    }

                    var connectionString = "Server=" + myconfig.report.host + ";";
                    connectionString += "Database=" + myconfig.report.database + ";"
                    connectionString += "UserId=" + myconfig.report.user + ";"
                    connectionString += "Pwd=" + myconfig.report.password + ";";


                    let pos = 0;
                    if (ofertaId) {
                        for (var i = 0; i < report.dataSources.items.length; i++) {
                            var str = report.dataSources.items[i].sqlCommand;
                        }
                        var sql = report.dataSources.items[pos].sqlCommand;
                        if (valorado == 0) sql = sql.replace("1 AS valorado", "0 AS valorado");
                        sql = sql + " WHERE o.ofertaId = " + ofertaId
                        report.dataSources.items[pos].sqlCommand = sql;
                    }
                    if (propuestaId) {
                        var sql = report.dataSources.items[0].sqlCommand;
                        sql = sql + " WHERE p.propuestaId =  " + propuestaId
                        report.dataSources.items[0].sqlCommand = sql;
                        /*  //
                         sql = report.dataSources.items[1].sqlCommand;
                          sql = sql + "WHERE pl.propuestaId =  " + propuestaId;
                          report.dataSources.items[1].sqlCommand = sql; */
                    }
                    viewer.report = report;
                    viewer.renderHtml("report_viewer");
                } else {
                    $$("ofertasEpisReportLabel").setValue("IMPRESIÓN DE LA DOCUMENTACÓN");

                    $$('ofertasEpisReport').show();

                    // ✅ Fecha formateada manualmente
                    const fechaOriginal = new Date(); // <-- reemplázalo con tu propuesta.fechaOferta
                    const fechaFormateada = fechaOriginal.toLocaleDateString("es-ES", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    });

                    // 📌 Asignar variable del reporte
                    report.dictionary.variables.getByName("fechaOfertaFormateada").valueObject = fechaFormateada;
                    var connectionString = "Server=" + myconfig.report.host + ";";
                    connectionString += "Database=" + myconfig.report.database + ";"
                    connectionString += "UserId=" + myconfig.report.user + ";"
                    connectionString += "Pwd=" + myconfig.report.password + ";";


                    let pos = 2;

                    if (propuestaId) {
                        var sql = report.dataSources.items[0].sqlCommand;
                        sql = sql + " WHERE p.propuestaId =  " + propuestaId
                        report.dataSources.items[0].sqlCommand = sql;
                        /*  //
                         sql = report.dataSources.items[1].sqlCommand;
                          sql = sql + "WHERE pl.propuestaId =  " + propuestaId;
                          report.dataSources.items[1].sqlCommand = sql; */
                    }

                    if (ofertaId) {
                        for (var i = 2; i < report.dataSources.items.length; i++) {
                            var sql = report.dataSources.items[i].sqlCommand;
                            if (valorado == 0) sql = sql.replace("1 AS valorado", "0 AS valorado");
                            if (i == 3) {
                                sql = sql.replace("ORDER BY 2,4", " WHERE o.ofertaId = " + ofertaId + " ORDER BY 2,4");
                            } else {
                                sql = sql + " WHERE o.ofertaId = " + ofertaId
                            }

                            report.dataSources.items[i].sqlCommand = sql;
                        }

                    }
                    viewer.report = report;
                    viewer.renderHtml("report_viewer");
                }

            })
            .catch(err => {
                messageApi.errorMessageAjax(err);
            })
    }
    cancel() {
        $$('ofertasEpisReport').hide();
    }
}