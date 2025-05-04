
let depressionData = await dbQuery(`
  SELECT 
    CASE 
        WHEN gender = 'Male' THEN 'Män'
        WHEN gender = 'Female' THEN 'Kvinnor'
        ELSE gender 
    END AS label,
    ROUND(SUM(CASE WHEN depression = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS depressionRate,
    ROUND(SUM(CASE WHEN suicidalThoughts = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS suicidalThoughtsRate
FROM studentSurvey
GROUP BY gender

UNION ALL

SELECT 
    'Totalt' AS label,
    ROUND(SUM(CASE WHEN depression = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS depressionRate,
    ROUND(SUM(CASE WHEN suicidalThoughts = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS suicidalThoughtsRate
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



/////
const colorMap = {
  'Kvinnor': '#edb2b2', // pink
  'Män': '#6fa8dc',     // blue
  'Totalt': '#C1C0AE'   // green
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

console.log(chartData)


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