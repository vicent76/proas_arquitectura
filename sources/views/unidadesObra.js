import { JetView } from "webix-jet";
import { unidadesObraService } from "../services/unidades_obra_service";
import { capituloService } from "../services/capitulo_service";
import { articulosService } from "../services/articulos_service";
import { usuarioService } from "../services/usuario_service";
import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { languageService} from "../locales/language_service";
import "../styles/app.css"; 




var editButton = "<span class='onEdit webix_icon wxi-pencil'></span>";
var deleteButton = "<span class='onDelete webix_icon wxi-trash'></span>";
var currentIdDatatableView;
var currentRowDatatableView
var isNewRow = false;
let usu = null;
var colGrupoArticulos = [];



export default class UnidadesObra extends JetView {
    config() {        
        usu = usuarioService.getUsuarioCookie();
        const translate = this.app.getService("locale")._;
        var toolbarCapitulos = {
            view: "toolbar", padding: 3, elements: [
                { view: "icon", icon: "mdi mdi-account-key", width: 37, align: "left" },
                { view: "label", label: translate("Unidades de Obra") }
            ]
        }
        var pagerCapitulos = {
            cols: [
                {
                    view: "button", type: "icon", icon: "wxi-plus", width: 37, align: "left", hotkey: "Ctrl+A",
                    tooltip: translate("Nuevo registro en formulario (Ctrl+A)"),
                    click: function () {
                        let newId = webix.uid(); // Genera un ID único temporal
                        $$("unidadesObraGrid").add({
                            id: newId,
                            articuloId: 0,
                            nombre: "",
                            grupoArticuloId: 0, // Temporal, se asignará al guardar
                            coste: 0.00,
                            descripcion: "",
                            esTecnico: 1,
                            departamentoId: 5
                        }, 0); // Agregar al inicio
                        $$("unidadesObraGrid").edit(newId); // Editar automáticamente
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
                        webix.toExcel($$("unidadesObraGrid"), {
                            filename: "unidadesObra",
                            name: "UnidadesObra",
                            rawValues: true,
                            ignore: { "actions": true }
                        });
                    }
                },
                {
                    view: "label", id: "CapitulosNReg", label: "NREG: "
                },
                {
                    view: "pager", id: "mypager", css: { "text-align": "right" },
                    template: "{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}",
                    size: 25,
                    group: 5
                }
            ]
        };
        var datatableCapitulos = {
            view: "datatable",
            id: "unidadesObraGrid",
            pager: "mypager",
            select: "row",
            fixedRowHeight: true,
              ready:function(){
                this.adjustRowHeight();
              },
            columns: [
                { id: "articuloId", adjust: true, header: [translate("ID"), { content: "numberFilter" }], sort: "number", minWidth: 100 },
                {
                    id: "grupoArticuloId",  
                    header: [translate("Capitulo"),  { content: "selectFilter" }],
                    sort: "string", 
                    fillspace: true,
                    minWidth: 350,
                    editor: "combo", 
                    collection: colGrupoArticulos,
                   
                },
                { id: "nombre", header: [translate("Unidad de obra"), { content: "textFilter" }], sort: "string", editor: "text", minWidth: 250 },
                 { 
                    id: "coste", 
                    header: [translate("Coste"), { content: "numberFilter" }],
                    width: 100, 
                    editor: "text", // Permite edición
                    format: webix.i18n.priceFormat,   // Formato numérico con moneda
                    css: { "text-align": "right" },
                },
                { 
                    id: "descripcion", 
                    header: ["Descripción", { content: "textFilter" }], 
                    sort: "string", 
                    width: 350, 
                    fillspace: true, 
                    editor: "popup", // 🔹 Usa un editor emergente
                    template: function(obj) {
                        return obj.descripcion.replace(/\n/g, "<br>"); // 🔹 Muestra saltos de línea correctamente
                    }
                },
                { id: "actions", header: [{ text: translate("Acciones"), css: { "text-align": "center" } }], template: deleteButton, css: { "text-align": "center" }, minWidth: 100 }
            ],            
            css: {"word-wrap": "break-word"},
            rightSplit:1,
            onClick: {
                "onDelete": function (event, id, node) {
                    var dtable = this;
                    var curRow = this.data.pull[id.row];
                    var name = curRow.nombre;
                    this.$scope.delete(id.row, name);
                },
                "onEdit": function (event, id, node) {
                    this.$scope.edit(id.row);
                }
            },
            editable: true,
            editaction: "dblclick",
            rules: {
                "nombre": webix.rules.isNotEmpty
            },
            on: {
                "onBeforeLoad": function() {
                    capituloService.getCapitulos()
                    .then(rows => {
                        colGrupoArticulos = generalApi.prepareDataForCombo('grupoArticuloId', 'nombre', rows);
                        $$("unidadesObraGrid").getColumnConfig("grupoArticuloId").collection = colGrupoArticulos;
                        $$("unidadesObraGrid").refreshColumns(); // Refrescar opciones
                    })
                },
                "onAfterEditStart": function (id) {
                    currentIdDatatableView = id.row;
                    currentRowDatatableView = this.data.pull[currentIdDatatableView];
                },
                "onAfterEditStop": function (state, editor, ignoreUpdate) {
                    var rowId = editor.row;
                    var rowData = this.getItem(rowId);

                    if ((state.value != state.old) || rowData.articuloId == 0) {
                        if (!this.validate(rowId)) {
                            return
                            //messageApi.errorMessage("Valores incorrectos");
                        } else {
                            delete rowData.id; // Asegurar que no se envíen campos incorrectos
                            delete rowData.tipoIVA;
                            delete rowData.porceIva;
                            delete rowData.profesion;
                            delete rowData.capitulo;
                            delete rowData.departamento;
                            delete rowData.$height;
                            if (rowData.articuloId == 0) {
                                articulosService.postArticulo(rowData)
                                    .then((result) => {
                                        rowData.articuloId = result.articuloId; // Actualizar con el ID real
                                        $$("unidadesObraGrid").updateItem(rowId, rowData);
                                        $$("unidadesObraGrid").editStop();
                                    })
                                    .catch((err) => handleServerError(err));
                            } else {
                                articulosService.putArticulo(rowData)
                                    .catch((err) => handleServerError(err));
                            }
                        }
                    }
                },
                "onAfterFilter": function () {
                    var numReg = $$("unidadesObraGrid").count();
                    $$("CapitulosNReg").config.label = "NREG: " + numReg;
                    $$("CapitulosNReg").refresh();
                },
                "onEditorKeyPress": function(code, e) {
                    let editor = this.getEditor();
                    if (editor) {
                        if (code === 13 && !e.shiftKey) { // Enter normal guarda y cierra
                            let input = editor.getInputNode();
                            input.value += "\n";
                            return false; // Evita que Webix cierre el editor
                        } else if (code === 13 && e.shiftKey) { // Shift+Enter agrega salto de línea
                            let input = editor.getInputNode();
                            input.value += "\n";
                            return false; // Evita que Webix cierre el editor
                        }
                    }
                }
            }
        }
        var _view = {
            rows: [
                toolbarCapitulos,
                pagerCapitulos,
                datatableCapitulos
            ]
        }
        return _view;
    }
    urlChange(view, url) {
        usuarioService.checkLoggedUser();
        languageService.setLanguage(this.app, 'es');
        var id = null;
        if (url[0].params.articuloId) {
            id = url[0].params.articuloId;
        }
        webix.UIManager.addHotKey("Esc", function () {
            $$('unidadesObraGrid').remove(-1);
            return false;
        }, $$('unidadesObraGrid'));
        webix.extend($$("unidadesObraGrid"), webix.ProgressBar);
        this.load(id);
    }
    load(id) {
        unidadesObraService.getUnidadesObra(usu.usuarioId, 5)
            .then((data) => {
                $$("unidadesObraGrid").clearAll();
                $$("unidadesObraGrid").parse(generalApi.prepareDataForDataTable("articuloId", data));
                if (id) {
                    $$("unidadesObraGrid").select(id);
                    $$("unidadesObraGrid").showItem(id);
                   
                }
                var numReg = $$("unidadesObraGrid").count();
                $$("CapitulosNReg").config.label = "NREG: " + numReg;
                $$("CapitulosNReg").refresh();
                $$("unidadesObraGrid").hideProgress();
            })
            .catch((err) => {
                $$("unidadesObraGrid").hideProgress();
                var error = err.response;
                            var index = error.indexOf("Cannot delete or update a parent row: a foreign key constraint fails");
                            if(index != -1) {
                                messageApi.errorRestriccion()
                            } else {
                                messageApi.errorMessageAjax(err);
                            }
            });
    }
    edit(id) {
        this.show('/top/capitulosForm?articuloId=' + id);
    }
    delete(id, name) {
        const translate = this.app.getService("locale")._;
        var self = this;
        
        webix.confirm({
            title: translate("AVISO"),
            text: translate("¿Desea realmente borrar este registro?").replace('*', name),
            type: "confirm-warning",
            callback: (action) => {
                if (action === true) {
                    articulosService.deleteArticulo(id)
                        .then(result => {
                            self.load();
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
    }
    cleanAndload() {
        $$("unidadesObraGrid").eachColumn(function (id, col) {
            if (col.id == 'actions') return;
            var filter = this.getFilter(id);
            if (filter) {
                if (filter.setValue) filter.setValue("")	// suggest-based filters 
                else filter.value = "";					// html-based: select & text
            }
        });
        this.load();
    }    
}



webix.editors.$popup = {
    text:{
        view:"popup", 
        body:{view:"textarea", width:550, height:550}
    }
};