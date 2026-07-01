import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourceFiles = [
  'client/src/components/DashboardLayout.tsx',
  'client/src/components/DashboardLayoutSkeleton.tsx',
  'client/src/components/AIChatBox.tsx',
  'client/src/components/DoutoreloAuthDialog.tsx',
  ...fs.readdirSync(path.join(root, 'client/src/pages'))
    .filter((file) => file.endsWith('.tsx'))
    .map((file) => `client/src/pages/${file}`),
];

const oldIdentityPattern = /emerald|teal-|green-|#f6fbf8|#eefaf6|#f8fffc|#3BC7A2|#28d7a3|rgba\(59, ?199, ?162|rgba\(16,185,129|rgba\(19,181,166/i;
const oldRedPattern = /#[Ff][Ff]2432|#d91f2b|#b4232d/;

describe('DOUTORELO system visual identity — MIV aligned', () => {
  it('keeps application screens free from the old green/mint identity tokens', () => {
    const offenders = sourceFiles
      .map((relativePath) => ({ relativePath, source: fs.readFileSync(path.join(root, relativePath), 'utf8') }))
      .filter(({ source }) => oldIdentityPattern.test(source))
      .map(({ relativePath }) => relativePath);

    expect(offenders).toEqual([]);
  });

  it('keeps application screens free from the old red #FF2432 identity', () => {
    const offenders = sourceFiles
      .map((relativePath) => ({ relativePath, source: fs.readFileSync(path.join(root, relativePath), 'utf8') }))
      .filter(({ source }) => oldRedPattern.test(source))
      .map(({ relativePath }) => relativePath);

    expect(offenders).toEqual([]);
  });

  it('uses MIV official tokens: navy #0F1B33, pulso verde #6EC1B4, mist #E7ECF2', () => {
    const css = fs.readFileSync(path.join(root, 'client/src/index.css'), 'utf8');

    expect(css).toContain('--miv-navy: #0F1B33;');
    expect(css).toContain('--miv-pulso: #6EC1B4;');
    expect(css).toContain('--miv-mist: #E7ECF2;');
    expect(css).toContain('--primary: #0F1B33;');
    expect(css).toContain('--foreground: #0F1B33;');
    expect(css).toContain('--ring: #6EC1B4;');
  });

  it('uses a white authenticated shell with MIV navy/pulso brand tokens', () => {
    const layout = fs.readFileSync(path.join(root, 'client/src/components/DashboardLayout.tsx'), 'utf8');

    expect(layout).toContain('app-shell-content min-w-0 flex-1 overflow-x-hidden bg-white');
    expect(layout).not.toContain('bg-[#f6fbf8]');
    expect(layout).not.toContain('border-emerald');
    expect(layout).not.toContain('#FF2432');
  });

  it('loads Lexend and Poppins fonts from Google Fonts', () => {
    const html = fs.readFileSync(path.join(root, 'client/index.html'), 'utf8');

    expect(html).toContain('Lexend');
    expect(html).toContain('Poppins');
  });

  it('uses HUB de saúde positioning in OG metadata and approved title in page title', () => {
    const html = fs.readFileSync(path.join(root, 'client/index.html'), 'utf8');

    expect(html).toContain('HUB de saúde inteligente');
    expect(html).toContain('DOUTORELO | IA para cuidar da sua saúde, do seu jeito.');
  });
});
