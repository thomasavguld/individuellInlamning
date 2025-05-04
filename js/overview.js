addMdToPage(`
## Studie om psykisk hälsa bland studenter i Indien.
Studenter i Indien har svarat på frågor om psykisk hälsa och depression relaterat till kön, ålder, sömnvanor, akademisk inriktning med mera.

I den här rapporten har jag valt att titta närmare på kön, studierelaterad stress och sömnvanor för att se om det finns några korrelationer och eventuellt vilka slutsatser man skulle kunna dra från dessa.

____
`);

let respondentData = await dbQuery(`
SELECT 
    'Män och kvinnor' AS Kön,
    'Samtliga' AS Kategori,
    COUNT(*) AS "Totalt antal",
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM studentSurvey), 1) AS "Andel (%)"
FROM studentSurvey

UNION ALL

SELECT 
    CASE 
        WHEN gender = 'Male' THEN 'Män'
        WHEN gender = 'Female' THEN 'Kvinnor'
        ELSE gender 
    END AS Kön,
    'Samtliga respondenter' AS Kategori,
    COUNT(*) AS "Totalt antal",
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM studentSurvey), 1) AS "Andel (%)"
FROM studentSurvey
GROUP BY gender

UNION ALL

SELECT 
    CASE 
        WHEN gender = 'Male' THEN 'Män'
        WHEN gender = 'Female' THEN 'Kvinnor'
        ELSE gender 
    END AS Kön,
    'Respondenter med depression' AS Kategori,
    COUNT(*) AS "Totalt antal",
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM studentSurvey), 1) AS "Andel (%)"
FROM studentSurvey
WHERE depression = 1
GROUP BY gender;

  `)

tableFromData({ data: respondentData })

console.log('respondentData', respondentData)

addMdToPage(`

  <BR>
  
  `)

let totalData = await dbQuery(`

  SELECT * 
  FROM studentSurvey
  LIMIT 5
  
  `)

tableFromData({ data: totalData })