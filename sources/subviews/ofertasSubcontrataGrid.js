
import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { ofertasService } from "../services/ofertas_service";


var editButton = "<span class='onEdit webix_icon wxi-pencil'></span>";
var deleteButton = "<span class='onDelete webix_icon wxi-trash'></span>";
var propuestaButton = " <span ><i class='onPropuesta fa-solid fa-coins'></i></span>";

var currentIdDatatableView;
var currentRowDatatableView
var isNewRow = false;
var ofertaId;
var selectOfertaId = null;
var numLineas = 0;
var expedienteId = null;
var _app = null;
var importeObra = 0;
var presupuestosConContrato = [];

export const ofertasSubcontrataGrid = {
    // Devuelve el grid con los locales afectados
    // se le pasa la app porque es necesaria para conservar el translate.
    getGrid: (app) => {
        _app = app
        //anticipoProveedorFormWindow.getWindow(app);

        // Fila con círculos de presupuestos
        var presupuestosCircles = {
            view: "template",
            id: "presupuestosCircles",
            height: 70,
            template: function () {
                if (presupuestosConContrato.length === 0) return "";
            
                return presupuestosConContrato.map(p => {
                    const isSubcontratada = p.ofertaSubcontrataId !== null;
                    const style = isSubcontratada 
                        ? 'background-color: green; pointer-events: none; opacity: 0.6;'
                        : '';
            
                    return `
                        <div class="circle-item" 
                             id="${p.ofertaCosteId || '0'}" 
                             title="${p.referencia || 'Sin ref'}"
                             style="${style}">
                            ${p.referencia + ' ' + (p.referenciaSubcontrata || '') || ''}
                        </div>
                    `;
                }).join("");
            },
            on: {
                onAfterRender: function () {
                    // Quita handlers anteriores si vuelves a renderizar
                    const node = this.getNode();
                    node.querySelectorAll(".circle-item").forEach(el => {
                        el.onclick = (e) => {
                            const ofertaCosteId = el.getAttribute("id");
                            if (ofertaCosteId) {
                                // Acción personalizada aquí:
                                console.log("Click en ofertaId:", ofertaCosteId);
                                ofertasSubcontrataGrid.aceptarGenerarOferta(_app, ofertaCosteId);
                                
                            }
                        };
                    });
                }
            }
            
        };

        const translate = app.getService("locale")._;
        var pagerOfertasSubcontrata = {
            cols: [
                {
                    view: "button", type: "icon", icon: "mdi mdi-refresh", width: 37, align: "left", hotkey: "Ctrl+R",
                    tooltip: translate("Refrescar la lista (Ctrl+R)"),
                    click: ()=>{
                        //this.cleanAndloadSolicitud();
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
                    view: "label", id: "ofertasSubcontrataNReg", label: "NREG: "
                },
                {
                    view: "pager", id: "mypagerSubcontrata", css: { "text-align": "right" },
                    template: "{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}",
                    size: 25,
                    group: 5
                }
            ]
        };

        var toolbarAfertasSubcontrata = {
            view: "toolbar", padding: 3, elements: [
                { view: "icon", icon: "mdi mdi-folder-network-outline", width: 37, align: "left" },
                { view: "label", label: translate("Presupuestos de subcontrata") }
            ]
        };
        
        var actionsTemplate = editButton;
        // Control de permiso de borrado
        actionsTemplate += deleteButton + propuestaButton ;
        var datatableOfertasSubcontrata = {
            view: "datatable",
            id: "ofertasSubcontrataGrid",
            scroll: "x,y",
            pager: "mypagerSubcontrata",
            select: "row",
            autoheight: false,
            type:{
                rcheckbox:function(obj, common, value, config){
                    var checked = (value == config.checkValue) ? 'checked="true"' : '';
                    return "<input disabled class='webix_table_checkbox' type='checkbox' "+checked+">";
                }
             },
             ready:function(){ 
                this.attachEvent("onItemDblClick", function(id, e, node){
                    var curRow = this.data.pull[id.row];
                    var ofertaId = curRow.ofertaId;
                    ofertasSubcontrataGrid.edit(ofertaId)
                });
            },
            columns: [
                { id: "id", header: [translate("Id"), { content: "textFilter" }], sort: "string", width: 50, hidden: true },
                { id: "referencia", header: [translate("Referencia"), { content: "textFilter" }], sort: "string", adjust: "data" },
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
                "onDelete": function (event, id, node) {
                    var id = id.row;
                    ofertasSubcontrataGrid.delete(id, app);
                },
                "onEdit": function (event, id, node) {
                    var curRow = this.data.pull[id.row];
                    var ofertaId = curRow.ofertaId;
                    ofertasSubcontrataGrid.edit(ofertaId)
                },
                "onPropuesta": function (event, id, node) {
                    var curRow = this.data.pull[id.row];
                    var ofertaId = curRow.ofertaId;
                    ofertasSubcontrataGrid.getPropuestas(ofertaId)
                },
            },
            editable: true,
            editaction: "dblclick",
            rules: {

            },
            on: {
                "onAfterEditStart": function (id) {
                    currentIdDatatableView = id.row;
                    currentRowDatatableView = this.data.pull[currentIdDatatableView];
                },
                "onAfterEditStop": function (state, editor, ignoreUpdate) {
                    var cIndex = this.getColumnIndex(editor.column);
                    var length = this.config.columns.length;
                    if (isNewRow && cIndex != length - 2) return false;
                    if ((state.value != state.old) || isNewRow) {
                        isNewRow = false;
                        if (!this.validate(currentIdDatatableView)) {
                            messageApi.errorMessage("Valores incorrectos");
                        }  else {
                            currentRowDatatableView = this.data.pull[currentIdDatatableView];
                            delete currentRowDatatableView.id;
                            var data = currentRowDatatableView;
                        }
                    }
                },
                "onAfterFilter": function () {
                    var numReg = $$("ofertasSubcontrataGrid").count();
                    $$("ofertasSubcontrataNReg").config.label = "NREG: " + numReg;
                    $$("ofertasSubcontrataNReg").refresh();
                }
            }
        }
        const _view = {
            rows: [
                presupuestosCircles,
                toolbarAfertasSubcontrata,
                pagerOfertasSubcontrata,
                datatableOfertasSubcontrata
            ]
        }
        
        return _view;
    },
    loadGrid: (expedienteid, ofertaId, importeobra, selectofertaid) => {
        selectOfertaId = selectofertaid
        if(expedienteid == 0) {
            messageApi.errorMessage("Expediente no creado.");
            return;
        }
        if(expedienteid == 0) {
            expedienteId = null;
            importeObra = 0
            return;
        }
        ofertaId = ofertaId;
        importeObra = importeobra;
        numLineas = 0;
        if(expedienteid) {
            expedienteId = expedienteid;
            ofertasService.getOfertasAceptadasExpediente(expedienteId, 1)
            .then(rows => {
                if(rows.length > 0) {
                    presupuestosConContrato = rows;
                    if ($$("presupuestosCircles")) {
                        $$("presupuestosCircles").refresh();
                    }
                    
                }else {
                    presupuestosConContrato = [];
                    if ($$("presupuestosCircles")) {
                        $$("presupuestosCircles").refresh();
                    }
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
            });

            
                        ofertasService.getOfertasExpediente(expedienteId, 2)
                        .then(rows => {
                            if(rows.length > 0) {
                                rows = ofertasSubcontrataGrid.formateaCampos(rows);
                                numLineas = rows.length;
                                $$("ofertasSubcontrataGrid").clearAll();
                                $$("ofertasSubcontrataGrid").parse(generalApi.prepareDataForDataTable("ofertaId", rows));
                                try {
                                    if(selectOfertaId) {
                                        var id = parseInt(selectOfertaId);
                                        $$("ofertasSubcontrataGrid").select(id);
                                        $$("ofertasSubcontrataGrid").showItem(id);
                                    }
                                } catch(e) {
                                    console.log(e);
                                }
                              
                                var numReg = $$("ofertasSubcontrataGrid").count();
                                $$("ofertasSubcontrataGrid").config.label = "NREG: " + numReg;
                                $$("ofertasSubcontrataGrid").refresh();
                            }else {
                                $$("ofertasSubcontrataGrid").clearAll();
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
                        });
        } else {
            $$("ofertasSubcontrataGrid").clearAll();
            return;
        }
        
        
    },
    delete: (id, app) => {    
        const translate = app.getService("locale")._;
        webix.confirm({
            title: translate("AVISO"),
            text: translate("¿ Está seguro que desea eliminar esta oferta ?"),
            type: "confirm-warning",
            callback: (action) => {
                if (action === true) {
                    ofertasService.deleteOferta(id)
                        .then(result => {
                            ofertasSubcontrataGrid.loadGrid(expedienteId, null, importeObra);
                        })
                        .catch(err => {
                            var error = err.response;
                            var index = error.indexOf("Cannot delete or update a parent row: a foreign key constraint fails");
                            if(index != -1) {
                                messageApi.errorRestriccion()
                            } else {
                                messageApi.errorMessageAjax(err);
                            }
                        });
                }
            }
        });
    },
    disparaEvento: () => {

    },

    edit(ofertaId) {
       
        const activeTab = $$("tabViewExpediente").getValue();  // Obtener el id de la pestaña activa
        localStorage.setItem("activeTab", activeTab);

        _app.show('/top/ofertasSubcontrataForm?ofertaId=' + ofertaId +'&expedienteId=' + expedienteId + '&importeObra=' + importeObra);
    },

    getPropuestas(ofertaId) {
        const activeTab = $$("tabViewExpediente").getValue();  // Obtener el id de la pestaña activa
        localStorage.setItem("activeTab", activeTab);

        _app.show('/top/propuestas?subcontrataId=' + ofertaId +'&expedienteId=' + expedienteId);
    },

    formateaCampos(data) {
        data.forEach(e => {
            e.empresa = e.empresa.substr(0,4);
            e.fechaOferta = new Date(e.fechaOferta);
        });
        return data;
    },

    aceptarGenerarOferta (app, ofertaCosteId)  {
        if(ofertaCosteId == 0 || ofertaCosteId == '' || !ofertaCosteId) return;
        const translate = app.getService("locale")._;
        webix.confirm({
            title: translate("AVISO"),
            text: translate("Se generará una oferta de Subcontrata a partir de esta oferta de coste.\n ¿Está seguro, que deesea continuar?"),
            type: "confirm-warning",
            callback: (action) => {
                if (action === true) {
                    ofertasSubcontrataGrid.postSubcontrata(ofertaCosteId);
                }
            }
        });
    },
    postSubcontrata(ofertaCosteId) {
        ofertasService.postOfertaSubcontrata(ofertaCosteId)
        .then( row => {
           if(row)
            messageApi.normalMessage('Se ha creado corectamente la oferta.');
            this.loadGrid(expedienteId, null, importeObra)
        })
        .catch( err => {
            var error = err.response;
            messageApi.errorMessageAjax(err);
        })
    },

    formateaCampos(data) {
        data.forEach(e => {
            e.empresa = e.empresa.substr(0,4);
            e.fechaOferta = new Date(e.fechaOferta);
        });
        return data;
    }
}