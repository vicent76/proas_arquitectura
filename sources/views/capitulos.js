import { JetView } from "webix-jet";
import { capituloService } from "../services/capitulo_service";
import { tiposProyectoService } from "../services/tipos_proyecto_service"
import { usuarioService } from "../services/usuario_service";
import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { languageService} from "../locales/language_service";



var editButton = "<span class='onEdit webix_icon wxi-pencil'></span>";
var deleteButton = "<span class='onDelete webix_icon wxi-trash'></span>";
var currentIdDatatableView;
var currentRowDatatableView
var isNewRow = false;
var usuarioId;
var colTiposProyecto = [];

export default class Capitulos extends JetView {
    config() {
        const translate = this.app.getService("locale")._;
        var toolbarCapitulos = {
            view: "toolbar", padding: 3, elements: [
                { view: "icon", icon: "mdi mdi-account-key", width: 37, align: "left" },
                { view: "label", label: translate("Capitulos") }
            ]
        }
        var pagerCapitulos = {
            cols: [
                {
                    view: "button", type: "icon", icon: "wxi-plus", width: 37, align: "left", hotkey: "Ctrl+A",
                    tooltip: translate("Nuevo registro en formulario (Ctrl+A)"),
                    click: function () {
                        let newId = webix.uid(); // Genera un ID único temporal
                        $$("capitulosGrid").add({
                            id: newId,
                            grupoArticuloId: 0, // Temporal, se asignará al guardar
                            nombre: "",
                            referencia: "",
                            departamentoId: 5,
                            estecnico: 1
                        }, 0); // Agregar al inicio
                        $$("capitulosGrid").edit(newId); // Editar automáticamente
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
                        webix.toExcel($$("capitulosGrid"), {
                            filename: "capitulos",
                            name: "Capitulos",
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
            id: "capitulosGrid",
            pager: "mypager",
            select: "row",
            columns: [
                { id: "grupoArticuloId", adjust: true, header: [translate("ID"), { content: "numberFilter" }], sort: "number" },
                { id: "nombre", fillspace: true, header: [translate("Nombre capitulo"), { content: "textFilter" }], sort: "string", editor: "text", minWidth: 200 },
                {
                    id: "tipoProyectoId",  
                    header: [translate("Tipo proyecto"),  { content: "selectFilter" }],
                    sort: "string", 
                    fillspace: true,
                    minWidth: 350,
                    editor: "combo", 
                    collection: colTiposProyecto,
                   
                },
                { 
                    id: "limiteImpObra", 
                    header: [translate("Limite obra"), { content: "numberFilter" }],
                    width: 100, 
                    editor: "text", // Permite edición
                    format: webix.i18n.priceFormat   // Formato numérico con moneda
                },
                { 
                    id: "porcen1", 
                    header: [translate("Porcentaje 1"), { content: "numberFilter" }],
                    width: 110, 
                    editor: "text", // Permite edición
                    format: webix.i18n.numberFormat  // Formato numérico con moneda
                },
                { 
                    id: "porcen2", 
                    header: [translate("Porcentaje 2"), { content: "numberFilter" }],
                    width: 110, 
                    editor: "text", // Permite edición
                    format: webix.i18n.numberFormat  // Formato numérico con moneda
                },
                { 
                    id: "porcen3", 
                    header: [translate("Porcentaje 3"), { content: "numberFilter" }],
                    width: 110, 
                    editor: "text", // Permite edición
                    format: webix.i18n.numberFormat  // Formato numérico con moneda
                },
                { 
                    id: "porcen4", 
                    header: [translate("Porcentaje 4"), { content: "numberFilter" }],
                    width: 110, 
                    editor: "text", // Permite edición
                    format: webix.i18n.numberFormat  // Formato numérico con moneda
                },
                { 
                    id: "aplicarFormula", 
                    header: translate("Aplicar Fórmula"), 
                    width: 150, 
                    editor: "checkbox",
                    template: "{common.checkbox()}",
                    css: { "text-align": "center" }
                },
                { id: "departamentoId", adjust: "header", header: [translate("Referencia"), { content: "textFilter" }], sort: "string", editor: "text", hidden: true},
                { id: "esTecnico", adjust: "header", header: [translate("Referencia"), { content: "textFilter" }], sort: "string", editor: "text" , hidden: true},
                { id: "actions", header: [{ text: translate("Acciones"), css: { "text-align": "center" } }], template: deleteButton, css: { "text-align": "center" } }
            ],
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
                "nombre": webix.rules.isNotEmpty,
            },
            on: {
                 "onBeforeLoad": function() {
                                    tiposProyectoService.getTiposProyecto(usuarioId)
                                    .then(rows => {
                                        colTiposProyecto = generalApi.prepareDataForCombo('tipoProyectoId', 'nombre', rows);
                                        $$("capitulosGrid").getColumnConfig("tipoProyectoId").collection = colTiposProyecto;
                                        $$("capitulosGrid").refreshColumns(); // Refrescar opciones
                                    })
                },
                "onAfterEditStart": function (id) {
                    currentIdDatatableView = id.row;
                    currentRowDatatableView = this.data.pull[currentIdDatatableView];
                },
                "onAfterEditStop": function (state, editor, ignoreUpdate) {
                    var rowId = editor.row;
                    var rowData = this.getItem(rowId);
                    let parsedValue = this.$scope.convertirAEstandar(rowData.limiteImpObra); // Convertir a formato inglés
                    let porcenValue1 = this.$scope.convertirAEstandar(rowData.porcen1); // Convertir a formato inglés
                    let porcenValue2 = this.$scope.convertirAEstandar(rowData.porcen2); // Convertir a formato inglés
                    let porcenValue3 = this.$scope.convertirAEstandar(rowData.porcen3); // Convertir a formato inglés
                    let porcenValue4 = this.$scope.convertirAEstandar(rowData.porcen4); // Convertir a formato inglés
                    //
                    rowData.limiteImpObra = parsedValue;
                    rowData.porcen1 = porcenValue1;
                    rowData.porcen2 = porcenValue2;
                    rowData.porcen3 = porcenValue3;
                    rowData.porcen4 = porcenValue4;
                    //
                    if ((state.value != state.old) || rowData.grupoArticuloId == 0) {
                        if (!this.validate(rowId)) {
                            messageApi.errorMessage("Valores incorrectos");
                        } else {
                            delete rowData.id; // Asegurar que no se envíe un ID incorrecto
                            if (rowData.grupoArticuloId == 0) {
                                capituloService.postCapitulo(rowData)
                                    .then((result) => {
                                        rowData.grupoArticuloId = result.grupoArticuloId; // Actualizar con el ID real
                                        $$("capitulosGrid").updateItem(rowId, rowData);
                                        $$("capitulosGrid").editStop();
                                    })
                                    .catch((err) => handleServerError(err));
                            } else {
                                capituloService.putCapitulo(rowData)
                                    .catch((err) => handleServerError(err));
                            }
                        }
                    }
                },
                "onCheck": function (rowId, columnId, state) {
                    if (columnId === "aplicarFormula") {
                        let rowData = this.getItem(rowId);
                        console.log("Checkbox cambiado:", state, "Fila actualizada:", rowData);
                        delete rowData.id; // Asegurar que no se envíe un ID incorrecto
                        if (rowData.grupoArticuloId == 0) {
                            capituloService.postCapitulo(rowData)
                                .then((result) => {
                                    rowData.grupoArticuloId = result.grupoArticuloId; // Actualizar con el ID real
                                    $$("capitulosGrid").updateItem(rowId, rowData);
                                    $$("capitulosGrid").editStop();
                                })
                                .catch((err) => handleServerError(err));
                        } else {
                            capituloService.putCapitulo(rowData)
                                .catch((err) => handleServerError(err));
                        }
                    }
                },
                "onAfterFilter": function () {
                    var numReg = $$("capitulosGrid").count();
                    $$("CapitulosNReg").config.label = "NREG: " + numReg;
                    $$("CapitulosNReg").refresh();
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

        let usuario = usuarioService.checkLoggedUser();
        usuarioId = usuario.usuarioId;
        languageService.setLanguage(this.app, 'es');
        var id = null;
        if (url[0].params.grupoArticuloId) {
            id = url[0].params.grupoArticuloId;
        }
        webix.UIManager.addHotKey("Esc", function () {
            $$('capitulosGrid').remove(-1);
            return false;
        }, $$('capitulosGrid'));
        webix.extend($$("capitulosGrid"), webix.ProgressBar);
        this.load(id);
    }
    load(id) {
        capituloService.getCapitulos()
            .then((data) => {
                $$("capitulosGrid").clearAll();
                $$("capitulosGrid").parse(generalApi.prepareDataForDataTable("grupoArticuloId", data));
                if (id) {
                    $$("capitulosGrid").select(id);
                    $$("capitulosGrid").showItem(id);
                }
                var numReg = $$("capitulosGrid").count();
                $$("CapitulosNReg").config.label = "NREG: " + numReg;
                $$("CapitulosNReg").refresh();
                $$("capitulosGrid").hideProgress();
            })
            .catch((err) => {
                $$("capitulosGrid").hideProgress();
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
        this.show('/top/capitulosForm?grupoArticuloId=' + id);
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
                    capituloService.deleteCapitulo(id)
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

    // Convertir de español (1.500,75) a inglés (1500.75) antes de guardar
    convertirAEstandar(value) {
        if (typeof value === "string") {
            // Reemplazar los separadores de miles y decimales al formato inglés
            return parseFloat(value.replace(",", "."));
        }
        return value;
    }

    cleanAndload() {
        $$("capitulosGrid").eachColumn(function (id, col) {
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