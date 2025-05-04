addMdToPage(`
## Källor
Exempeldata från datasetet (fem rader av 27 867):

____
`);

let totalData = await dbQuery(`

  SELECT * 
  FROM studentSurvey
  LIMIT 5
  
  `)

tableFromData({ data: totalData })


