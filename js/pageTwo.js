addMdToPage(`
  <br> 
  <br> 

  ### Studierelaterad stress

  När vi tittar på datan över respondenternas studierelaterade stress ser vi en tydlig korrelation mellan stressnivå och andelen studenter med depression. 
  
  Skillnaden mellan könen tycks vara små.

  Vi ser marginella skillnader mellan de olika akademiska inriktningarna. Endast kategorin "Övriga utbildningar" står ut. Tyvärr säger inte datasetet något om vilken typ av utbildningar denna kategori innehåller.

  På det hela taget verkar valet av utbildning som sådan inte säga mycket om förekomsten av depression (om vi utesluter kategorin "Övriga utbildningar).

  ___

`);

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
  columnNames: ['Stressnivå', 'Andel deprimerade studenter (i procent)', 'Studenter med tankar på suicid (i procent)']
});

addMdToPage(`
  ---
  `)

addMdToPage(`
<br>

### Kön och utbildningsnivå

`)

const degreeTranslations = {
  'bachelor': 'Kandidat',
  'master': 'Magister',
  'doctor': 'Doktorand',
  'other': 'Övriga utbildningar'
};

const reverseDegreeTranslations = Object.fromEntries(
  Object.entries(degreeTranslations).map(([eng, swe]) => [swe, eng])
);


let rawDegrees = await dbQuery('SELECT DISTINCT degree FROM studentSurvey');
let educationOptions = ['Totalt', ...rawDegrees.map(x => degreeTranslations[x.degree] || x.degree)];

let rawGenders = await dbQuery('SELECT DISTINCT gender FROM studentSurvey');
let genderOptions = ['Totalt', ...rawGenders.map(x =>
  x.gender === 'Male' ? 'Män' : x.gender === 'Female' ? 'Kvinnor' : x.gender
)];

let selectedEducation = addDropdown('Utbildningsnivå', educationOptions, 'Totalt');
let selectedGender = addDropdown('Kön', genderOptions, 'Totalt');


let filters = [];
if (selectedEducation !== 'Totalt') {
  filters.push(`degree = '${reverseDegreeTranslations[selectedEducation] || selectedEducation}'`);
}
if (selectedGender !== 'Totalt') {
  const genderValue = selectedGender === 'Män' ? 'Male' : selectedGender === 'Kvinnor' ? 'Female' : selectedGender;
  filters.push(`gender = '${genderValue}'`);
}

let whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';


let rawData = await dbQuery(`
  SELECT gender, degree, AVG(depression) as avgDepression
  FROM studentSurvey
  ${whereClause}
  GROUP BY gender, degree
`);


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

drawGoogleChart({
  type: 'BarChart',
  data: chartData,
  options: {
    title: 'Förekomst av depression per kön och utbildningsnivå',
    height: 600,
    chartArea: { left: 50, right: 20, top: 50, bottom: 80 },
    legend: { position: 'none' },
    hAxis: {
      title: 'Depression (i procent)',
      slantedText: true,
      slantedTextAngle: 45,
      minValue: 0,
      maxValue: 100
    },
    vAxis: {
      title: 'Kön och utbildning',
      minValue: 0,
      textStyle: { fontSize: 10 }
    },
    titleTextStyle: {
      fontSize: 14
    },
    tooltip: { isHtml: true }
  }
});

// Förbered data för att visa korrelation mellan akademisk stress och depression.
let chartDataPressure = [
  ['Stressnivå', 'Depression (%)', 'Suicidtankar (%)']
];

for (let row of stressTable) {
  let level = parseInt(row.academicPressure);
  let depression = parseFloat(row.avgDepression.replace('%', ''));
  let suicidal = parseFloat(row.avgSuicidal.replace('%', ''));
  chartDataPressure.push([level, depression, suicidal]);
}

addMdToPage(`
  
<BR>

  `)

drawGoogleChart({
  type: 'LineChart',
  data: chartDataPressure,
  options: {
    title: 'Samband mellan studierelaterad stress och psykisk ohälsa',
    height: 400,
    chartArea: { left: 60, right: 20, top: 50, bottom: 60 },
    hAxis: {
      title: 'Studierelaterad stress (1 = låg, 5 = hög)',
      minValue: 1,
      maxValue: 5,
      format: '0'
    },
    vAxis: {
      title: 'Andel studenter (%)',
      minValue: 0,
      maxValue: 100
    },
    colors: ['#ff9900', '#dc3912'],
    pointSize: 5,
    titleTextStyle: {
      fontSize: 14
    },
    legend: { position: 'bottom' }
  }
});

