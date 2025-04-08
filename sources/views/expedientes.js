import { JetView } from "webix-jet";
import { usuarioService } from "../services/usuario_service";
import { expedientesService } from "../services/expedientes_service";
import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { languageService} from "../locales/language_service";
import OfertasEpisReport  from "./ofertasEpisReport";



var editButton = "<span class='onEdit webix_icon wxi-pencil'></span>";
var deleteButton = "<span class='onDelete webix_icon wxi-trash'></span>";
var PrintButton = "<span class='onPrint mdi mdi-printer'></span>";

export default class Expedientes extends JetView {
    config() {
        //PartesFormWindow.getWindow(this.app);
        const translate = this.app.getService("locale")._;
        //toolbar de la solapa expedientes
        var toolbarExpedientes = {
            view: "toolbar", padding: 3, elements: [
                { view: "icon", icon: "mdi mdi-file", width: 37, align: "left" },
                { view: "label", label: "Expedientes" }
            ]
        }
        //pager de la solapa expedientes
        var pagerExpedientes = {
            cols: [
                {
                    view: "button", type: "icon", icon: "wxi-plus", width: 37, align: "left", hotkey: "Ctrl+A",
                    tooltip: translate("Nuevo registro en formulario (Ctrl+A)"),
                    click: () => {
                        this.show('/top/expedientesForm?expedienteId=0');
                    }
                },
                {
                    view: "button", type: "icon", icon: "mdi mdi-refresh", width: 37, align: "left", hotkey: "Ctrl+R",
                    tooltip: translate("Refrescar la lista (Ctrl+R)"),
                    click: ()=>{
                        this.cleanAndloadSolicitud();
                    }
                },
                {
                    view: "button", type: "icon", icon: "wxi-download", width: 37, align: "right",
                    tooltip: translate("Descargar como Excel"),
                    click: () => {
                        webix.toExcel($$("expedientesGridSolicitud"), {
                            filename: "expedientes",
                            name: "oferta",
                            rawValues: true,
                            ignore: { "actions": true }
                        });
                    }
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
        //grid de la solapa expedientes
        var datatableExpedientes = {
            view: "tabview",
            cells: [
                {
                    header:  "Solicitud",
                    width: 100,
                    body: {
                       
                        view: "datatable",
                        css: {"font-size": "0.9em"},
                        id: "expedientesGridSolicitud",
                        scroll: "x,y",
                        pager: "mypager1",
                        select: "row",
                        footer: true,
                        ready:function(){ 
                            this.attachEvent("onItemDblClick", function(id, e, node){
                                var curRow = this.data.pull[id.row]
                                this.$scope.edit(curRow.expedienteId)
                            });
                        },
                        scheme:{
                            $change:function(item){
                                    var odd = $$("expedientesGridSolicitud").getIndexById(item.id)%2
                                    if (!odd) {
                                        item.$css = {"background":"#E6E7E7"};
                                    }
                            }
                        },
                        columns: [  
                            { id: "expedienteId", header: ["Id", { content: "textFilter" }], sort: "int", adjust: "data", hidden: true},
                            { id: "empresaId", header: ["IdEmpresa", { content: "textFilter" }], sort: "int", adjust: "data", hidden: true},
                            { id: "referencia", header: ["Ref.", { content: "textFilter" }], sort: "string", adjust: "data"},
                            { id: "estado", header: ["Tipo.", { content: "textFilter" }], sort: "string", adjust: "data", hidden: true },       
                            { id: "cliente", header: ["Cliente", { content: "textFilter" }], sort: "string",adjust: "all"}, 
                            { id: "titulo", header: ["Titulo", { content: "textFilter" }], sort: "string",adjust: "all"}, 
                            {
                                id: "fecha", header: [{ text: translate("Fecha"), css: { "text-align": "center" } }, { content: "dateFilter" }],
                                adjust: "data", sort: "string", format: webix.i18n.dateFormatStr,css: { "text-align": "center" }
                            },
                            { id: "empresa", header: ["Empresa", { content: "textFilter" }], sort: "string",adjust: "all" },      
                            { id: "agente", header: ["Agente", { content: "textFilter" }], sort: "string",adjust: "all" }, 
                            { id: "comercial", header: ["Comercial", { content: "textFilter" }], sort: "string",adjust: "all" },
                            { id: "jefeGrupo", header: ["Jefe de grupo", { content: "textFilter" }], sort: "string",adjust: "all", minWidth: 150  },
                            { id: "jefeObras", header: ["Jefe de obras", { content: "textFilter" }], sort: "string",adjust: "all", minWidth: 150 },  
                            { id: "oficinatecnica", header: ["Oficina técnica", { content: "textFilter" }], sort: "string",adjust: "all", minWidth: 150 },
                            { id: "asesorTecnico", header: ["Asesor técnico", { content: "textFilter" }], sort: "string",adjust: "all", minWidth: 150 }, 

                            //{ id: "total", header: ["Base", { content: "textFilter" }], sort: "int" ,format:webix.i18n.numberFormat, adjust: "data"},
                            { id: "observaciones", header: ["Observaciones", { content: "textFilter" }], sort: "string", adjust: "all", fillspace: true, minWidth: 150 },
                            { id: "actions", header: [{ text: "Acciones", css: { "text-align": "center" } }], template: actionsTemplate , css: { "text-align": "center" }, adjust: "all"  }
                        ],
                       
                        rightSplit: 1,
                        leftSplit: 6,
                        scroll:true,
                        onClick: {
                            "onEdit": function (event, id, node) {
                                var curRow = this.data.pull[id.row];
                                this.$scope.edit(curRow.expedienteId)
                                                    
                            },
                            "onDelete": function (event, id, node) {
                                var dtable = this;
                                var id = id.row;
                                var curRow = this.data.pull[id];

                                this.$scope.delete(curRow.expedienteId);
                            },
                            "onPrint": function (event, id, node) {
                                var curRow = this.data.pull[id.row];
                                var file = "/stireport/reports/oferta_general.mrt";
                                this.$scope.imprimirWindow.showWindow(curRow.expedienteId, null, file);
                            }
                            },
                            editable: true,
                            editaction: "dblclick",
                            rules: {
                                "direccionTrabajo": webix.rules.isNotEmpty
                            },
                            on: {
                                "onAfterFilter": function(){
                                    webix.storage.local.put("stateGridExpedientes", this.getState());
                                },
                                "onAfterLoad" : function () {
                                    this.getColumnConfig("referencia").footer = { text: "NREG: " + this.count(), colspan: 3 };
                                    this.refreshColumns();
                                },
                            }
                    }
                },
                {
                    header:  "Estudio",
                    width: 100,
                    body: {
                        view: "datatable",
                        css: {"font-size": "0.9em"},
                        id: "expedientesGridEstudio",
                        scroll: "x,y",
                        pager: "mypager1",
                        select: "row",
                         footer: true,
                        ready:function(){ 
                            this.attachEvent("onItemDblClick", function(id, e, node){
                                var curRow = this.data.pull[id.row]
                                this.$scope.edit(curRow.expedienteId)
                            });
                        },
                        scheme:{
                            $change:function(item){
                                    var odd = $$("expedientesGridEstudio").getIndexById(item.id)%2
                                    if (!odd) {
                                        item.$css = {"background":"#E6E7E7"};
                                    }
                            }
                        },
                        columns: [  
                            { id: "expedienteId", header: ["Id", { content: "textFilter" }], sort: "int", adjust: "data", hidden: true},
                            { id: "empresaId", header: ["IdEmpresa", { content: "textFilter" }], sort: "int", adjust: "data", hidden: true},
                            { id: "referencia", header: ["Ref.", { content: "textFilter" }], sort: "string", adjust: "data"},
                            { id: "estado", header: ["Tipo.", { content: "textFilter" }], sort: "string", adjust: "data", hidden: true },       
                            { id: "cliente", header: ["Cliente", { content: "textFilter" }], sort: "string",adjust: "all"}, 
                            { id: "titulo", header: ["Titulo", { content: "textFilter" }], sort: "string",adjust: "all"}, 
                            {
                                id: "fecha", header: [{ text: translate("Fecha"), css: { "text-align": "center" } }, { content: "dateFilter" }],
                                adjust: "data", sort: "string", format: webix.i18n.dateFormatStr,css: { "text-align": "center" }
                            },
                            { id: "empresa", header: ["Empresa", { content: "textFilter" }], sort: "string",adjust: "all" },      
                            { id: "agente", header: ["Agente", { content: "textFilter" }], sort: "string",adjust: "all" }, 
                            { id: "comercial", header: ["Comercial", { content: "textFilter" }], sort: "string",adjust: "all" },
                            { id: "jefeGrupo", header: ["Jefe de grupo", { content: "textFilter" }], sort: "string", minWidth: 150 },
                            { id: "jefeObras", header: ["Jefe de obras", { content: "textFilter" }], sort: "string",adjust: "all", minWidth: 150 },  
                            { id: "oficinatecnica", header: ["Oficina técnica", { content: "textFilter" }], sort: "string",adjust: "all", minWidth: 150 },
                            { id: "asesorTecnico", header: ["Asesor técnico", { content: "textFilter" }], sort: "string",adjust: "all", minWidth: 150 }, 

                            //{ id: "total", header: ["Base", { content: "textFilter" }], sort: "int" ,format:webix.i18n.numberFormat, adjust: "data"},
                            { id: "observaciones", header: ["Observaciones", { content: "textFilter" }], sort: "string", adjust: "all", fillspace: true, minWidth: 150 },
                            { id: "actions", header: [{ text: "Acciones", css: { "text-align": "center" } }], template: actionsTemplate , css: { "text-align": "center" }, adjust: "all"  }
                        ],
                        rightSplit: 1,
                        leftSplit: 6,
                        scroll:true,
                        onClick: {
                            "onEdit": function (event, id, node) {
                                var curRow = this.data.pull[id.row];
                                this.$scope.edit(curRow.expedienteId)
                                                    
                            },
                            "onDelete": function (event, id, node) {
                                var dtable = this;
                                var id = id.row;
                                var curRow = this.data.pull[id];

                                this.$scope.delete(curRow.expedienteId);
                            },
                            "onPrint": function (event, id, node) {
                                var curRow = this.data.pull[id.row];
                                var file = "/stireport/reports/oferta_general.mrt";
                                this.$scope.imprimirWindow.showWindow(curRow.expedienteId, null, file);
                            }
                        },
                        editable: true,
                        editaction: "dblclick",
                        rules: {
                                "direccionTrabajo": webix.rules.isNotEmpty
                        },
                        on: {
                            "onAfterFilter": function(){
                                webix.storage.local.put("stateGridExpedientes", this.getState());
                            },
                            "onAfterLoad" : function () {
                                    this.getColumnConfig("referencia").footer = { text: "NREG: " + this.count(), colspan: 3 };
                                    this.refreshColumns();
                                },
                        }
                    
                    }
                },
                {
                    header:  "Enviado",
                    width: 100,
                    body: {
                        view: "datatable",
                        css: {"font-size": "0.9em"},
                        id: "expedientesGridEnviado",
                        scroll: "x,y",
                        pager: "mypager1",
                        select: "row",
                         footer: true,
                        ready:function(){ 
                            this.attachEvent("onItemDblClick", function(id, e, node){
                                var curRow = this.data.pull[id.row]
                                this.$scope.edit(curRow.expedienteId)
                            });
                        },
                        scheme:{
                            $change:function(item){
                                    var odd = $$("expedientesGridEnviado").getIndexById(item.id)%2
                                    if (!odd) {
                                        item.$css = {"background":"#E6E7E7"};
                                    }
                            }
                        },
                        columns: [  
                            { id: "expedienteId", header: ["Id", { content: "textFilter" }], sort: "int", adjust: "data", hidden: true},
                            { id: "empresaId", header: ["IdEmpresa", { content: "textFilter" }], sort: "int", adjust: "data", hidden: true},
                            { id: "referencia", header: ["Ref.", { content: "textFilter" }], sort: "string", adjust: "data"},
                            { id: "estado", header: ["Tipo.", { content: "textFilter" }], sort: "string", adjust: "data", hidden: true },       
                            { id: "cliente", header: ["Cliente", { content: "textFilter" }], sort: "string",adjust: "all"}, 
                            { id: "titulo", header: ["Titulo", { content: "textFilter" }], sort: "string",adjust: "all"}, 
                            {
                                id: "fecha", header: [{ text: translate("Fecha"), css: { "text-align": "center" } }, { content: "dateFilter" }],
                                adjust: "data", sort: "string", format: webix.i18n.dateFormatStr,css: { "text-align": "center" }
                            },
                            { id: "empresa", header: ["Empresa", { content: "textFilter" }], sort: "string",adjust: "all" },      
                            { id: "agente", header: ["Agente", { content: "textFilter" }], sort: "string",adjust: "all" }, 
                            { id: "comercial", header: ["Comercial", { content: "textFilter" }], sort: "string",adjust: "all" },
                            { id: "jefeGrupo", header: ["Jefe de grupo", { content: "textFilter" }], sort: "string", minWidth: 150 },
                            { id: "jefeObras", header: ["Jefe de obras", { content: "textFilter" }], sort: "string",adjust: "all", minWidth: 150 },  
                            { id: "oficinatecnica", header: ["Oficina técnica", { content: "textFilter" }], sort: "string",adjust: "all", minWidth: 150 },
                            { id: "asesorTecnico", header: ["Asesor técnico", { content: "textFilter" }], sort: "string",adjust: "all", minWidth: 150 }, 

                            //{ id: "total", header: ["Base", { content: "textFilter" }], sort: "int" ,format:webix.i18n.numberFormat, adjust: "data"},
                            { id: "observaciones", header: ["Observaciones", { content: "textFilter" }], sort: "string", adjust: "all", fillspace: true, minWidth: 150 },
                            { id: "actions", header: [{ text: "Acciones", css: { "text-align": "center" } }], template: actionsTemplate , css: { "text-align": "center" }, adjust: "all"  }
                        ],
                        rightSplit: 1,
                        leftSplit: 6,
                        scroll:true,
                        onClick: {
                            "onEdit": function (event, id, node) {
                                var curRow = this.data.pull[id.row];
                                this.$scope.edit(curRow.expedienteId)
                                                    
                            },
                            "onDelete": function (event, id, node) {
                                var dtable = this;
                                var id = id.row;
                                var curRow = this.data.pull[id];

                                this.$scope.delete(curRow.expedienteId);
                            },
                            "onPrint": function (event, id, node) {
                                var curRow = this.data.pull[id.row];
                                var file = "/stireport/reports/oferta_general.mrt";
                                this.$scope.imprimirWindow.showWindow(curRow.expedienteId, null, file);
                            }
                        },
                        editable: true,
                        editaction: "dblclick",
                        rules: {
                                "direccionTrabajo": webix.rules.isNotEmpty
                        },
                        on: {
                            "onAfterFilter": function(){
                                webix.storage.local.put("stateGridExpedientes", this.getState());
                            },
                            "onAfterLoad" : function () {
                                    this.getColumnConfig("referencia").footer = { text: "NREG: " + this.count(), colspan: 3 };
                                    this.refreshColumns();
                                },
                        }
                    
                    }
                },
                {
                    header:  "Adjudicado",
                    width: 100,
                    body: {
                        view: "datatable",
                        css: {"font-size": "0.9em"},
                        id: "expedientesGridAdjudicado",
                        scroll: "x,y",
                        pager: "mypager1",
                        select: "row",
                         footer: true,
                        ready:function(){ 
                            this.attachEvent("onItemDblClick", function(id, e, node){
                                var curRow = this.data.pull[id.row]
                                this.$scope.edit(curRow.expedienteId)
                            });
                        },
                        scheme:{
                            $change:function(item){
                                    var odd = $$("expedientesGridAdjudicado").getIndexById(item.id)%2
                                    if (!odd) {
                                        item.$css = {"background":"#E6E7E7"};
                                    }
                            }
                        },
                        columns: [  
                            { id: "expedienteId", header: ["Id", { content: "textFilter" }], sort: "int", adjust: "data", hidden: true},
                            { id: "empresaId", header: ["IdEmpresa", { content: "textFilter" }], sort: "int", adjust: "data", hidden: true},
                            { id: "referencia", header: ["Ref.", { content: "textFilter" }], sort: "string", adjust: "data"},
                            { id: "estado", header: ["Tipo.", { content: "textFilter" }], sort: "string", adjust: "data", hidden: true },       
                            { id: "cliente", header: ["Cliente", { content: "textFilter" }], sort: "string",adjust: "all"}, 
                            { id: "titulo", header: ["Titulo", { content: "textFilter" }], sort: "string",adjust: "all"}, 
                            {
                                id: "fecha", header: [{ text: translate("Fecha"), css: { "text-align": "center" } }, { content: "dateFilter" }],
                                adjust: "data", sort: "string", format: webix.i18n.dateFormatStr,css: { "text-align": "center" }
                            },
                            { id: "empresa", header: ["Empresa", { content: "textFilter" }], sort: "string",adjust: "all" },      
                            { id: "agente", header: ["Agente", { content: "textFilter" }], sort: "string",adjust: "all" }, 
                            { id: "comercial", header: ["Comercial", { content: "textFilter" }], sort: "string",adjust: "all" },
                            { id: "jefeGrupo", header: ["Jefe de grupo", { content: "textFilter" }], sort: "string", minWidth: 150 },
                            { id: "jefeObras", header: ["Jefe de obras", { content: "textFilter" }], sort: "string",adjust: "all", minWidth: 150 },  
                            { id: "oficinatecnica", header: ["Oficina técnica", { content: "textFilter" }], sort: "string",adjust: "all", minWidth: 150 },
                            { id: "asesorTecnico", header: ["Asesor técnico", { content: "textFilter" }], sort: "string",adjust: "all", minWidth: 150 }, 

                            //{ id: "total", header: ["Base", { content: "textFilter" }], sort: "int" ,format:webix.i18n.numberFormat, adjust: "data"},
                            { id: "observaciones", header: ["Observaciones", { content: "textFilter" }], sort: "string", adjust: "all", fillspace: true, minWidth: 150 },
                            { id: "actions", header: [{ text: "Acciones", css: { "text-align": "center" } }], template: actionsTemplate , css: { "text-align": "center" }, adjust: "all"  }
                        ],
                        rightSplit: 1,
                        leftSplit: 6,
                        scroll:true,
                        onClick: {
                            "onEdit": function (event, id, node) {
                                var curRow = this.data.pull[id.row];
                                this.$scope.edit(curRow.expedienteId)
                                                    
                            },
                            "onDelete": function (event, id, node) {
                                var dtable = this;
                                var id = id.row;
                                var curRow = this.data.pull[id];

                                this.$scope.delete(curRow.expedienteId);
                            },
                            "onPrint": function (event, id, node) {
                                var curRow = this.data.pull[id.row];
                                var file = "/stireport/reports/oferta_general.mrt";
                                this.$scope.imprimirWindow.showWindow(curRow.expedienteId, null, file);
                            }
                        },
                        editable: true,
                        editaction: "dblclick",
                        rules: {
                                "direccionTrabajo": webix.rules.isNotEmpty
                        },
                        on: {
                            "onAfterFilter": function(){
                                webix.storage.local.put("stateGridExpedientes", this.getState());
                            },
                            "onAfterLoad" : function () {
                                    this.getColumnConfig("referencia").footer = { text: "NREG: " + this.count(), colspan: 3 };
                                    this.refreshColumns();
                                },
                        }
                    
                    }
                },
                {
                    header:  "Iniciado",
                    width: 100,
                    body: {
                        view: "datatable",
                        css: {"font-size": "0.9em"},
                        id: "expedientesGridIniciado",
                        scroll: "x,y",
                        pager: "mypager1",
                        select: "row",
                         footer: true,
                        ready:function(){ 
                            this.attachEvent("onItemDblClick", function(id, e, node){
                                var curRow = this.data.pull[id.row]
                                this.$scope.edit(curRow.expedienteId)
                            });
                        },
                        scheme:{
                            $change:function(item){
                                    var odd = $$("expedientesGridIniciado").getIndexById(item.id)%2
                                    if (!odd) {
                                        item.$css = {"background":"#E6E7E7"};
                                    }
                            }
                        },
                        columns: [  
                            { id: "expedienteId", header: ["Id", { content: "textFilter" }], sort: "int", adjust: "data", hidden: true},
                            { id: "empresaId", header: ["IdEmpresa", { content: "textFilter" }], sort: "int", adjust: "data", hidden: true},
                            { id: "referencia", header: ["Ref.", { content: "textFilter" }], sort: "string", adjust: "data"},
                            { id: "estado", header: ["Tipo.", { content: "textFilter" }], sort: "string", adjust: "data", hidden: true },       
                            { id: "cliente", header: ["Cliente", { content: "textFilter" }], sort: "string",adjust: "all"}, 
                            { id: "titulo", header: ["Titulo", { content: "textFilter" }], sort: "string",adjust: "all"}, 
                            {
                                id: "fecha", header: [{ text: translate("Fecha"), css: { "text-align": "center" } }, { content: "dateFilter" }],
                                adjust: "data", sort: "string", format: webix.i18n.dateFormatStr,css: { "text-align": "center" }
                            },
                            { id: "empresa", header: ["Empresa", { content: "textFilter" }], sort: "string",adjust: "all" },      
                            { id: "agente", header: ["Agente", { content: "textFilter" }], sort: "string",adjust: "all" }, 
                            { id: "comercial", header: ["Comercial", { content: "textFilter" }], sort: "string",adjust: "all" },
                            { id: "jefeGrupo", header: ["Jefe de grupo", { content: "textFilter" }], sort: "string", minWidth: 150 },
                            { id: "jefeObras", header: ["Jefe de obras", { content: "textFilter" }], sort: "string",adjust: "all", minWidth: 150 },  
                            { id: "oficinatecnica", header: ["Oficina técnica", { content: "textFilter" }], sort: "string",adjust: "all", minWidth: 150 },
                            { id: "asesorTecnico", header: ["Asesor técnico", { content: "textFilter" }], sort: "string",adjust: "all", minWidth: 150 }, 

                            //{ id: "total", header: ["Base", { content: "textFilter" }], sort: "int" ,format:webix.i18n.numberFormat, adjust: "data"},
                            { id: "observaciones", header: ["Observaciones", { content: "textFilter" }], sort: "string", adjust: "all", fillspace: true, minWidth: 150 },
                            { id: "actions", header: [{ text: "Acciones", css: { "text-align": "center" } }], template: actionsTemplate , css: { "text-align": "center" }, adjust: "all"  }
                        ],
                        rightSplit: 1,
                        leftSplit: 6,
                        scroll:true,
                        onClick: {
                            "onEdit": function (event, id, node) {
                                var curRow = this.data.pull[id.row];
                                this.$scope.edit(curRow.expedienteId)
                                                    
                            },
                            "onDelete": function (event, id, node) {
                                var dtable = this;
                                var id = id.row;
                                var curRow = this.data.pull[id];

                                this.$scope.delete(curRow.expedienteId);
                            },
                            "onPrint": function (event, id, node) {
                                var curRow = this.data.pull[id.row];
                                var file = "/stireport/reports/oferta_general.mrt";
                                this.$scope.imprimirWindow.showWindow(curRow.expedienteId, null, file);
                            }
                        },
                        editable: true,
                        editaction: "dblclick",
                        rules: {
                                "direccionTrabajo": webix.rules.isNotEmpty
                        },
                        on: {
                            "onAfterFilter": function(){
                                webix.storage.local.put("stateGridExpedientes", this.getState());
                            },
                            "onAfterLoad" : function () {
                                    this.getColumnConfig("referencia").footer = { text: "NREG: " + this.count(), colspan: 3 };
                                    this.refreshColumns();
                                },
                        }
                    
                    }
                },
                {
                    header:  "Finalizado",
                    width: 100,
                    body: {
                        view: "datatable",
                        css: {"font-size": "0.9em"},
                        id: "expedientesGridFinalizado",
                        scroll: "x,y",
                        pager: "mypager1",
                        select: "row",
                         footer: true,
                        ready:function(){ 
                            this.attachEvent("onItemDblClick", function(id, e, node){
                                var curRow = this.data.pull[id.row]
                                this.$scope.edit(curRow.expedienteId)
                            });
                        },
                        scheme:{
                            $change:function(item){
                                    var odd = $$("expedientesGridFinalizado").getIndexById(item.id)%2
                                    if (!odd) {
                                        item.$css = {"background":"#E6E7E7"};
                                    }
                            }
                        },
                        columns: [  
                            { id: "expedienteId", header: ["Id", { content: "textFilter" }], sort: "int", adjust: "data", hidden: true},
                            { id: "empresaId", header: ["IdEmpresa", { content: "textFilter" }], sort: "int", adjust: "data", hidden: true},
                            { id: "referencia", header: ["Ref.", { content: "textFilter" }], sort: "string", adjust: "data"},
                            { id: "estado", header: ["Tipo.", { content: "textFilter" }], sort: "string", adjust: "data", hidden: true },       
                            { id: "cliente", header: ["Cliente", { content: "textFilter" }], sort: "string",adjust: "all"}, 
                            { id: "titulo", header: ["Titulo", { content: "textFilter" }], sort: "string",adjust: "all"}, 
                            {
                                id: "fecha", header: [{ text: translate("Fecha"), css: { "text-align": "center" } }, { content: "dateFilter" }],
                                adjust: "data", sort: "string", format: webix.i18n.dateFormatStr,css: { "text-align": "center" }
                            },
                            { id: "empresa", header: ["Empresa", { content: "textFilter" }], sort: "string",adjust: "all" },      
                            { id: "agente", header: ["Agente", { content: "textFilter" }], sort: "string",adjust: "all" }, 
                            { id: "comercial", header: ["Comercial", { content: "textFilter" }], sort: "string",adjust: "all" },
                            { id: "jefeGrupo", header: ["Jefe de grupo", { content: "textFilter" }], sort: "string", minWidth: 150 },
                            { id: "jefeObras", header: ["Jefe de obras", { content: "textFilter" }], sort: "string",adjust: "all", minWidth: 150 },  
                            { id: "oficinatecnica", header: ["Oficina técnica", { content: "textFilter" }], sort: "string",adjust: "all", minWidth: 150 },
                            { id: "asesorTecnico", header: ["Asesor técnico", { content: "textFilter" }], sort: "string",adjust: "all", minWidth: 150 }, 

                            //{ id: "total", header: ["Base", { content: "textFilter" }], sort: "int" ,format:webix.i18n.numberFormat, adjust: "data"},
                            { id: "observaciones", header: ["Observaciones", { content: "textFilter" }], sort: "string", adjust: "all", fillspace: true, minWidth: 150 },
                            { id: "actions", header: [{ text: "Acciones", css: { "text-align": "center" } }], template: actionsTemplate , css: { "text-align": "center" }, adjust: "all"  }
                        ],
                        rightSplit: 1,
                        leftSplit: 6,
                        scroll:true,
                        onClick: {
                            "onEdit": function (event, id, node) {
                                var curRow = this.data.pull[id.row];
                                this.$scope.edit(curRow.expedienteId)
                                                    
                            },
                            "onDelete": function (event, id, node) {
                                var dtable = this;
                                var id = id.row;
                                var curRow = this.data.pull[id];

                                this.$scope.delete(curRow.expedienteId);
                            },
                            "onPrint": function (event, id, node) {
                                var curRow = this.data.pull[id.row];
                                var file = "/stireport/reports/oferta_general.mrt";
                                this.$scope.imprimirWindow.showWindow(curRow.expedienteId, null, file);
                            }
                        },
                        editable: true,
                        editaction: "dblclick",
                        rules: {
                                "direccionTrabajo": webix.rules.isNotEmpty
                        },
                        on: {
                            "onAfterFilter": function(){
                                webix.storage.local.put("stateGridExpedientes", this.getState());
                            },
                            "onAfterLoad" : function () {
                                    this.getColumnConfig("referencia").footer = { text: "NREG: " + this.count(), colspan: 3 };
                                    this.refreshColumns();
                                },
                        }
                    
                    }
                },
                 {
                    header:  "Denegado",
                    width: 100,
                    body: {
                        view: "datatable",
                        css: {"font-size": "0.9em"},
                        id: "expedientesGridDenegado",
                        scroll: "x,y",
                        pager: "mypager1",
                        select: "row",
                         footer: true,
                        ready:function(){ 
                            this.attachEvent("onItemDblClick", function(id, e, node){
                                var curRow = this.data.pull[id.row]
                                this.$scope.edit(curRow.expedienteId)
                            });
                        },
                        scheme:{
                            $change:function(item){
                                    var odd = $$("expedientesGridDenegado").getIndexById(item.id)%2
                                    if (!odd) {
                                        item.$css = {"background":"#E6E7E7"};
                                    }
                            }
                        },
                        columns: [  
                            { id: "expedienteId", header: ["Id", { content: "textFilter" }], sort: "int", adjust: "data", hidden: true},
                            { id: "empresaId", header: ["IdEmpresa", { content: "textFilter" }], sort: "int", adjust: "data", hidden: true},
                            { id: "referencia", header: ["Ref.", { content: "textFilter" }], sort: "string", adjust: "data"},
                            { id: "estado", header: ["Tipo.", { content: "textFilter" }], sort: "string", adjust: "data", hidden: true },       
                            { id: "cliente", header: ["Cliente", { content: "textFilter" }], sort: "string",adjust: "all"}, 
                            { id: "titulo", header: ["Titulo", { content: "textFilter" }], sort: "string",adjust: "all"}, 
                            {
                                id: "fecha", header: [{ text: translate("Fecha"), css: { "text-align": "center" } }, { content: "dateFilter" }],
                                adjust: "data", sort: "string", format: webix.i18n.dateFormatStr,css: { "text-align": "center" }
                            },
                            { id: "empresa", header: ["Empresa", { content: "textFilter" }], sort: "string",adjust: "all" },      
                            { id: "agente", header: ["Agente", { content: "textFilter" }], sort: "string",adjust: "all" }, 
                            { id: "comercial", header: ["Comercial", { content: "textFilter" }], sort: "string",adjust: "all" },
                            { id: "jefeGrupo", header: ["Jefe de grupo", { content: "textFilter" }], sort: "string", minWidth: 150 },
                            { id: "jefeObras", header: ["Jefe de obras", { content: "textFilter" }], sort: "string",adjust: "all", minWidth: 150 },  
                            { id: "oficinatecnica", header: ["Oficina técnica", { content: "textFilter" }], sort: "string",adjust: "all", minWidth: 150 },
                            { id: "asesorTecnico", header: ["Asesor técnico", { content: "textFilter" }], sort: "string",adjust: "all", minWidth: 150 }, 

                            //{ id: "total", header: ["Base", { content: "textFilter" }], sort: "int" ,format:webix.i18n.numberFormat, adjust: "data"},
                            { id: "observaciones", header: ["Observaciones", { content: "textFilter" }], sort: "string", adjust: "all", fillspace: true, minWidth: 150 },
                            { id: "actions", header: [{ text: "Acciones", css: { "text-align": "center" } }], template: actionsTemplate , css: { "text-align": "center" }, adjust: "all"  }
                        ],
                        rightSplit: 1,
                        leftSplit: 6,
                        scroll:true,
                        onClick: {
                            "onEdit": function (event, id, node) {
                                var curRow = this.data.pull[id.row];
                                this.$scope.edit(curRow.expedienteId)
                                                    
                            },
                            "onDelete": function (event, id, node) {
                                var dtable = this;
                                var id = id.row;
                                var curRow = this.data.pull[id];

                                this.$scope.delete(curRow.expedienteId);
                            },
                            "onPrint": function (event, id, node) {
                                var curRow = this.data.pull[id.row];
                                var file = "/stireport/reports/oferta_general.mrt";
                                this.$scope.imprimirWindow.showWindow(curRow.expedienteId, null, file);
                            }
                        },
                        editable: true,
                        editaction: "dblclick",
                        rules: {
                                "direccionTrabajo": webix.rules.isNotEmpty
                        },
                        on: {
                            "onAfterFilter": function(){
                                webix.storage.local.put("stateGridExpedientes", this.getState());
                            },
                            "onAfterLoad" : function () {
                                    this.getColumnConfig("referencia").footer = { text: "NREG: " + this.count(), colspan: 3 };
                                    this.refreshColumns();
                                },
                        }
                    
                    }
                }
                
                    ]
        }
        var _view = {
            rows: [
                toolbarExpedientes,
                pagerExpedientes,
                datatableExpedientes
            ]
        }
        return _view;
    }
    init(view, url) {
        this.imprimirWindow = this.ui(OfertasEpisReport);
         /* $$('expedientesGridSolicitud').attachEvent("onItemDblClick", function(id, e, node){
            var curRow = this.data.pull[id.row]

            this.$scope.edit(curRow.expedienteId);
        }); */
    }
    urlChange(view, url) {
        var usu = usuarioService.checkLoggedUser();
        var id = usu.usuarioId;
        languageService.setLanguage(this.app, 'es');
        this.loadSolicitud(id);
        this.loadEstudio(id);
        this.loadEnviado();
        this.loadAdjudicado();
        this.loadIniciado();
        this.loadFinalizado();
        this.loadDenegado();
    }
    

    formateaCampos(data) {
        data.forEach(e => {
            e.empresa = e.empresa.substr(0,3);
            e.fecha = new Date(e.fecha);
        });
        return data;
    }
   
   
    

    edit(expedienteId) {
        this.show('/top/expedientesForm?expedienteId=' + expedienteId);
    }

    delete(expedienteId) {
        expedientesService.deleteOferta(expedienteId)
        .then( row => {
            this.loadSolicitud();
            this.loadEstudio();
            this.loadEnviado();
            this.loadAdjudicado();
            this.loadIniciado();
            this.loadFinalizado();
            this.loadDenegado();
        })
        .catch( err => {
            messageApi.errorMessageAjax(err);
        })
    }
    /////

    loadSolicitud(id) {
        expedientesService.getExpedientes(1)
        .then((data)=> {
            if(!data) {
                data = []
            }
        
            //acortamos el nombre de la empresa a 3 digitos y formateamos la fecha
            data = this.formateaCampos(data);
            
            $$("expedientesGridSolicitud").clearAll();
            $$("expedientesGridSolicitud").parse(generalApi.prepareDataForDataTable("expedienteId", data));
            
            
            var stateDt = webix.storage.local.get("stateGridExpedientes");
            if(stateDt) this.$$('expedientesGridSolicitud').setState(stateDt);
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

    loadEstudio(id) {
        expedientesService.getExpedientes(2)
        .then((data)=> {
            if(!data) {
                data = []
            }
        
            //acortamos el nombre de la empresa a 3 digitos y formateamos la fecha
            data = this.formateaCampos(data);
            
            $$("expedientesGridEstudio").clearAll();
            $$("expedientesGridEstudio").parse(generalApi.prepareDataForDataTable("expedienteId", data));
            
            
            var stateDt = webix.storage.local.get("stateGridExpedientes");
            if(stateDt) this.$$('expedientesGridEstudio').setState(stateDt);
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

    
    loadEstudio(id) {
        expedientesService.getExpedientes(2)
        .then((data)=> {
            if(!data) {
                data = []
            }
        
            //acortamos el nombre de la empresa a 3 digitos y formateamos la fecha
            data = this.formateaCampos(data);
            
            $$("expedientesGridEstudio").clearAll();
            $$("expedientesGridEstudio").parse(generalApi.prepareDataForDataTable("expedienteId", data));
            
            
            var stateDt = webix.storage.local.get("stateGridExpedientes");
            if(stateDt) this.$$('expedientesGridEstudio').setState(stateDt);
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

    loadEnviado(id) {
        expedientesService.getExpedientes(3)
        .then((data)=> {
            if(!data) {
                data = []
            }
        
            //acortamos el nombre de la empresa a 3 digitos y formateamos la fecha
            data = this.formateaCampos(data);
            
            $$("expedientesGridEnviado").clearAll();
            $$("expedientesGridEnviado").parse(generalApi.prepareDataForDataTable("expedienteId", data));
            
            
            var stateDt = webix.storage.local.get("stateGridExpedientes");
            if(stateDt) this.$$('expedientesGridEnviado').setState(stateDt);
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

    loadAdjudicado(id) {
        expedientesService.getExpedientes(4)
        .then((data)=> {
            if(!data) {
                data = []
            }
        
            //acortamos el nombre de la empresa a 3 digitos y formateamos la fecha
            data = this.formateaCampos(data);
            
            $$("expedientesGridAdjudicado").clearAll();
            $$("expedientesGridAdjudicado").parse(generalApi.prepareDataForDataTable("expedienteId", data));
            
            
            var stateDt = webix.storage.local.get("stateGridExpedientes");
            if(stateDt) this.$$('expedientesGridAdjudicado').setState(stateDt);
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

    loadIniciado(id) {
        expedientesService.getExpedientes(5)
        .then((data)=> {
            if(!data) {
                data = []
            }
        
            //acortamos el nombre de la empresa a 3 digitos y formateamos la fecha
            data = this.formateaCampos(data);
            
            $$("expedientesGridIniciado").clearAll();
            $$("expedientesGridIniciado").parse(generalApi.prepareDataForDataTable("expedienteId", data));
            
            
            var stateDt = webix.storage.local.get("stateGridExpedientes");
            if(stateDt) this.$$('expedientesGridIniciado').setState(stateDt);
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

    loadFinalizado(id) {
        expedientesService.getExpedientes(6)
        .then((data)=> {
            if(!data) {
                data = []
            }
        
            //acortamos el nombre de la empresa a 3 digitos y formateamos la fecha
            data = this.formateaCampos(data);
            
            $$("expedientesGridFinalizado").clearAll();
            $$("expedientesGridFinalizado").parse(generalApi.prepareDataForDataTable("expedienteId", data));
            
            
            var stateDt = webix.storage.local.get("stateGridExpedientes");
            if(stateDt) this.$$('expedientesGridFinalizado').setState(stateDt);
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

        loadDenegado(id) {
        expedientesService.getExpedientes(7)
        .then((data)=> {
            if(!data) {
                data = []
            }
        
            //acortamos el nombre de la empresa a 3 digitos y formateamos la fecha
            data = this.formateaCampos(data);
            
            $$("expedientesGridDenegado").clearAll();
            $$("expedientesGridDenegado").parse(generalApi.prepareDataForDataTable("expedienteId", data));
            
            
            var stateDt = webix.storage.local.get("stateGridExpedientes");
            if(stateDt) this.$$('expedientesGridDenegado').setState(stateDt);
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

    cleanAndloadSolicitud() {
        $$("expedientesGridSolicitud").eachColumn(function (id, col) {
            if (col.id == 'actions') return;
            var filter = this.getFilter(id);
            if (filter) {
                if (filter.setValue) filter.setValue("")	// suggest-based filters 
                else filter.value = "";					// html-based: select & text
            }
        });
       this.loadSolicitud();
    }
}

