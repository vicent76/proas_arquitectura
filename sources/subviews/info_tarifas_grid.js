import { messageApi } from "../utilities/messages";
import { generalApi } from "../utilities/general";
import { articulosService } from "../services/articulos_service";
import { tiposProfesionalService } from "../services/tiposProfesional_service";



var editButton = "<span class='onEdit webix_icon wxi-pencil'></span>";

var seleccionados = [];
var _infoTarifasGridWindowCreated = false;
var clienteId;
var proveedorId;

export const infoTarifasGridWindow = {
    getGridTarifasWindow: (app) => {
        if (_infoTarifasGridWindowCreated) return; // Evitamos que se cree dos veces la misma venta
        const translate = app.getService("locale")._;

        //filto por profesionas
        var filtro = {
           rows: [
                {
                cols: [
                    {
                        view: "combo", id: "cmbTiposProf", name: "tipoProfesionalId", options: {},
                        label: "Tipo profesional", labelPosition: "top", width: 200, on:{
                            onChange(newv, oldv){
                                var tipo = newv;
                                
                                
                                if(tipo || tipo != "") {
                                    infoTarifasGridWindow.loadGridTarifas(clienteId, proveedorId, tipo)
                                }
                            }
                        }
                    },
                    {
                        minWidth: 240
                    },
                    {
                        view: "text", id: "tarifaClienteNombre", value: 0, name: "tarifaClienteNombre", 
                        minWidth: 100, disabled:true
                    },
                    {
                        view: "text", id: "tarifaProveedorNombre", value: 0, name: "tarifaProveedorNombre",
                        minWidth: 100, disabled:true
                    },
                ]
                }
           ] 
        }
        //toolbar de la solapa partes
        var toolbarTarifas = {
            view: "toolbar", padding: 3, elements: [
                { view: "icon", icon: "mdi mdi-archive", width: 37, align: "left" },
                { view: "label", label: "Tarifas" }
            ]
        }
        //pager de la solapa partes
        var pagerTarifas = {
            cols: [
                {
                    view: "button", type: "icon", icon: "mdi mdi-refresh", width: 37, align: "left", hotkey: "Ctrl+R",
                    tooltip: translate("Refrescar la lista (Ctrl+R)"),
                    click: ()=>{
                        infoTarifasGridWindow.cleanAndload();
                    }
                },
                {
                    view: "button", type: "icon", icon: "wxi-download", width: 37, align: "right",
                    tooltip: translate("Descargar como Excel"),
                    click: () => {
                        webix.toExcel($$("tarifasGrid"), {
                            filename: "tarifas",
                            name: "tarifas",
                            rawValues: true,
                            ignore: { "actions": true }
                        });
                    }
                },
                {
                    view: "label", id: "TarifasNReg", label: "NREG: "
                },
                {
                    view: "pager", id: "mypagerTarifas", css: { "text-align": "right" },
                    template: "{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}",
                    size: 25,
                    group: 5
                }
            ]
        };
       
        //grid de la solapa partes
        var datatableTarifas = {
            view: "datatable",
            css: {"font-size": "0.9em", "font-weight": "bold"},
            //autoheight:true,
            height: 550,
            id: "tarifasGrid",
            scroll: "x,y",
            pager: "mypagerTarifas",
            select: "row",
            columns: [  
                { id: "articuloId", header: ["Id", { content: "textFilter" }], sort: "int", width:50, hidden: true},
                { id: "codigoReparacion", header: ["Codigo reparación", { content: "textFilter" }], sort: "string", width: 60 },
                { id: "abrev", header: ["Unidad", { content: "textFilter" }], sort: "string",width: 50 },
                { id: "nombre", header: ["Nombre", { content: "textFilter" }], sort: "string",width: 350 },
                { id: "precioCliente", header: ["Precio cli", { content: "textFilter" }], sort: "int" ,format:webix.i18n.numberFormat, width: 110},
                { id: "precioProveedor",  header: ["Precio pro.", { content: "textFilter" }], sort: "int", format:webix.i18n.numberFormat, width: 110 }
            ],
            scroll:true,
            on: {
                "onItemDblClick":function(id, colId, state){
                    var curRow = this.data.pull[id.row]
                   
                    $$('tarifasGridWindow').hide();
                }
            },
            onClick: {
                "onEdit": function (event, id, node) {
                    var curRow = this.data.pull[id.row];
                }
            },
            editable: true,
            editaction: "dblclick",
            rules: {
                
            }
        }

        const _viewTarifas = {
            rows: [
                toolbarTarifas,
                pagerTarifas,
                filtro,
                datatableTarifas
            ]
        }
        webix.ui({
            view: "window",
            id: "tarifasGridWindow",
            position: "center", move: true, resize: false,
            width: 690,
            height: 690,
            head: {
                view: "toolbar", cols: [
                    {},
                    {
                        view: "icon", icon: "mdi mdi-close", click: () => {
                            $$('tarifasGridWindow').hide();
                        }
                    }
                ]
            }, modal: true,
            body: _viewTarifas
        });

        _infoTarifasGridWindowCreated = true;
    },
    loadWindow(clienteid, proveedorid, tipo) {
        clienteId = clienteid;
        proveedorId = proveedorid;
        $$('tarifasGridWindow').show();
        infoTarifasGridWindow.loadTiposProfesionales(tipo)
        infoTarifasGridWindow.loadGridTarifas(clienteId, proveedorId, tipo);

    },
    loadGridTarifas(clienteId, proveedorId, tipo) {
        if(!tipo || tipo =="") tipo = 0;
        articulosService.getArticulosTarifas(clienteId, proveedorId, tipo)
                .then((data)=> {
                    var obj;
                    if(data.length > 0) {
                        obj = infoTarifasGridWindow.formateaData(data);
                    } else {
                        $$("tarifasGrid").clearAll();
                        var numReg = $$("tarifasGrid").count();
                        $$("TarifasNReg").config.label = "NREG: " + numReg;
                        $$("TarifasNReg").refresh();
                        return;
                    }
                    $$("tarifasGrid").clearAll();
                    $$("tarifasGrid").parse(generalApi.prepareDataForDataTable("articuloId", obj));
                
                    var numReg = $$("tarifasGrid").count();
                    $$("TarifasNReg").config.label = "NREG: " + numReg;
                    $$("TarifasNReg").refresh();
                     
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
    },

    formateaData(data) {
        var objc = [];
        $$('tarifaClienteNombre').setValue(data[0].tarifaClienteNombre);
        $$('tarifaProveedorNombre').setValue(data[0].tarifaProveedorNombre);
        data.forEach(e => {
            delete e.tarifaClienteId;
            delete e.tarifaClienteNombre;
            delete e.tarifaProveedorNombre;
            delete e.tarifaProveedorId;
            objc.push(e);
        });

        return objc;
    },

    loadTiposProfesionales(tipoProfesionalId)  {
        tiposProfesionalService.getTiposProfesional()
            .then(rows => {
                var objc = {
                    tipoProfesionalId: 0,
                    nombre: ""
                }
                rows.splice(0,0,objc);
                var tiposProfesionales = generalApi.prepareDataForCombo('tipoProfesionalId', 'nombre', rows);
                var list = $$("cmbTiposProf").getPopup().getList();
                list.clearAll();
                list.parse(tiposProfesionales);
                if (tipoProfesionalId) {
                    $$("cmbTiposProf").setValue(tipoProfesionalId);
                    $$("cmbTiposProf").refresh();
                } else {
                    $$("cmbTiposProf").setValue(null);
                    $$("cmbTiposProf").refresh();
                }
                return;
            })
    },

    cleanAndload() {
        $$("tarifasGrid").eachColumn(function (id, col) {
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



