const fs = require('fs');
const content = fs.readFileSync('/Users/jauge/Development/KnowDrive/src/components/Session/Session.jsx', 'utf8');

let openDivs = 0;
let closeDivs = 0;
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  let opens = (line.match(/<div/g) || []).length;
  let closes = (line.match(/<\/div>/g) || []).length;
  openDivs += opens;
  closeDivs += closes;
  if (opens > 0 || closes > 0) {
    // console.log(`${i + 1}: ${opens} opens, ${closes} closes (Total: ${openDivs - closeDivs})`);
  }
}

console.log(`Total Open Divs: ${openDivs}`);
console.log(`Total Close Divs: ${closeDivs}`);
console.log(`Difference: ${openDivs - closeDivs}`);
