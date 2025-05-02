
const dataPromise = await dbQuery(`
  SELECT * FROM studentSurvey
  LIMIT 5
`);

//Number of respondents

const totalRespondentsPromise = dbQuery(`
  SELECT COUNT(*) AS 'count'
  FROM studentSurvey
`);

//Total number of people with depression

const totalDepressionPromise = dbQuery(`
  SELECT depression, COUNT(*) 
  AS 'count'
  FROM studentSurvey
  WHERE depression = 1
`);

//Number of men with depression

const totalDepressionMenPromise = dbQuery(`
  SELECT depression, gender, COUNT(*) 
  AS 'count'
  FROM studentSurvey
  WHERE depression = 1 AND gender = 'Male'
`);


//Number of women with depression

const totalDepressionWomenPromise = dbQuery(`
  SELECT depression, gender, COUNT(*) 
  AS 'count'
  FROM studentSurvey
  WHERE depression = 1 AND gender = 'Female'
`);

const totalDepressionPercentPromise = dbQuery(`SELECT
  ROUND(
    (SUM(CASE WHEN depression = 1 THEN 1 ELSE 0 END) * 100.0) / COUNT(*),
    2
  ) AS depressionPercentage
FROM studentSurvey;`)

const totalDepressionGenderPercentPromise = dbQuery(`SELECT
gender,
  ROUND(
    (SUM(CASE WHEN depression = 1 THEN 1 ELSE 0 END) * 100.0) / COUNT(*),
    2
  ) AS depressionPercentage
FROM studentSurvey
GROUP BY gender;`)



export const data = await dataPromise;
export const totalRespondents = await totalRespondentsPromise;
export const totalDepression = await totalDepressionPromise;
export const totalDepressionMen = await totalDepressionMenPromise;
export const totalDepressionWomen = await totalDepressionWomenPromise;
export const totalDepressionPercent = await totalDepressionPercentPromise;
export const totalDepressionGenderPercent = await totalDepressionGenderPercentPromise;



/*

export let optionsForLineChart = {
  height: 500,
  width: 1250,
  chartArea: { left: 50 },
  curveType: 'function',
  pointSize: 5,
  pointShape: 'circle',
  vAxis: { format: '# °C' }
} 
*/