addMdToPage(`
  <br> 
  <br> 

  ### Studierelaterad stress
`);


// Akademisk stress.
let stressTable = await dbQuery(`
  SELECT academicPressure, AVG(depression) as avgDepression, AVG(suicidalThoughts) as avgSuicidal
  FROM studentSurvey
  GROUP BY academicPressure
  ORDER BY academicPressure
`);

stressTable = stressTable.map(row => ({
  academicPressure: row.academicPressure,
  avgDepression: (row.avgDepression * 100).toFixed(1) + '%',
  avgSuicidal: (row.avgSuicidal * 100).toFixed(1) + '%'
}));

addMdToPage(`
  <br>

  ### Studierelaterad stress.
  Graderad 1-5, där 5 indikerar högsta möjliga stressnivå.

  <br>

  
`);

tableFromData({
  data: stressTable,
  columnNames: ['Stressnivå', 'Depressionsgrad (i procent)', 'Grad av suicidtankar (i procent)']
});

addMdToPage(`
  ---
  `)

addMdToPage(`
<br>

### Kön och utbildningsnivå

`)

// Översättningar.
const degreeTranslations = {
  'bachelor': 'Kandidat',
  'master': 'Magister',
  'doctor': 'Doktorand',
  'other': 'Övriga utbildningar'
};

const reverseDegreeTranslations = Object.fromEntries(
  Object.entries(degreeTranslations).map(([eng, swe]) => [swe, eng])
);

// Skapa dropdown-menyer.
let rawDegrees = await dbQuery('SELECT DISTINCT degree FROM studentSurvey');
let educationOptions = ['Totalt', ...rawDegrees.map(x => degreeTranslations[x.degree] || x.degree)];

let rawGenders = await dbQuery('SELECT DISTINCT gender FROM studentSurvey');
let genderOptions = ['Totalt', ...rawGenders.map(x =>
  x.gender === 'Male' ? 'Män' : x.gender === 'Female' ? 'Kvinnor' : x.gender
)];

let selectedEducation = addDropdown('Utbildningsnivå', educationOptions, 'Totalt');
let selectedGender = addDropdown('Kön', genderOptions, 'Totalt');

// SQL-filter.
let filters = [];
if (selectedEducation !== 'Totalt') {
  filters.push(`degree = '${reverseDegreeTranslations[selectedEducation] || selectedEducation}'`);
}
if (selectedGender !== 'Totalt') {
  const genderValue = selectedGender === 'Män' ? 'Male' : selectedGender === 'Kvinnor' ? 'Female' : selectedGender;
  filters.push(`gender = '${genderValue}'`);
}

let whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

// Hämta data.
let rawData = await dbQuery(`
  SELECT gender, degree, AVG(depression) as avgDepression
  FROM studentSurvey
  ${whereClause}
  GROUP BY gender, degree
`);

// Förbered data för Google Chart.
let chartData = [
  ['Kön - Utbildning', 'Genomsnittlig depression (%)', { role: 'style' }]
];

let colorMapping = {
  'Female': '#edb2b2',
  'Male': '#6fa8dc',
};

for (let row of rawData) {
  let genderLabel = row.gender === 'Male' ? 'Män' : row.gender === 'Female' ? 'Kvinnor' : row.gender;
  let degreeLabel = degreeTranslations[row.degree] || row.degree;
  let label = `${degreeLabel} - ${genderLabel}`;
  let depression = row.avgDepression * 100;
  let color = colorMapping[row.gender] || 'color: gray';
  chartData.push([label, depression, color]);
}

// Rita diagrammet.
drawGoogleChart({
  type: 'ColumnChart',
  data: chartData,
  options: {
    title: 'Genomsnittlig depression per kön och utbildningsnivå (%)',
    height: 600,
    chartArea: { left: 50, right: 20, top: 50, bottom: 80 },
    legend: { position: 'none' },
    hAxis: {
      title: 'Kön och utbildning',
      slantedText: true,
      slantedTextAngle: 45
    },
    vAxis: {
      title: 'Depression (%)',
      minValue: 0,
      textStyle: { fontSize: 10 }
    },
    titleTextStyle: {
      fontSize: 14
    },
    tooltip: { isHtml: true }
  }
});
