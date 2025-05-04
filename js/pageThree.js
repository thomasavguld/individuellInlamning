addMdToPage(`
  <br>
  ### Sömn och psykisk hälsa per sömnkategori
  Depression och suicidtankar i procent, per kön och totalt. Linje visar antal studenter i varje kategori.
  <br>
`);

// Hämta data
let rawStats = await dbQuery(`
  SELECT sleepDuration, gender, COUNT(*) as count,
         AVG(depression) as avgDepression,
         AVG(suicidalThoughts) as avgSuicidal
  FROM studentSurvey
  WHERE sleepDuration IN ('<4', '5-6', '7-8', '>8')
  GROUP BY sleepDuration, gender
`);

let categories = ['<4', '5-6', '7-8', '>8'];  // Exclude 'Others' category
let genderMap = { 'Male': 'Män', 'Female': 'Kvinnor' };

// Initiera struktur
let dataByCategory = {};
categories.forEach(cat => {
  dataByCategory[cat] = {
    Kvinnor: { depression: 0, combined: 0, count: 0 },
    Män: { depression: 0, combined: 0, count: 0 },
    Totalt: { depression: 0, combined: 0, count: 0 }
  };
});

// Fyll på könsuppdelad data
for (let row of rawStats) {
  let cat = row.sleepDuration;
  let gender = genderMap[row.gender] || null;
  if (!gender) continue;

  const depression = row.avgDepression * 100;
  const combined = ((row.avgDepression + row.avgSuicidal) / 2) * 100;

  dataByCategory[cat][gender] = {
    depression,
    combined,
    count: row.count
  };
}

// Räkna ut totals
for (let cat of categories) {
  let f = dataByCategory[cat]['Kvinnor'];
  let m = dataByCategory[cat]['Män'];
  let totalCount = f.count + m.count;

  if (totalCount > 0) {
    const depTotal = (f.depression * f.count + m.depression * m.count) / totalCount;
    const combTotal = (f.combined * f.count + m.combined * m.count) / totalCount;

    dataByCategory[cat]['Totalt'] = {
      depression: depTotal,
      combined: combTotal,
      count: totalCount
    };
  }
}

// Skapa diagramdata
let comboChartData = [
  ['Sömnlängd',
    'Depression - Kvinnor', 'Depression+Suicid - Kvinnor',
    'Depression - Män', 'Depression+Suicid - Män',
    'Depression - Totalt', 'Depression+Suicid - Totalt',
    'Antal studenter'
  ]
];

for (let cat of categories) {
  let row = dataByCategory[cat];
  comboChartData.push([
    cat,
    row.Kvinnor.depression,
    row.Kvinnor.combined,
    row.Män.depression,
    row.Män.combined,
    row.Totalt.depression,
    row.Totalt.combined,
    row.Totalt.count
  ]);
}

// Rita kombodiagram
drawGoogleChart({
  type: 'ComboChart',
  data: comboChartData,
  options: {
    title: 'Depression och suicidtankar per sömnkategori',
    height: 550,
    chartArea: { left: 70, top: 60, bottom: 80 },
    legend: { position: 'right' },
    seriesType: 'bars',
    series: {
      0: { color: '#c2185b' },   // Kvinnor - Depression
      1: { color: '#e57373' },   // Kvinnor - Combined
      2: { color: '#1565c0' },   // Män - Depression
      3: { color: '#64b5f6' },   // Män - Combined
      4: { color: '#fbc02d' },   // Totalt - Depression
      5: { color: '#ffd54f' },   // Totalt - Combined
      6: { type: 'line', targetAxisIndex: 1, color: '#4caf50', lineWidth: 3, pointSize: 5 }  // Antal studenter
    },
    vAxes: {
      0: { title: 'Procent (%)' },
      1: { title: 'Antal studenter' }
    },
    hAxis: {
      title: 'Sömnlängdskategori',
      slantedText: false
    }
  }
});

