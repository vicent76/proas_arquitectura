import { JetView } from "webix-jet";
import { usuarioService } from "../services/usuario_service";
import { propuestasService } from "../services/propuestas_service";
import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { languageService} from "../locales/language_service";




var editButton = "<span class='onEdit webix_icon wxi-pencil'></span>";
var deleteButton = "<span class='onDelete webix_icon wxi-trash'></span>";
var PrintButton = "<span class='onPrint mdi mdi-printer'></span>";
var selectPropuestaId = null;
var subcontrataId = null;
var expedienteId = null;

export default class Propuestas extends JetView {
    config() {
        //PartesFormWindow.getWindow(this.app);
        const translate = this.app.getService("locale")._;
        //toolbar de la solapa propuestas
        var toolbarPropuestas = {
            view: "toolbar", padding: 3, elements: [
                { view: "icon", icon: "mdi mdi-file", width: 37, align: "left" },
                { view: "label", label: "Propuestas" }
            ]
        }
        //pager de la solapa propuestas
        var pagerPropuestas = {
            cols: [
                {
                    view: "button", type: "icon", icon: "wxi-plus", width: 37, align: "left", hotkey: "Ctrl+A",
                    tooltip: translate("Nuevo registro en formulario (Ctrl+A)"),
                    click: () => {
                        this.show('/top/propuestaForm?propuestaId=0&subcontrataId=' + subcontrataId + '&expedienteId=' + expedienteId);
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
                        webix.toExcel($$("propuestasGrid"), {
                            filename: "propuestas",
                            name: "propuesta",
                            rawValues: true,
                            ignore: { "actions": true }
                        });
                    }
                },
                {
                    view: "label", id: "propuestasNReg", label: "NREG: "
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
        //grid de la solapa propuestas
        var datatablePropuestas = {
            view: "datatable",
            css: {"font-size": "0.9em"},
            id: "propuestasGrid",
            scroll: "x,y",
            pager: "mypager1",
            select: "row",
            autoheight:true,
            scheme:{
                $change:function(item){
                        var odd = $$("propuestasGrid").getIndexById(item.id)%2
                        if (!odd) {
                            item.$css = {"background":"#E6E7E7"};
                        }
                }
            },
            columns: [
                { id: "id", header: [translate("Id"), { content: "textFilter" }], sort: "string", width: 50, hidden: true },
                { id: "proveedorId", header: [translate("Referencia"), { content: "textFilter" }],  width: 50, hidden: true },
                { id: "tipoProfresionalId", header: [translate("tipoProfresionalId"), { content: "textFilter" }], sort: "string", adjust: "data", hidden: true },
                { id: "titulo", header: [translate("Titulo"), { content: "textFilter" }], sort: "string", minWidth: 380,  fillspace: true },
                {
                    id: "fechaDocumentacion", header: [{ text: translate("Fecha documentacion"), css: { "text-align": "center" } }, { content: "dateFilter" }],
                    adjust: "all", sort: "string", format: webix.i18n.dateFormatStr,css: { "text-align": "center" }
                },
              
                { id: "precioObjetivo", header: [
                    { text: translate("Precio objetivo"), css: "text-align-right" },
                    { content: "textFilter" }
                  ],
                sort: "string", width: 100,
                format: webix.i18n.numberFormat,
                css: "text-align-right", headerCss: "text-align-right" },
              
              { id: "diferencia", header: [
                    { text: translate("Diferencia"), css: "text-align-right" },
                    { content: "textFilter" }
                  ],
                sort: "string", width: 100,
                format: webix.i18n.numberFormat,
                css: "text-align-right", headerCss: "text-align-right" },
              
              { id: "pvpNeto", header: [
                    { text: translate("PVP Neto"), css: "text-align-right" },
                    { content: "textFilter" }
                  ],
                sort: "string", width: 100,
                format: webix.i18n.numberFormat,
                css: "text-align-right", headerCss: "text-align-right" },
              
              { id: "biNeto", header: [
                    { text: translate("BI Neto"), css: "text-align-right" },
                    { content: "textFilter" }
                  ],
                sort: "string", width: 100,
                format: webix.i18n.numberFormat,
                css: "text-align-right", headerCss: "text-align-right" },
              
              { id: "plazoEjecucion", header: [
                    { text: translate("Plazo ejecución"), css: "text-align-right" },
                    { content: "textFilter" }
                  ],
                sort: "string", width: 100,
                format: webix.i18n.numberFormat,
                css: "text-align-right", headerCss: "text-align-right" },
              
              { id: "penalizacion", header: [
                    { text: translate("Penalización"), css: "text-align-right" },
                    { content: "textFilter" }
                  ],
                sort: "string", width: 100,
                format: webix.i18n.numberFormat,
                css: "text-align-right", headerCss: "text-align-right" },
              
              { id: "totalPropuesta", header: [
                    { text: translate("Total propuesta"), css: "text-align-right" },
                    { content: "textFilter" }
                  ],
                sort: "string", width: 100,
                format: webix.i18n.numberFormat,
                css: "text-align-right", headerCss: "text-align-right" },

                { id: "actions", header: [{ text: translate("Acciones"), css: { "text-align": "center" } }], template: actionsTemplate, css: { "text-align": "center" } },
            ],
            rightSplit: 1,
            scroll:true,
            onClick: {
                "onEdit": function (event, id, node) {
                    var curRow = this.data.pull[id.row];
                    var item = $$("propuestasGrid").getItem(curRow.propuestaId);                       
                },
                "onDelete": function (event, id, node) {
                    var dtable = this;
                    var id = id.row;
                    var curRow = this.data.pull[id];

                    this.$scope.delete(curRow.propuestaId);
                },
                "onPrint": function (event, id, node) {
                    var curRow = this.data.pull[id.row];
                    var file = "/stireport/reports/propuesta_general.mrt";
                    this.$scope.imprimirWindow.showWindow(curRow.propuestaId, null, file);
                }
            },
            editable: true,
            editaction: "dblclick",
            rules: {
                "direccionTrabajo": webix.rules.isNotEmpty
            },
            on: {
                "onAfterFilter": function(){
                    webix.storage.local.put("stateGridPropuestas", this.getState());
                  }
            }
        }

        var datatableButton = 
        {
            rows: [
                {
                    cols: [
                                           
                        {
                            
                        },
                        {   width: 200,
                            padding: 10,
                            rows: [
                               
                                {
            
                                    align: "center",
                                    cols: [
                                        {},
                                        { view: "button", label: "Aceptar", click: () => this.accept(), css: "webix_primary", type: "form" }
                                    ]
                                },
                               
                            ]
                        },
                        
                        
                        ]
                },
                {
                    minHeight: 100
                }
            ]
          
        }
        var _view = {
            rows: [
                toolbarPropuestas,
                pagerPropuestas,
                datatablePropuestas,
                datatableButton
            ]
        }
        return _view;
    }
    
    init(view, url) {
         $$('propuestasGrid').attachEvent("onItemDblClick", function(id, e, node){
            var curRow = this.data.pull[id.row]
            var item = $$("propuestasGrid").getItem(curRow.propuestaId);
        
            this.$scope.edit(curRow.propuestaId);
        });
    }

    urlChange(view, url) {
        var usu = usuarioService.checkLoggedUser();
        var id = usu.usuarioId;
        languageService.setLanguage(this.app, 'es');
        if (url[0].params.subcontrataId) {
            subcontrataId = url[0].params.subcontrataId;
        }
        if (url[0].params.expedienteId) {
            expedienteId = url[0].params.expedienteId;
        }
        if (url[0].params.propuestaId && url[0].params.propuestaId != "0" ) {
            selectPropuestaId =  url[0].params.propuestaId;
        }
        this.load()
    }
    
    load() {
        propuestasService.getPropuestasSubcontrata(subcontrataId)
        .then((data)=> {
            if(!data) {
                data = []
            }
        
            //acortamos el nombre de la empresa a 3 digitos y formateamos la fecha
            data = this.formateaCampos(data);
            
            $$("propuestasGrid").clearAll();
            $$("propuestasGrid").parse(generalApi.prepareDataForDataTable("propuestaId", data));
           
            if(selectPropuestaId) {
                try{
                    var id = parseInt(selectPropuestaId);
                    $$("propuestasGrid").select(id);
                    $$("propuestasGrid").showItem(id);
                } catch(e) {
                    
                }
               
            }
            
            
            var numReg = $$("propuestasGrid").count();
            $$("propuestasNReg").config.label = "NREG: " + numReg;
            $$("propuestasNReg").refresh();
            var stateDt = webix.storage.local.get("stateGridPropuestas");
            if(stateDt) this.$$('propuestasGrid').setState(stateDt);
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
            //e.empresa = e.empresa.substr(0,4);
            e.fechaDocumentacion = new Date(e.fechaDocumentacion);
        });
        return data;
    }
   
   
    cleanAndload() {
        $$("propuestasGrid").eachColumn(function (id, col) {
            if (col.id == 'actions') return;
            var filter = this.getFilter(id);
            if (filter) {
                if (filter.setValue) filter.setValue("")	// suggest-based filters 
                else filter.value = "";					// html-based: select & text
            }
        });
       this.load();
    }

    edit(propuestaId) {
        this.show('/top/propuestaForm?propuestaId=' + propuestaId +'&subcontrataId=' + subcontrataId + '&expedienteId=' + expedienteId);
    }

    delete(propuestaId) {
         webix.confirm({
            title: "AVISO",
            text: "¿Está seguro que desea eliminar este registro?.",
            type: "confirm-warning",
            callback: (action) => {
                if (action === true) {
                    propuestasService.deletePropuesta(propuestaId)
                    .then( row => {
                        this.load();
                    })
                    .catch( err => {
                        messageApi.errorMessageAjax(err);
                    })
                }
            }
        });
    }

    accept() {
        this.show('/top/expedientesForm?expedienteId=' + expedienteId + '&desdeSubcontrata=true');
    }
}

