import { JetView } from "webix-jet";
import { unidadesObraService } from "../services/unidades_obra_service";
import { capituloService } from "../services/capitulo_service";
import { unidadesService } from "../services/unidades_service";
import { articulosService } from "../services/articulos_service";
import { tiposIvaService } from "../services/tipos_iva_service";
import { usuarioService } from "../services/usuario_service";
import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { languageService } from "../locales/language_service";
import "../styles/app.css";




var editButton = "<span class='onEdit webix_icon wxi-pencil'></span>";
var deleteButton = "<span class='onDelete webix_icon wxi-trash'></span>";
var currentIdDatatableView;
var currentRowDatatableView
var isNewRow = false;
let usu = null;
var colGrupoArticulos = [];
var colUnidades = [];
var colTiposIVA = [];



export default class UnidadesObra extends JetView {
    config() {
        const threeDecimalFormat = webix.Number.numToStr({
            groupDelimiter: ".",
            groupSize: 3,
            decimalDelimiter: ",",
            decimalSize: 3
        });

        const euroFormat = webix.Number.numToStr({
            groupDelimiter: ".",
            groupSize: 3,
            decimalDelimiter: ",",
            decimalSize: 4
        });

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
                            coste: 0.0000,
                            unidadId: 9,
                            aplicarFormula: 0,
                            tipoIvaId: 3,
                            porcen1: 0.00,
                            porcen2: 0.00,
                            porcen3: 0.00,
                            porcen4: 0.00,
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
                    click: () => {
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
            rightSplit: 1,
            scroll: true,
            select: "row",
            fixedRowHeight: true,
            ready: function () {
                this.adjustRowHeight();
            },

            columns: [
                { id: "articuloId", adjust: "all", header: [translate("ID"), { content: "numberFilter" }], sort: "string" },
                {
                    id: "grupoArticuloId",
                    header: [translate("Capitulo"), { content: "selectFilter" }],
                    sort: "string",
                    minWidth: 350,
                    editor: "combo",
                    collection: colGrupoArticulos,

                },
                { id: "nombre", header: [translate("Unidad de obra"), { content: "textFilter" }], sort: "string", editor: "text", minWidth: 250, fillspace: true },
                {
                    id: "coste",
                    header: [translate("Coste"), { content: "numberFilter" }],
                    width: 100,
                    editor: "text", // Permite edición
                    template: function (obj) {
                        let e = euroFormat(obj.coste);
                        return e + " €"
                    },
                    css: { "text-align": "right" },
                },
                {
                    id: "unidadId",
                    header: [translate("Unidades"), { content: "selectFilter" }],
                    sort: "string",
                    minWidth: 100,
                    editor: "combo",
                    collection: colUnidades,

                },
                {
                    id: "aplicarFormula",
                    header: [
                        translate("Aplicar Fórmula"),
                        {
                            content: "selectFilter",
                            options: [
                                { id: "1", value: "Sí" },
                                { id: "0", value: "No" }
                            ]
                        }
                    ],
                    width: 150,
                    editor: "checkbox",
                    template: "{common.checkbox()}",
                    css: { "text-align": "center" }
                },
                {
                    id: "tipoIvaId",
                    header: [translate("IVA"), { content: "selectFilter" }],
                    sort: "string",
                    minWidth: 100,
                    editor: "combo",
                    collection: colTiposIVA,

                },
                {
                    id: "porcen1",
                    header: [translate("% 1"), { content: "numberFilter" }],
                    adjust: "all",
                    css: { "text-align": "right" },
                    editor: "text", // Permite edición
                    format: threeDecimalFormat
                },
                {
                    id: "porcen2",
                    header: [translate("% 2"), { content: "numberFilter" }],
                    adjust: "all",
                    css: { "text-align": "right" },
                    editor: "text", // Permite edición
                    format: threeDecimalFormat
                },
                {
                    id: "porcen3",
                    header: [translate("% 3"), { content: "numberFilter" }],
                    adjust: "all",
                    css: { "text-align": "right" },
                    editor: "text", // Permite edición
                    format: threeDecimalFormat
                },
                {
                    id: "porcen4",
                    header: [translate("% 4"), { content: "numberFilter" }],
                    adjust: "all",
                    css: { "text-align": "right" },
                    editor: "text", // Permite edición
                    format: threeDecimalFormat
                },
                {
                    id: "descripcion",
                    header: ["Descripción (SHIFT + Enter salto de linea)", { content: "textFilter" }],
                    sort: "string",
                    minWidth: 350,
                    fillspace: true,
                    editor: "popup", // 🔹 Usa un editor emergente
                    template: function (obj) {
                        return obj.descripcion.replace(/\n/g, "<br>"); // 🔹 Muestra saltos de línea correctamente
                    }
                },
                { id: "actions", header: [{ text: translate("Acciones"), css: { "text-align": "center" } }], template: deleteButton, css: { "text-align": "center" }, minWidth: 100 }
            ],
            css: { "word-wrap": "break-word" },
            rightSplit: 1,
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
                "onBeforeLoad": function () {
                    capituloService.getCapitulos()
                        .then(rows => {
                            colGrupoArticulos = generalApi.prepareDataForCombo('grupoArticuloId', 'nombre', rows);
                            $$("unidadesObraGrid").getColumnConfig("grupoArticuloId").collection = colGrupoArticulos;
                            $$("unidadesObraGrid").refreshColumns(); // Refrescar opciones
                        }).catch((err) => {
                            messageApi.errorMessageAjax(err);
                        });
                    unidadesService.getUnidades()
                        .then(rows => {
                            colUnidades = generalApi.prepareDataForCombo('unidadId', 'nombre', rows);
                            $$("unidadesObraGrid").getColumnConfig("unidadId").collection = colUnidades;
                            $$("unidadesObraGrid").refreshColumns(); // Refrescar opciones
                        }).catch((err) => {
                            messageApi.errorMessageAjax(err);
                        });

                    tiposIvaService.getTiposIva()
                        .then(rows => {
                            colTiposIVA = generalApi.prepareDataForCombo('tipoIvaId', 'nombre', rows);
                            $$("unidadesObraGrid").getColumnConfig("tipoIvaId").collection = colTiposIVA;
                            $$("unidadesObraGrid").refreshColumns(); // Refrescar opciones
                        }).catch((err) => {
                            messageApi.errorMessageAjax(err);
                        });
                },
                "onAfterEditStart": function (id) {
                    currentIdDatatableView = id.row;
                    currentRowDatatableView = this.data.pull[currentIdDatatableView];
                },
                "onAfterEditStop": function (state, editor, ignoreUpdate) {
                    var rowId = editor.row;
                    var rowData = this.getItem(rowId);
                    //porcentajes
                    let porcenValue1 = this.$scope.convertirAEstandar(rowData.porcen1); // Convertir a formato inglés
                    let porcenValue2 = this.$scope.convertirAEstandar(rowData.porcen2); // Convertir a formato inglés
                    let porcenValue3 = this.$scope.convertirAEstandar(rowData.porcen3); // Convertir a formato inglés
                    let porcenValue4 = this.$scope.convertirAEstandar(rowData.porcen4); // Convertir a formato inglés
                    let costeValue = this.$scope.convertirAEstandar(rowData.coste); // Convertir a formato inglés
                    //
                    rowData.porcen1 = porcenValue1;
                    rowData.porcen2 = porcenValue2;
                    rowData.porcen3 = porcenValue3;
                    rowData.porcen4 = porcenValue4;
                    rowData.coste = costeValue;;

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
                "onCheck": function (rowId, columnId, state) {
                    if (columnId === "aplicarFormula") {
                        let rowData = this.getItem(rowId);
                        console.log("Checkbox cambiado:", state, "Fila actualizada:", rowData);
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
                },
                "onAfterFilter": function () {
                    var numReg = $$("unidadesObraGrid").count();
                    $$("CapitulosNReg").config.label = "NREG: " + numReg;
                    $$("CapitulosNReg").refresh();
                },
                "onEditorKeyPress": function (code, e) {
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
                if (index != -1) {
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
                            if (index != -1) {
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
    text: {
        view: "popup",
        body: { view: "textarea", width: 550, height: 550 }
    }
};