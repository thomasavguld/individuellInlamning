
addMdToPage(`
## Depression och suicid


Här tittar vi på graden av depression bland studenterna, uppdelat på kön. Vi kan också jämföra studenter som utöver depression också uttrycker tankar om suicid.

Värt att notera är den anmärkningsvärt lilla varians det finns mellan grupperna, utifrån de siffror vi har i datasetet.

___


`);

let depressionCountTable = await dbQuery(`
  SELECT 
    CASE 
        WHEN gender = 'Male' THEN 'Män'
        WHEN gender = 'Female' THEN 'Kvinnor'
        ELSE gender 
    END AS Kön,
    SUM(CASE WHEN depression = 1 THEN 1 ELSE 0 END) AS Depressionsgrad
  FROM studentSurvey
  GROUP BY gender;
`);

tableFromData({
  data: depressionCountTable,
  columnNames: ['Kön', 'Studenter med depression']
});



let depressionData = await dbQuery(`
SELECT 
  CASE 
      WHEN gender = 'Male' THEN 'Män'
      WHEN gender = 'Female' THEN 'Kvinnor'
      ELSE gender 
  END AS label,
  ROUND(SUM(CASE WHEN depression = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS depressionRate,
  ROUND(SUM(CASE WHEN suicidalThoughts = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS suicidalThoughtsRate,
  COUNT(*) AS totalCount
FROM studentSurvey
GROUP BY gender

UNION ALL

SELECT 
  'Totalt' AS label,
  ROUND(SUM(CASE WHEN depression = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2),
  ROUND(SUM(CASE WHEN suicidalThoughts = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2),
  COUNT(*)
FROM studentSurvey
`)


let depressionSuicideData = await dbQuery(`
  SELECT 
  CASE 
    WHEN gender = 'Male' THEN 'Män'
    WHEN gender = 'Female' THEN 'Kvinnor'
    ELSE gender
  END AS label,
  ROUND(
    SUM(CASE WHEN depression = 1 AND suicidalThoughts = 1 THEN 1 ELSE 0 END) * 100.0 / 
    COUNT(*), 
    2
  ) AS depressionAndSuicidalRate
FROM studentSurvey
GROUP BY gender

UNION ALL

SELECT 
  'Totalt' AS label,
  ROUND(
    SUM(CASE WHEN depression = 1 AND suicidalThoughts = 1 THEN 1 ELSE 0 END) * 100.0 / 
    COUNT(*), 
    2
  ) AS depressionAndSuicidalRate
FROM studentSurvey
`)

let colorMap = {
  'Kvinnor': '#edb2b2',
  'Män': '#6fa8dc',
  'Totalt': '#C1C0AE',
  'Kvinnor Depression + Suicidal': '#e57373', // for the combined label
  'Män Depression + Suicidal': '#1976d2', // for the combined label
  'Totalt Depression': '#f1c40f', // for the combined label
  'Totalt Depression + Suicidal': '#f39c12' // for the combined label
};


let depressionGroups = [
  {
    label: 'Depression kvinnor',
    group: 'Kvinnor',
    rate: depressionData.find(x => x.label === 'Kvinnor')?.depressionRate ?? 0
  },
  {
    label: 'Depression män',
    group: 'Män',
    rate: depressionData.find(x => x.label === 'Män')?.depressionRate ?? 0
  },
  {
    label: 'Depression totalt',
    group: 'Totalt',
    rate: depressionData.find(x => x.label === 'Totalt')?.depressionRate ?? 0
  }
];

let depressionSuicideGroups = [
  {
    label: 'Depression och suicidala tankar kvinnor',
    group: 'Kvinnor',
    rate: depressionSuicideData.find(x => x.label === 'Kvinnor')?.depressionAndSuicidalRate ?? 0
  },
  {
    label: 'Depression och suicidala tankar män',
    group: 'Män',
    rate: depressionSuicideData.find(x => x.label === 'Män')?.depressionAndSuicidalRate ?? 0
  },
  {
    label: 'Depression och suicidala tankar totalt',
    group: 'Totalt',
    rate: depressionSuicideData.find(x => x.label === 'Totalt')?.depressionAndSuicidalRate ?? 0
  }
];

let groupLabels = ['Kvinnor', 'Män'];
let metricTypes = ['Depression', 'Depression och suicidala tankar'];

let chosenGroup = addDropdown('Kön', groupLabels, 'Kvinnor');
let chosenMetric = addDropdown('Problematik', metricTypes, 'Depression');

let selectedRate = 0;

if (chosenMetric === 'Depression') {
  selectedRate = depressionGroups.find(x => x.group === chosenGroup)?.rate ?? 0;
} else if (chosenMetric === 'Depression och suicidala tankar') {
  selectedRate = depressionSuicideGroups.find(x => x.group === chosenGroup)?.rate ?? 0;
}

let chartData = [
  [chosenGroup, selectedRate]
]


drawGoogleChart({
  type: 'ColumnChart',
  data: makeChartFriendly(chartData),
  options: {
    title: chosenMetric + ' per kön (i procent)',
    legend: { position: 'none' },
    height: 500,
    chartArea: { left: 80 },
    vAxis: {
      viewWindow: { min: 0, max: 100 }
    },
    hAxis: {
      viewWindow: { min: 0 }
    },
    colors: [colorMap[chosenGroup] || '#C1C0AE'],
    tooltip: {
      isHtml: true,
      trigger: 'both'
    }
  }
});

let comparisonGroup = addDropdown('Kön', groupLabels, 'Män');
let comparisonMetric = addDropdown('Problematik', metricTypes, 'Depression');

let comparisonRate = 0;

if (comparisonMetric === 'Depression') {
  comparisonRate = depressionGroups.find(x => x.group === comparisonGroup)?.rate ?? 0;
} else if (comparisonMetric === 'Depression och suicidala tankar') {
  comparisonRate = depressionSuicideGroups.find(x => x.group === comparisonGroup)?.rate ?? 0;
}

let comparisonChartData = [
  [comparisonGroup, comparisonRate]
];


drawGoogleChart({
  type: 'ColumnChart',
  data: makeChartFriendly(comparisonChartData),
  options: {
    legend: { position: 'none' },
    title: comparisonMetric + ' i jämförelse',
    height: 500,
    chartArea: { left: 80 },
    vAxis: {
      viewWindow: { min: 0, max: 100 }
    },
    colors: [colorMap[comparisonGroup] || '#C1C0AE'] // Use color based on comparison group
  }
});


let combinedChartData = [
  ['Grupp', 'Grupp 1', 'Grupp 2'],
  [chosenGroup + ' (' + chosenMetric + ')', selectedRate, null],
  [comparisonGroup + ' (' + comparisonMetric + ')', null, comparisonRate]
];

drawGoogleChart({
  type: 'ColumnChart',
  data: combinedChartData,
  options: {
    legend: { position: 'none' },
    title: 'Jämförelse: ' + chosenMetric + ' vs ' + comparisonMetric,
    height: 500,
    chartArea: { left: 80 },
    vAxis: {
      viewWindow: { min: 0, max: 100 }
    },
    colors: [
      colorMap[chosenGroup] || '#C1C0AE',
      colorMap[comparisonGroup] || '#C1C0AE'
    ]
  }
});


let unifiedChartData = [
  ['Grupp',
    'Depression (%) - Kvinnor', 'Suicid (%) - Kvinnor',
    'Depression (%) - Män', 'Suicid (%) - Män',
    'Depression (%) - Totalt', 'Suicid (%) - Totalt',
    'Antal studenter']
];

['Kvinnor', 'Män', 'Totalt'].forEach(group => {
  let depressionEntry = depressionData.find(x => x.label === group);
  let suicideEntry = depressionSuicideData.find(x => x.label === group);
  let depression = depressionEntry?.depressionRate ?? null;
  let suicide = suicideEntry?.depressionAndSuicidalRate ?? null;
  let count = depressionEntry?.totalCount ?? null;

  unifiedChartData.push([
    group,
    group === 'Kvinnor' ? depression : null,
    group === 'Kvinnor' ? suicide : null,
    group === 'Män' ? depression : null,
    group === 'Män' ? suicide : null,
    group === 'Totalt' ? depression : null,
    group === 'Totalt' ? suicide : null,
    count // ✅ one line across all
  ]);
});

drawGoogleChart({
  type: 'ComboChart',
  data: unifiedChartData,
  options: {
    title: 'Depression och tankar om suicid bland studenter',
    height: 500,
    chartArea: { left: 80 },
    legend: { position: 'right' },
    vAxes: {
      0: { title: 'Procent (%)', minValue: 0 },
      1: { title: 'Antal studenter', minValue: 0 }
    },
    seriesType: 'bars',
    series: {
      0: { color: '#edb2b2' }, // Kvinnor Depression
      1: { color: '#e57373' }, // Kvinnor Suicid
      2: { color: '#6fa8dc' }, // Män Depression
      3: { color: '#1976d2' }, // Män Suicid
      4: { color: '#f1c40f' }, // Totalt Depression
      5: { color: '#f39c12' }, // Totalt Suicid
      6: { type: 'line', targetAxisIndex: 1, color: '#6aa84f' } // ONE LINE
    },
    isStacked: false
  }
});



