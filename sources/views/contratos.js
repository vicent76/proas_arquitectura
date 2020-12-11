import { JetView } from "webix-jet";
import { usuarioService } from "../services/usuario_service";
import { contratosService } from "../services/contratos_service";
import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { languageService} from "../locales/language_service";
//import ContratosEpisReport  from "./contratosEpisReport";



var editButton = "<span class='onEdit webix_icon wxi-pencil'></span>";
var deleteButton = "<span class='onDelete webix_icon wxi-trash'></span>";
var PrintButton = "<span class='onPrint mdi mdi-printer'></span>";

export default class Contratos extends JetView {
    config() {
        //PartesFormWindow.getWindow(this.app);
        const translate = this.app.getService("locale")._;
        //toolbar de la solapa contratos
        var toolbarContratos = {
            view: "toolbar", padding: 3, elements: [
                { view: "icon", icon: "mdi mdi-file", width: 37, align: "left" },
                { view: "label", label: "Contratos" }
            ]
        }
        //pager de la solapa contratos
        var pagerContratos = {
            cols: [
                {
                    view: "button", type: "icon", icon: "wxi-plus", width: 37, align: "left", hotkey: "Ctrl+A",
                    tooltip: translate("Nuevo registro en formulario (Ctrl+A)"),
                    click: () => {
                        this.show('/top/contratosForm?contratoId=0');
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
                        webix.toExcel($$("contratosGrid"), {
                            filename: "contratos",
                            name: "contrato",
                            rawValues: true,
                            ignore: { "actions": true }
                        });
                    }
                },
                {
                    view: "label", id: "contratosNReg", label: "NREG: "
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
        //grid de la solapa contratos
        var datatableContratos = {
            view: "datatable",
            css: {"font-size": "0.9em"},
            id: "contratosGrid",
            scroll: "x,y",
            pager: "mypager1",
            select: "row",
            scheme:{
                $change:function(item){
                        var odd = $$("contratosGrid").getIndexById(item.id)%2
                        if (!odd) {
                            item.$css = {"background":"#E6E7E7"};
                        }
                }
            },
            columns: [  
                { id: "contratoId", header: ["Id", { content: "textFilter" }], sort: "int", adjust: "data", hidden: true},
                { id: "empresaId", header: ["IdEmpresa", { content: "textFilter" }], sort: "int", adjust: "data", hidden: true},
                { id: "referencia", header: ["Ref.", { content: "textFilter" }], sort: "string", adjust: "data" },
                { id: "tipo", header: ["Tipo.", { content: "textFilter" }], sort: "string", adjust: "data" },
                {
                 id: "fechaContrato", header: [{ text: translate("Fecha"), css: { "text-align": "center" } }, { content: "dateFilter" }],
                 adjust: "data", sort: "string", format: webix.i18n.dateFormatStr,css: { "text-align": "center" }
                },
                { id: "empresa", header: ["Empresa", { content: "textFilter" }], sort: "string",adjust: "data" },             
                { id: "cliente", header: ["Cliente", { content: "textFilter" }], sort: "string",adjust: "all"}, 
                { id: "agente", header: ["Agente", { content: "textFilter" }], sort: "string",adjust: "data" }, 
                { id: "total", header: ["Base", { content: "textFilter" }], sort: "int" ,format:webix.i18n.numberFormat, adjust: "data"},
                { id: "observaciones", header: ["Observaciones", { content: "textFilter" }], sort: "string", adjust: "all" },
                { id: "actions", header: [{ text: "Acciones", css: { "text-align": "center" } }], template: actionsTemplate , css: { "text-align": "center" }, adjust: "all"  }
            ],
            rightSplit: 1,
            scroll:true,
            onClick: {
                "onEdit": function (event, id, node) {
                    var curRow = this.data.pull[id.row];
                    this.$scope.edit(curRow.contratoId)
                                           
                },
                "onDelete": function (event, id, node) {
                    var dtable = this;
                    var id = id.row;
                    var curRow = this.data.pull[id];

                    this.$scope.delete(curRow.contratoId);
                },
                "onPrint": function (event, id, node) {
                    var curRow = this.data.pull[id.row];
                    var file = "/stireport/reports/contrato_general.mrt";
                    this.$scope.imprimirWindow.showWindow(curRow.contratoId, null, file);
                }
            },
            editable: true,
            editaction: "dblclick",
            rules: {
                "direccionTrabajo": webix.rules.isNotEmpty
            },
            on: {
                "onAfterFilter": function(){
                    webix.storage.local.put("stateGridContratos", this.getState());
                  }
            }
        }
        var _view = {
            rows: [
                toolbarContratos,
                pagerContratos,
                datatableContratos
            ]
        }
        return _view;
    }
    init(view, url) {
        $$('contratosGrid').attachEvent("onItemDblClick", function(id, e, node){
            var curRow = this.data.pull[id.row]
            this.$scope.edit(curRow.contratoId);
        });
    }
    urlChange(view, url) {
        var usu = usuarioService.checkLoggedUser();
        var id = usu.usuarioId;
        languageService.setLanguage(this.app, 'es');
        this.load(id);
    }
    
    load(id) {
        contratosService.getContratos(id)
        .then((data)=> {
            if(!data) {
                data = []
            }
        
            //acortamos el nombre de la empresa a 3 digitos y formateamos la fecha
            data = this.formateaCampos(data);
            
            $$("contratosGrid").clearAll();
            $$("contratosGrid").parse(generalApi.prepareDataForDataTable("contratoId", data));
            
            var numReg = $$("contratosGrid").count();
            $$("contratosNReg").config.label = "NREG: " + numReg;
            $$("contratosNReg").refresh();
            var stateDt = webix.storage.local.get("stateGridContratos");
            if(stateDt) this.$$('contratosGrid').setState(stateDt);
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
            e.fechaContrato = new Date(e.fechaContrato);
        });
        return data;
    }
   
   
    cleanAndload() {
        $$("contratosGrid").eachColumn(function (id, col) {
            if (col.id == 'actions') return;
            var filter = this.getFilter(id);
            if (filter) {
                if (filter.setValue) filter.setValue("")	// suggest-based filters 
                else filter.value = "";					// html-based: select & text
            }
        });
       this.load();
    }

    edit(contratoId) {
        try{
            this.show('/top/contratosForm?contratoId=' + contratoId);
        }catch(e) {
            console.log(e);
        }
    }

    delete(contratoId) {
        contratosService.deleteContrato(contratoId)
        .then( row => {
            this.load();
        })
        .catch( err => {
            messageApi.errorMessageAjax(err);
        })
    }
}

