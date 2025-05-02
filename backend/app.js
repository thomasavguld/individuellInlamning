import express from 'express';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import sstatparts from './sstatparts.js';

// Port to start the web server on
const port = 3005;

// Create a web server
const app = express();

// Path to this folder
const dirname = import.meta.dirname;

// respond when people are trying to libs by import
// (now they are all bundled - so they should stop, but we're kind)
let libNames = [
  'addDropdown', 'addMdToPage', 'addToPage',
  'createMenu', 'csvLoad', 'dbQuery',
  'drawGoogleChart', 'jload', 'makeChartFriendly',
  'reloadPageScript', 'simple-statistics', 's',
  'stdLib', 'tableFromData', 'jerzy'
];
app.use((req, res, next) => {
  for (let name of libNames) {
    if (req.url.startsWith('/js/libs/' + name + '.js')) {
      res.type('application/javascript');
      let content = 'export default globalThis.' + name + ';';
      if (name === 'simple-statistics') {
        content = 'let s = globalThis.s;\n';
        content += sstatparts.map(x => `export const ${x} = s.${x};`).join('\n');
      }
      content += "\nconsole.warn('Stop importing libs!');";
      res.send(content);
    }
  }
  next();
});

// Serve the README-file using the showDocs mini-site
app.get('/docs/README.md', (_req, res) => res.sendFile(path.join(dirname, '..', 'README.md')));
app.use('/docs', express.static(path.join(dirname, 'showDocs')));

// Wrap js in async function
app.use((req, res, next) => {
  if (req.url.endsWith('?wrap')) {
    let file = req.url.slice(1).split('?')[0].split('/');
    file = path.join(dirname, '..', ...file);
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf-8').split('\n');
      let imports = [];
      while (content[0].trim().startsWith('import')) {
        imports.push(content.shift());
      }
      imports.length && imports.push('\n');
      content = imports.join('\n') + `export default async () => { ${content.join('\n')} }`;
      res.type('application/javascript');
      res.send(content);
      return;
    }
  }
  next();
});

// Serve the files in the main folder
app.use(express.static(path.join(dirname, '..')));

// Start the web server
app.listen(port, () => console.log(`Listening on http://localhost:${port}`));

// Routes for live reload
app.get('/api/is-real-backend', (_req, res) => res.send(true));
app.get('/api/reload-if-closes', (_req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-control': 'no-cache'
  });
  setInterval(() => res.write('data: ping\n\n'), 20000);
});

// app get script to start with
// check for scripts in this order
// js/_menu.js, js/main.js, main.js
app.get('/api/getMainScript', (_req, res) => {
  let mainFolder = path.join(dirname, '..');
  let whichScriptsExists = [
    { name: '/js/_menu.js', exists: fs.existsSync(path.join(mainFolder, 'js', '_menu.js')) },
    { name: '/js/main.js', exists: fs.existsSync(path.join(mainFolder, 'js', 'main.js')) },
    { name: '/main.js', exists: fs.existsSync(path.join(mainFolder, 'main.js')) }
  ];
  res.set({ 'Content-Type': 'application/javascript' });
  res.send(
    `let whichScriptsExists = ${JSON.stringify(whichScriptsExists, '', '  ')};\n\n` +
    `let scriptToLoad = whichScriptsExists.find(x => x.exists);\n` +
    `scriptToLoad.name.includes('menu') && document.body.classList.add('with-menu');\n` +
    `scriptToLoad && import(scriptToLoad.name);`
  );
});

// Only if dbFolder exists
let dbFolder = path.join(dirname, '..', 'sqlite-databases');
if (fs.existsSync(dbFolder)) {

  // Read settings for which SQLite-database to use
  let databaseToUse = fs.readFileSync(path.join(dbFolder, 'database-in-use.json'), 'utf-8').slice(1, -1);
  databaseToUse = path.join(path.join(dbFolder, databaseToUse));
  // database connection
  let db;
  if (fs.existsSync(databaseToUse)) {
    db = new Database(databaseToUse);
  }

  // route for database query (SELECT:s only)
  app.get('/api/dbquery/:select', (req, res) => {
    let select = req.params.select.trim();
    if (!db) {
      res.json([{ error: 'No database connected!' }]);
      return;
    }
    if ((select + '').toLowerCase().indexOf('select ') !== 0) {
      res.json([{ error: 'Only SELECT queries can be run!' }]);
      return;
    }
    let result;
    try {
      result = db.prepare(select).all();
    }
    catch (e) {
      result = [{ error: e + '' }];
    }
    res.json(result);
  });
}

