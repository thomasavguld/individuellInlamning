let totalData = await dbQuery(`

  SELECT * 
  FROM studentSurvey
  LIMIT 5
  
  `)

tableFromData({ data: totalData })


