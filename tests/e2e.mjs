import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

mkdirSync('work', { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox'],
});
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('http://localhost:5173');
  const fixture = await page.evaluate(async () => {
    const { createUser } = await import('/src/application/auth.ts');
    const db = JSON.parse(localStorage.getItem('vercia.database.v2'));
    const member = await createUser('Ana Souza', 'ana@example.com', 'SenhaTeste123!');
    db.users.push(member);
    db.institutions.push({
      id: 'school',
      name: 'Colégio Horizonte',
      acronym: 'CHOR',
      color: '#1768c5',
      theme: 'education',
    });
    db.memberships.push({
      id: 'membership',
      userId: member.id,
      institutionId: 'school',
      role: 'member',
      active: true,
      categoryIds: [],
    });
    db.notices.push({
      id: 'notice',
      institutionId: 'school',
      authorId: 'manager',
      title: 'Reunião pedagógica',
      body: 'A reunião será na sexta-feira.',
      priority: 'high',
      requiresConfirmation: true,
      audience: 'all',
      categoryIds: [],
      status: 'published',
      createdAt: new Date().toISOString(),
      receipts: [{ userId: member.id }],
    });
    localStorage.setItem('vercia.database.v2', JSON.stringify(db));
    return { id: member.id };
  });
  await page.reload();
  await page.getByLabel('E-mail', { exact: true }).fill('ana@example.com');
  await page.getByLabel('Senha', { exact: true }).fill('SenhaTeste123!');
  await page.getByRole('button', { name: 'Entrar no Vercia' }).click();
  await page.getByRole('heading', { name: 'Mensagens' }).waitFor();
  await page.getByRole('button', { name: /Reunião pedagógica/ }).click();
  await page.getByText('Abertura registrada em').waitFor();
  await page.getByRole('button', { name: 'Li e estou ciente' }).click();
  await page.getByText('Ciência confirmada em').waitFor();
  await page.getByRole('button', { name: 'Fechar', exact: true }).click();
  await page.reload();
  const receipt = await page.evaluate(
    ({ id }) =>
      JSON.parse(localStorage.getItem('vercia.database.v2')).notices[0].receipts.find(
        (item) => item.userId === id,
      ),
    fixture,
  );
  if (!receipt?.openedAt || !receipt?.confirmedAt)
    throw Error('Abertura e ciência não foram persistidas.');
  if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth))
    throw Error('Overflow horizontal no celular');
  await page.getByRole('button', { name: 'Ativar modo escuro' }).click();
  await page.reload();
  if ((await page.evaluate(() => document.documentElement.dataset.theme)) !== 'dark')
    throw Error('Tema escuro não persistiu.');
  await page.screenshot({ path: 'work/mobile.png', fullPage: true });
  if (errors.length) throw Error(errors.join('\n'));
  console.log('OK: login, abertura, ciência, persistência, modo escuro e layout móvel.');
} finally {
  await browser.close();
}
