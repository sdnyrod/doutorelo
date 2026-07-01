import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const targets = [
  'client/src/pages',
  'client/src/components/DashboardLayout.tsx',
  'client/src/components/DashboardLayoutSkeleton.tsx',
  'client/src/components/AIChatBox.tsx',
  'client/src/components/DoutoreloAuthDialog.tsx',
];

function walk(entry) {
  const absolute = path.join(root, entry);
  if (!fs.existsSync(absolute)) return [];
  const stat = fs.statSync(absolute);
  if (stat.isFile()) return absolute.endsWith('.tsx') || absolute.endsWith('.ts') ? [absolute] : [];
  return fs.readdirSync(absolute).flatMap((name) => walk(path.join(entry, name)));
}

const files = targets.flatMap(walk);

const replacements = [
  [/bg-\[radial-gradient\([^\]]*(?:19,181,166|16,185,129|59,199,162|#f8fffc|#f6fffb|#eefaf6|#edf8f4)[^\]]*\]/g, 'bg-white'],
  [/bg-\[linear-gradient\([^\]]*(?:19,181,166|16,185,129|59,199,162|#f8fffc|#f6fffb|#eefaf6|#edf8f4)[^\]]*\]/g, 'bg-white'],
  [/bg-\[#f6fbf8\]/g, 'bg-white'],
  [/bg-\[#eefaf6\]/g, 'bg-white'],
  [/bg-\[#f8fffc\]/g, 'bg-white'],
  [/bg-\[#edf8f4\]/g, 'bg-white'],
  [/bg-\[#e9fff8\]/g, 'bg-white'],
  [/from-emerald-[^\s"'`]+/g, 'from-white'],
  [/via-emerald-[^\s"'`]+/g, 'via-white'],
  [/to-emerald-[^\s"'`]+/g, 'to-[#F7F8FA]'],
  [/from-teal-[^\s"'`]+/g, 'from-white'],
  [/via-teal-[^\s"'`]+/g, 'via-white'],
  [/to-teal-[^\s"'`]+/g, 'to-[#F7F8FA]'],
  [/from-green-[^\s"'`]+/g, 'from-white'],
  [/via-green-[^\s"'`]+/g, 'via-white'],
  [/to-green-[^\s"'`]+/g, 'to-[#F7F8FA]'],
  [/bg-emerald-(50|100|200|300)(\/[0-9]+)?/g, 'bg-white'],
  [/bg-teal-(50|100|200|300)(\/[0-9]+)?/g, 'bg-white'],
  [/bg-green-(50|100|200|300)(\/[0-9]+)?/g, 'bg-white'],
  [/bg-emerald-(400|500|600|700)(\/[0-9]+)?/g, 'bg-[#FF2432]'],
  [/bg-teal-(400|500|600|700)(\/[0-9]+)?/g, 'bg-[#FF2432]'],
  [/bg-green-(400|500|600|700)(\/[0-9]+)?/g, 'bg-[#FF2432]'],
  [/bg-emerald-(800|900|950)(\/[0-9]+)?/g, 'bg-[#0D1B2D]'],
  [/bg-teal-(800|900|950)(\/[0-9]+)?/g, 'bg-[#0D1B2D]'],
  [/bg-green-(800|900|950)(\/[0-9]+)?/g, 'bg-[#0D1B2D]'],
  [/hover:bg-emerald-(50|100|200|300)(\/[0-9]+)?/g, 'hover:bg-[#FFF7F8]'],
  [/hover:bg-teal-(50|100|200|300)(\/[0-9]+)?/g, 'hover:bg-[#FFF7F8]'],
  [/hover:bg-green-(50|100|200|300)(\/[0-9]+)?/g, 'hover:bg-[#FFF7F8]'],
  [/hover:bg-emerald-(400|500|600|700|800|900|950)(\/[0-9]+)?/g, 'hover:bg-[#D91F2B]'],
  [/hover:bg-teal-(400|500|600|700|800|900|950)(\/[0-9]+)?/g, 'hover:bg-[#D91F2B]'],
  [/hover:bg-green-(400|500|600|700|800|900|950)(\/[0-9]+)?/g, 'hover:bg-[#D91F2B]'],
  [/text-emerald-(50|100|200|300|400|500|600|700|800|900|950)(\/[0-9]+)?/g, 'text-[#0D1B2D]'],
  [/text-teal-(50|100|200|300|400|500|600|700|800|900|950)(\/[0-9]+)?/g, 'text-[#0D1B2D]'],
  [/text-green-(50|100|200|300|400|500|600|700|800|900|950)(\/[0-9]+)?/g, 'text-[#0D1B2D]'],
  [/border-emerald-(50|100|200|300|400|500|600|700|800|900|950)(\/[0-9]+)?/g, 'border-[#FF2432]/20'],
  [/border-teal-(50|100|200|300|400|500|600|700|800|900|950)(\/[0-9]+)?/g, 'border-[#FF2432]/20'],
  [/border-green-(50|100|200|300|400|500|600|700|800|900|950)(\/[0-9]+)?/g, 'border-[#FF2432]/20'],
  [/ring-emerald-(50|100|200|300|400|500|600|700|800|900|950)(\/[0-9]+)?/g, 'ring-[#FF2432]/25'],
  [/ring-teal-(50|100|200|300|400|500|600|700|800|900|950)(\/[0-9]+)?/g, 'ring-[#FF2432]/25'],
  [/ring-green-(50|100|200|300|400|500|600|700|800|900|950)(\/[0-9]+)?/g, 'ring-[#FF2432]/25'],
  [/focus-visible:ring-emerald-(50|100|200|300|400|500|600|700|800|900|950)(\/[0-9]+)?/g, 'focus-visible:ring-[#FF2432]'],
  [/focus-visible:ring-teal-(50|100|200|300|400|500|600|700|800|900|950)(\/[0-9]+)?/g, 'focus-visible:ring-[#FF2432]'],
  [/focus-visible:ring-green-(50|100|200|300|400|500|600|700|800|900|950)(\/[0-9]+)?/g, 'focus-visible:ring-[#FF2432]'],
  [/shadow-emerald-[^\s"'`]+/g, 'shadow-[0_18px_64px_rgba(13,27,45,0.08)]'],
  [/shadow-teal-[^\s"'`]+/g, 'shadow-[0_18px_64px_rgba(13,27,45,0.08)]'],
  [/shadow-green-[^\s"'`]+/g, 'shadow-[0_18px_64px_rgba(13,27,45,0.08)]'],
  [/#28d7a3/g, '#FF2432'],
  [/#13b5a6/g, '#FF2432'],
  [/#3BC7A2/g, '#FF2432'],
  [/#d9f4eb/g, '#E5E7EB'],
  [/#f8fffc/g, '#ffffff'],
  [/rgba\(19,181,166,0\.[0-9]+\)/g, 'rgba(255,36,50,0.12)'],
  [/rgba\(16,185,129,0\.[0-9]+\)/g, 'rgba(255,36,50,0.12)'],
  [/rgba\(59,199,162,0\.[0-9]+\)/g, 'rgba(255,36,50,0.12)'],
  [/rgba\(59, 199, 162, 0\.[0-9]+\)/g, 'rgba(255, 36, 50, 0.12)'],
];

let changed = 0;
for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  let next = original;
  for (const [pattern, replacement] of replacements) {
    next = next.replace(pattern, replacement);
  }
  if (next !== original) {
    fs.writeFileSync(file, next);
    changed += 1;
    console.log(`updated ${path.relative(root, file)}`);
  }
}

console.log(`visual identity pass complete: ${changed} files updated`);
