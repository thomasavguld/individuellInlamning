addMdToPage(`
  ## Sömn
  Datan visar ett tydligt samband mellan respondenternas sömnvanor och deras psykiska hälsa.

  De studenter som sover minst tycks må sämst, medan de studenter som sover mer än åtta timmar per natt verkar må bäst.

  OBS! Detta är ett diagram som kombinerar variabler både i procent och absoluta tal, varför staplarnas längd kan ge intryck av att variansen är större än vad den är. 
  <br>
  ____
`);


let rawStats = await dbQuery(`
  SELECT sleepDuration, gender, COUNT(*) as count,
         AVG(depression) as avgDepression,
         AVG(suicidalThoughts) as avgSuicidal
  FROM studentSurvey
  WHERE sleepDuration IN ('<4', '5-6', '7-8', '>8')
  GROUP BY sleepDuration, gender
`);

let categories = ['<4', '5-6', '7-8', '>8'];
let genderMap = { 'Male': 'Män', 'Female': 'Kvinnor' };


let dataByCategory = {};
categories.forEach(cat => {
  dataByCategory[cat] = {
    Kvinnor: { depression: 0, combined: 0, count: 0 },
    Män: { depression: 0, combined: 0, count: 0 },
    Totalt: { depression: 0, combined: 0, count: 0 }
  };
});


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
    title: 'Sömn i relation till depression/suicidtankar',
    height: 550,
    chartArea: { left: 70, top: 60, bottom: 80 },
    legend: { position: 'right' },
    seriesType: 'bars',
    series: {
      0: { color: '#c2185b' },
      1: { color: '#e57373' },
      2: { color: '#1565c0' },
      3: { color: '#64b5f6' },
      4: { color: '#fbc02d' },
      5: { color: '#ffd54f' },
      6: { type: 'line', targetAxisIndex: 1, color: '#4caf50', lineWidth: 3, pointSize: 5 }
    },
    vAxes: {
      0: { title: 'Procent depression/sucicidtankar' },
      1: { title: 'Antal studenter' }
    },
    hAxis: {
      title: 'Timmar sömn',
      slantedText: false
    }
  }
});

