addMdToPage(`
## Studie om psykisk hälsa bland studenter i Indien.
27867 repondenter har svarat på frågor om psykisk hälsa och depression relaterat till kön, ålder, studienivå med mera.
<br>
<br>
Respondenter: 27867
Male	15528 Depressed: 9100
Female	12339 Depressed:7207
`);

let depressionRatesByGender = await dbQuery(`
  SELECT 
    CASE 
      WHEN gender = 'Male' THEN 'Män'
      WHEN gender = 'Female' THEN 'Kvinnor'
      ELSE gender 
    END AS label,
    ROUND((SUM(CASE WHEN depression = 1 THEN 1 ELSE 0 END) * 100.0) / COUNT(*), 2) AS depression
  FROM studentSurvey
  GROUP BY gender
`);

//en kommentar och en till 

let depressionRateTotal = await dbQuery(`
  SELECT 
    'Totalt' AS label,
    ROUND((SUM(CASE WHEN depression = 1 THEN 1 ELSE 0 END) * 100.0) / COUNT(*), 2) AS depression
  FROM studentSurvey
`);

let depressionOptions = [
  ...depressionRateTotal,   // array with 1 object
  ...depressionRatesByGender // array of gender-based data
];

let genderDropdown = addDropdown('kön', depressionOptions.map(option => option.label));

console.log(depressionOptions)
console.log(genderDropdown)






/*

drawGoogleChart({
  type: 'ColumnChart',
  data: makeChartFriendly(chartData),
  options: {
    legend: { position: 'none' },
    title: 'Depression uppdelat på kön, samt totalt (i procent)',
    height: 500,
    chartArea: { left: 80 },
    vAxis: {
      viewWindow: { min: 0, max: 100 }
    },
    hAxis: {
      viewWindow: { min: 0 }
    },
    colors: ['#bb2a2b', '#998466', '#958866']
  }
});



drawGoogleChart({
  type: 'ColumnChart',
  data: makeChartFriendly(chartData),
  options: {
    legend: { position: 'none' },
    title: 'Depression uppdelat på kön, samt totalt (i procent)',
    height: 500,
    chartArea: { left: 80 },
    colors: ['#bb2a2b', '#998466', '#958866'],
    vAxis: {
      viewWindow: { min: 0, max: 100 }
    },
    hAxis: {
      viewWindow: { min: 0 }
    }
  }
});





///

/*
let depressionRateTotal = await dbQuery(`
  SELECT
    'Totalt' AS label,
    ROUND((SUM(CASE WHEN depression = 1 THEN 1 ELSE 0 END) * 100.0) / COUNT(*), 2) AS 'Depression %'
  FROM studentSurvey
  `);

let depressionRateWomen = (await dbQuery(
  `SELECT
IF(gender = 'Male', 'Män', IF(gender = 'Female', 'Kvinnor', gender)) AS label,
  ROUND((SUM(CASE WHEN depression = 1 THEN 1 ELSE 0 END) * 100.0) / COUNT(*), 2) AS 'depression'
FROM studentSurvey
GROUP BY gender`
)).filter(x => x.label === 'Kvinnor' && x.depression > 0);

let depressionRateMen = (await dbQuery(
  `SELECT
IF(gender = 'Male', 'Män', IF(gender = 'Female', 'Kvinnor', gender)) AS label,
  ROUND((SUM(CASE WHEN depression = 1 THEN 1 ELSE 0 END) * 100.0) / COUNT(*), 2) AS 'depression'
FROM studentSurvey
GROUP BY gender`
)).filter(x => x.label === 'Män' && x.depression > 0);

let depressionRates = (await dbQuery(
  `SELECT
    IF(gender = 'Male', 'Män', IF(gender = 'Female', 'Kvinnor', gender)) AS label,
    ROUND((SUM(CASE WHEN depression = 1 THEN 1 ELSE 0 END) * 100.0) / COUNT(*), 2) AS depression
  FROM studentSurvey
  GROUP BY gender`
)).filter(x =>
  (x.label === 'Kvinnor' || x.label === 'Män') && x.depression > 0
);

// Data overview, first five rows

tableFromData({ data: vars.data });

// Total respondents

tableFromData({ data: vars.totalRespondents });

// Total respondents with depression

tableFromData({ data: vars.totalDepression });

// Total male respondents with depression

tableFromData({ data: vars.totalDepressionMen });

// Total female respondents with depression

tableFromData({ data: vars.totalDepressionWomen });

///
/*
const chartDataGenderDepression = vars.totalDepressionGenderPercent.map(({ gender, depressionPercentage }) => [gender, (depressionPercentage)]);


console.log('gender percent', chartDataGenderDepression)

drawGoogleChart({
  type: 'ColumnChart',
  data: makeChartFriendly(chartDataGenderDepression),
  options: {
    title: 'Depression kön absoluta tal',
    height: 500,
    chartArea: { left: 80 },
    hAxis: {
      slantedText: true,
      slantedAngle: 45
    },
    vAxis: {
      viewWindow: {
        min: 0
      }
    }
  }
});


/*
let genderDepression = [
  vars.totalDepressionMen[0],
  vars.totalDepressionWomen[0]
]
*/

//chartDataGenderDepression = genderDepression.map({ gender, count }), ({ gender, count })
/*
const chartDataGenderDepression = [
  ...genderDepression.map(({ gender, count }) => [gender, Number(count)])
];
*/


/*

//y u no work?

let chartDataGenderDepression = [
  ['Gender', 'Depression %'],
  vars.totalDepressionGenderPercent
    .map(({ gender, depressionPercentage }) => [
      gender,
      Number(depressionPercentage)
    ])
];

// no work either

const chartGenderPercent = [
  ['Gender', 'Depression %'],
  ...vars.totalDepressionGenderPercent.map(({ gender, depressionPercentage }) => [gender, Number(depressionPercentage)])
];


console.log("lajsbdlajsbdlkasbdl")
console.log("Test - ", vars.totalDepressionWomen)
console.log("Test - ", vars.totalDepressionWomen[0]["Antal kvinnor som uppger depression"])

let chartData = [
  ['Totalt', totalDepPercent[0]?.['Depression %'] || 0],
  ['Män', genDepPercent
    .find(r => r.label === 'Män')?.['Depression %'] || 0],
  ['Kvinnor', genDepPercent
    .find(r => r.label === 'Kvinnor')?.['Depression %'] || 0]
];

  */