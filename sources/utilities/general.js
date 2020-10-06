export const generalApi = {
    prepareDataForDataTable: (idColumn, rows) => {
        var _rows2 = [];
        rows.forEach(function(e){
            e.id = e[idColumn];
            _rows2.push(e);
        });
        return _rows2;
    },
    prepareDataForCombo: (idColumn, valueComun, rows) => {
        var _rows2 = [];
        rows.forEach(function(e){
            _rows2.push({
                id: e[idColumn],
                value: e[valueComun]
            });
        });
        return _rows2;
    }
}

