addMdToPage(`
  <br>
  <br>
  ### Sömn och psykisk hälsa efter kön
  Genomsnittlig depression och förekomst av suicidtankar per sömnlängd, uppdelat efter kön.
  <br>
`);

let rawGendersSleep = await dbQuery('SELECT DISTINCT gender FROM studentSurvey');
let genderOptionsSleep = ['Totalt', ...rawGendersSleep.map(x =>
  x.gender === 'Male' ? 'Män' : x.gender === 'Female' ? 'Kvinnor' : x.gender
)];

let selectedGenderSleep = addDropdown('Kön', genderOptionsSleep, 'Totalt');

let filtersSleep = [];
if (selectedGenderSleep !== 'Totalt') {
  const genderValue = selectedGenderSleep === 'Män' ? 'Male' : selectedGenderSleep === 'Kvinnor' ? 'Female' : selectedGenderSleep;
  filtersSleep.push(`gender = '${genderValue}'`);
}

let whereClauseSleep = filtersSleep.length > 0 ? `WHERE ${filtersSleep.join(' AND ')}` : '';

// Hämta data: depression och suicidtankar per sömnkategori och kön
let sleepStats = await dbQuery(`
  SELECT sleepDuration, gender, AVG(depression) as avgDepression, AVG(suicidalThoughts) as avgSuicidal
  FROM studentSurvey
  ${whereClauseSleep}
  GROUP BY sleepDuration, gender
  ORDER BY sleepDuration
`);

// Förbered depression-data
let chartDataDepression = [
  ['Sömnlängd - Kön', 'Depression (%)', { role: 'style' }]
];

// Förbered suicidtankar-data
let chartDataSuicidal = [
  ['Sömnlängd - Kön', 'Suicidtankar (%)', { role: 'style' }]
];

for (let row of sleepStats) {
  let genderLabel = row.gender === 'Male' ? 'Män' : row.gender === 'Female' ? 'Kvinnor' : row.gender;
  let label = `${row.sleepDuration} tim - ${genderLabel}`;
  let color = row.gender === 'Female' ? '#edb2b2' : row.gender === 'Male' ? '#6fa8dc' : 'gray';

  chartDataDepression.push([label, row.avgDepression * 100, color]);
  chartDataSuicidal.push([label, row.avgSuicidal * 100, color]);
}

// Diagram 1: Depression
drawGoogleChart({
  type: 'ColumnChart',
  data: chartDataDepression,
  options: {
    title: 'Depression per sömnkategori och kön (%)',
    height: 500,
    chartArea: { left: 50, right: 20, top: 50, bottom: 80 },
    legend: { position: 'none' },
    hAxis: {
      title: 'Sömnlängd och kön',
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

// Diagram 2: Suicidtankar
drawGoogleChart({
  type: 'ColumnChart',
  data: chartDataSuicidal,
  options: {
    title: 'Suicidtankar per sömnkategori och kön (%)',
    height: 500,
    chartArea: { left: 50, right: 20, top: 50, bottom: 80 },
    legend: { position: 'none' },
    hAxis: {
      title: 'Sömnlängd och kön',
      slantedText: true,
      slantedTextAngle: 45
    },
    vAxis: {
      title: 'Suicidtankar (%)',
      minValue: 0,
      textStyle: { fontSize: 10 }
    },
    titleTextStyle: {
      fontSize: 14
    },
    tooltip: { isHtml: true }
  }
});


