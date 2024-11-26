// ***** VARIABLE DECLARATIONS *****
let _a = [], _b = [], _c = [], _d = [], _e = [], _f = [], _g = [];

// ***** DATA EXTRACTION *****
data.series.map((s) => {
    _a = s.fields.find((f) => f.name === 'entry_date').values.buffer;
    _b = s.fields.find((f) => f.name === 'total_searches (sum)').values.buffer;
    _c = s.fields.find((f) => f.name === 'total_conversions (sum)').values.buffer;
    _d = s.fields.find((f) => f.name === 'unique_users (sum)').values.buffer;
});

// ***** DATE SELECTION *****
const _h = replaceVariables("${monthvar}");
const _i = replaceVariables("${yearvar}");
let _j = _i + "-" + _h;
let _k = (new Date()).toISOString().split('T')[0];

// Helper function to check if dates are in the same month
function _l(_1, _2) {
    let [_y1, _m1] = _1.split('-');
    let [_y2, _m2] = _2.split('-');
    return _y1 === _y2 && _m1 === _m2;
}

// Filter data for the selected month
for (let _idx = 0; _idx < _a.length; _idx++) {
    if (_l(_a[_idx], _j)) {
        _e.push(_a[_idx]);
        _f.push(_c[_idx]);
        _g.push(_d[_idx]);
    }
}

// ***** HANDLE MISSING DATES *****
function _m(_arr1, _arr2, _arr3) {
    const [_yr, _mn] = _arr1[0].split('-').map(Number);
    const _days = new Date(_yr, _mn, 0).getDate();
    const _n = Object.fromEntries(_arr1.map((_d, _i) => [_d, { _users: _arr2[_i], _conv: _arr3[_i] }]));

    for (let _d = 1; _d <= _days; _d++) {
        const _curr = `${_yr}-${String(_mn).padStart(2, '0')}-${String(_d).padStart(2, '0')}`;
        if (!(_curr in _n)) _arr1.push(_curr);
    }
}

// Fill missing dates in the data
_m(_e, _f, _g);

// ***** SCATTER AND PIE SERIES *****
const _cell = [80, 80], _radius = 30;

// Create virtual data for the scatter chart
function _o() {
    let _data = [];
    _e.forEach((_d) => _data.push([echarts.time.format(_d, '{yyyy}-{MM}-{dd}', false)]));
    return _data;
}

const _scatter = _o();

// Create pie series for each scatter point
const _pie = _scatter.map(function (_pt, _idx) {
    return {
        type: 'pie',
        id: 'pie-' + _idx,
        center: _pt[0],
        radius: _radius,
        coordinateSystem: 'calendar',
        label: {
            formatter: '{c}',
            position: 'inside'
        },
        data: [
            { name: 'Misses', value: _g[_idx] - _f[_idx] },
            { name: 'Booking', value: _f[_idx] }
        ]
    };
});

// ***** ECHARTS CONFIGURATION *****
return {
    tooltip: {},
    legend: {
        data: ['Misses', 'Booking'],
        bottom: 20
    },
    calendar: {
        top: '2%',
        left: '2%',
        bottom: 40,
        right: '2%',
        orient: 'vertical',
        cellSize: _cell,
        yearLabel: { show: false, fontSize: 30 },
        dayLabel: {
            margin: 20,
            firstDay: 1,
            nameMap: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        },
        monthLabel: { show: false },
        range: [_j]
    },
    series: [
        {
            id: 'label',
            type: 'scatter',
            coordinateSystem: 'calendar',
            symbolSize: 0,
            label: {
                show: true,
                formatter: function (_p) {
                    return echarts.time.format(_p.value[0], '{dd}', false);
                },
                offset: [-_cell[0] / 2 + 10, -_cell[1] / 2 + 10],
                fontSize: 14
            },
            data: _scatter
        },
        ..._pie
    ]
};
