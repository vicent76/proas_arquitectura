import { JetView } from "webix-jet";
import { usuarioService } from "../services/usuario_service";
import { ofertasService } from "../services/ofertas_service";
import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { languageService} from "../locales/language_service";



var editButton = "<span class='onEdit mdi mdi-printer'></span>";

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
                { id: "ofertaId", header: ["Id", { content: "textFilter" }], sort: "int", adjust: "data", hidden: true},
                { id: "empresaId", header: ["IdEmpresa", { content: "textFilter" }], sort: "int", adjust: "data", hidden: true},
                { id: "referencia", header: ["Ref.", { content: "textFilter" }], sort: "string", adjust: "data" },
                { id: "tipo", header: ["Tipo.", { content: "textFilter" }], sort: "string", adjust: "data" },
                {
                 id: "fechaOferta", header: [{ text: translate("Fecha"), css: { "text-align": "center" } }, { content: "dateFilter" }],
                 adjust: "data", sort: "string", format: webix.i18n.dateFormatStr,css: { "text-align": "center" }
                },
                { id: "empresa", header: ["Empresa", { content: "textFilter" }], sort: "string",adjust: "data" },             
                { id: "cliente", header: ["Cliente", { content: "textFilter" }], sort: "string",adjust: "all"}, 
                { id: "mantenedor", header: ["Mantenedor", { content: "textFilter" }], sort: "string",adjust: "all" },     
                { id: "agente", header: ["Agente", { content: "textFilter" }], sort: "string",adjust: "data" }, 
                { id: "total", header: ["Base", { content: "textFilter" }], sort: "int" ,format:webix.i18n.numberFormat, adjust: "data"},
                { id: "observaciones", header: ["Observaciones", { content: "textFilter" }], sort: "string", adjust: "all" },
                { id: "actions", header: [{ text: "Acciones", css: { "text-align": "center" } }], template: editButton , css: { "text-align": "center" }, adjust: "header"  }
            ],
            rightSplit: 1,
            scroll:true,
            onClick: {
                "onEdit": function (event, id, node) {
                    var curRow = this.data.pull[id.row];
                    empresasService.getEmpresa(curRow.empresaId)
                    .then((data)=> {
                        if(!data.infFacCliRep) { 
                            messageApi.errorMessage('Esta empresa no tiene plantilla de oferta asociada');
                            return
                        } else {
                            var rep = data.infFacCliRep;
                            var file = "/stireport/reports/"+ rep +".mrt";
                            this.$scope.imprimirWindow.showWindow(curRow.ofertaId, file);
                            
                        }
                    })
                    .catch((err) => {
                        var error = err.response;
                            var index = error.indexOf("Cannot delete or update a parent row: a foreign key constraint fails");
                            if(index != -1) {
                                messageApi.errorRestriccion()
                            } else {
                                messageApi.errorMessageAjax(err);
                            }
                    })
                       
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
        //this.imprimirWindow = this.ui(FacturasEpisReport);
         $$('ofertasGrid').attachEvent("onItemDblClick", function(id, e, node){
            var curRow = this.data.pull[id.row]
                    /* ofertasService.getOferta(curRow.ofertaId)
                    .then((data)=> {
                        if(!data.infFacCliRep) { 
                            messageApi.errorMessage('Esta empresa no tiene plantilla de factura asociada');
                            return
                        } else {
                            var rep = data.infFacCliRep;
                            var file = "/stireport/reports/"+ rep +".mrt";
                            this.$scope.imprimirWindow.showWindow(curRow.facturaId, file);
                            
                        }
                    })
                    .catch((err) => {
                        messageApi.errorMessage(err.message);
                    }) */
            this.$scope.edit(curRow.ofertaId);
        });
    }
    urlChange(view, url) {
        var usu = usuarioService.checkLoggedUser();
        var id = usu.usuarioId;
        languageService.setLanguage(this.app, 'es');
        this.load(id);
    }
    
    load(id) {
        ofertasService.getOfertas(id)
        .then((data)=> {
            if(!data) {
                data = []
            }
        
            //acortamos el nombre de la empresa a 3 digitos y formateamos la fecha
            data = this.formateaCampos(data);
            
            $$("ofertasGrid").clearAll();
            $$("ofertasGrid").parse(generalApi.prepareDataForDataTable("ofertaId", data));
            
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
            e.empresa = e.empresa.substr(0,3);
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

    edit(ofertaId) {
        this.show('/top/ofertasForm?ofertaId=' + ofertaId);
    }
}

