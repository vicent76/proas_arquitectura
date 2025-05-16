import { JetView } from "webix-jet";
import { usuarioService } from "../services/usuario_service";
import { ofertasService } from "../services/ofertas_service";
import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { languageService} from "../locales/language_service";
import OfertasEpisReport  from "./ofertasEpisReport";



var editButton = "<span class='onEdit webix_icon wxi-pencil'></span>";
var deleteButton = "<span class='onDelete webix_icon wxi-trash'></span>";
var PrintButton = "<span class='onPrint mdi mdi-printer'></span>";
var selectOfertaId = 0;

export default class Ofertas extends JetView {
    config() {
        //PartesFormWindow.getWindow(this.app);
        const translate = this.app.getService("locale")._;
        //toolbar de la solapa ofertas
        var toolbarOfertas = {
            view: "toolbar", padding: 3, elements: [
                { view: "icon", icon: "mdi mdi-file", width: 37, align: "left" },
                { view: "label", label: "Ofertas" }
            ]
        }
        //pager de la solapa ofertas
        var pagerOfertas = {
            cols: [
                {
                    view: "button", type: "icon", icon: "wxi-plus", width: 37, align: "left", hotkey: "Ctrl+A",
                    tooltip: translate("Nuevo registro en formulario (Ctrl+A)"),
                    click: () => {
                        this.show('/top/ofertasForm?ofertaId=0');
                    }
                },
                {
                    view: "button", type: "icon", icon: "mdi mdi-refresh", width: 37, align: "left", hotkey: "Ctrl+R",
                    tooltip: translate("Refrescar la lista (Ctrl+R)"),
                    click: ()=>{
                        this.cleanAndload();
                    }
                },
                {
                    view: "button", type: "icon", icon: "wxi-download", width: 37, align: "right",
                    tooltip: translate("Descargar como Excel"),
                    click: () => {
                        webix.toExcel($$("ofertasGrid"), {
                            filename: "ofertas",
                            name: "oferta",
                            rawValues: true,
                            ignore: { "actions": true }
                        });
                    }
                },
                {
                    view: "label", id: "ofertasNReg", label: "NREG: "
                },
                {
                    view: "pager", id: "mypager1", css: { "text-align": "right" },
                    template: "{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}",
                    size: 25,
                    group: 5
                }
            ]
        };
        var actionsTemplate = editButton + " ";
        // Control de permiso de borrado
        actionsTemplate += deleteButton + " ";
        actionsTemplate += PrintButton;
        //grid de la solapa ofertas
        var datatableOfertas = {
            view: "datatable",
            css: {"font-size": "0.9em"},
            id: "ofertasGrid",
            scroll: "x,y",
            pager: "mypager1",
            select: "row",
            scheme:{
                $change:function(item){
                        var odd = $$("ofertasGrid").getIndexById(item.id)%2
                        if (!odd) {
                            item.$css = {"background":"#E6E7E7"};
                        }
                }
            },
            columns: [
                { id: "id", header: [translate("Id"), { content: "textFilter" }], sort: "string", width: 50, hidden: true },
                { id: "referencia", header: [translate("Referencia"), { content: "textFilter" }], sort: "string", adjust: "data" },
                { id: "expedienteId", header: [translate("ExpeidienteId"), { content: "textFilter" }], sort: "string", adjust: "data" },
                {
                    id: "fechaOferta", header: [{ text: translate("Fecha"), css: { "text-align": "center" } }, { content: "dateFilter" }],
                    adjust: "data", sort: "string", format: webix.i18n.dateFormatStr,css: { "text-align": "center" }
                },
                { id: "empresaId", header: [translate("EmpresaId"), { content: "textFilter" }], sort: "string", fillspace: true, hidden: true},
                { id: "empresa", header: [translate("Empresa"), { content: "textFilter" }], sort: "string",  adjust: "header"},
                { id: "clienteId", header: [translate("ClienteId"), { content: "textFilter" }], sort: "string", hidden: true},
                { id: "cliente", header: [translate("Cliente"), { content: "textFilter" }], sort: "string",  minWidth: 380, fillspace: true},
                { id: "importeCliente", header: [translate("Total"), { content: "textFilter" }], sort: "string", width: 100, format:webix.i18n.numberFormat},
                { id: "agente", header: [translate("Agente"), { content: "textFilter" }], sort: "string", minWidth: 280},
                { id: "comercial", header: [translate("Comercial"), { content: "textFilter" }], sort: "string", minWidth: 280},
                { id: "jefegrupoNombre", header: [translate("Jefe de grupo"), { content: "textFilter" }], sort: "string", minWidth: 280},
                { id: "asesorTecnicoNombre", header: [translate("Asesor Técnico"), { content: "textFilter" }], sort: "string", minWidth: 280},
                { id: "actions", header: [{ text: translate("Acciones"), css: { "text-align": "center" } }], template: actionsTemplate, css: { "text-align": "center" } },
            ],
            rightSplit: 1,
            scroll:true,
            onClick: {
                "onEdit": function (event, id, node) {
                    var curRow = this.data.pull[id.row];
                    var item = $$("ofertasGrid").getItem(curRow.ofertaId);
                    var expedienteId = item.expedienteId;
                    this.$scope.edit(curRow.ofertaId, expedienteId)
                                           
                },
                "onDelete": function (event, id, node) {
                    var dtable = this;
                    var id = id.row;
                    var curRow = this.data.pull[id];

                    this.$scope.delete(curRow.ofertaId);
                },
                "onPrint": function (event, id, node) {
                    var curRow = this.data.pull[id.row];
                    var file = "/stireport/reports/oferta_general.mrt";
                    this.$scope.imprimirWindow.showWindow(curRow.ofertaId, null, file);
                }
            },
            editable: true,
            editaction: "dblclick",
            rules: {
                "direccionTrabajo": webix.rules.isNotEmpty
            },
            on: {
                "onAfterFilter": function(){
                    webix.storage.local.put("stateGridOfertas", this.getState());
                  }
            }
        }
        var _view = {
            rows: [
                toolbarOfertas,
                pagerOfertas,
                datatableOfertas
            ]
        }
        return _view;
    }
    
    init(view, url) {
        this.imprimirWindow = this.ui(OfertasEpisReport);
         $$('ofertasGrid').attachEvent("onItemDblClick", function(id, e, node){
            var curRow = this.data.pull[id.row]
            var item = $$("ofertasGrid").getItem(curRow.ofertaId);
            var expedienteId = item.expedienteId;

            this.$scope.edit(curRow.ofertaId, expedienteId);
        });
    }

    urlChange(view, url) {
        var usu = usuarioService.checkLoggedUser();
        var id = usu.usuarioId;
        languageService.setLanguage(this.app, 'es');
        if(url[1]) {
            if (url[1].params.ofertaId) {
                selectOfertaId = url[1].params.ofertaId;
                this.load(id);
                
            } else {
                this.load(id);
            }
        } else {
            this.load(id)
        }
    }
    
    load(id) {
        ofertasService.getOfertasExpediente(0, 0)
        .then((data)=> {
            if(!data) {
                data = []
            }
        
            //acortamos el nombre de la empresa a 3 digitos y formateamos la fecha
            data = this.formateaCampos(data);
            
            $$("ofertasGrid").clearAll();
            $$("ofertasGrid").parse(generalApi.prepareDataForDataTable("ofertaId", data));
            if(selectOfertaId) {
                var id = parseInt(selectOfertaId);
                $$("ofertasGrid").select(id);
                $$("ofertasGrid").showItem(id);
            }
            
            var numReg = $$("ofertasGrid").count();
            $$("ofertasNReg").config.label = "NREG: " + numReg;
            $$("ofertasNReg").refresh();
            var stateDt = webix.storage.local.get("stateGridOfertas");
            if(stateDt) this.$$('ofertasGrid').setState(stateDt);
        })
        .catch((err) => {
       
            var error = err.response;
                    var index = error.indexOf("Cannot delete or update a parent row: a foreign key constraint fails");
                    if(index != -1) {
                        messageApi.errorRestriccion()
                    } else {
                        messageApi.errorMessageAjax(err);
                    }
        });
    }

    formateaCampos(data) {
        data.forEach(e => {
            e.empresa = e.empresa.substr(0,4);
            e.fechaOferta = new Date(e.fechaOferta);
        });
        return data;
    }
   
   
    cleanAndload() {
        $$("ofertasGrid").eachColumn(function (id, col) {
            if (col.id == 'actions') return;
            var filter = this.getFilter(id);
            if (filter) {
                if (filter.setValue) filter.setValue("")	// suggest-based filters 
                else filter.value = "";					// html-based: select & text
            }
        });
       this.load();
    }

    edit(ofertaId, expedienteId) {

        this.show('/top/ofertasVentaForm?ofertaId=' + ofertaId +'&expedienteId=' + expedienteId + '&importeObra=' + 0 + '&desdePrincipal=true');
    }

    delete(ofertaId) {
        ofertasService.deleteOferta(ofertaId)
        .then( row => {
            this.load();
        })
        .catch( err => {
            messageApi.errorMessageAjax(err);
        })
    }
}

