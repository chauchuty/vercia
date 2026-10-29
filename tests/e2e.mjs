import { mkdirSync } from 'node:fs';
mkdirSync('work', { recursive: true });
import { chromium } from '@playwright/test';
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.setDefaultTimeout(7000);
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto('http://localhost:5173');
await page.getByLabel('Nome da instituição').fill('Colégio Horizonte');
await page.getByLabel('Seu nome').fill('Marina Oliveira');
await page.getByLabel('E-mail', { exact: true }).fill('gestora@horizonte.com');
await page.getByLabel('Senha', { exact: true }).fill('SenhaTeste123!');
await page.getByRole('button', { name: 'Criar minha instituição' }).click();
await page.getByRole('heading', { name: 'Olá, Marina' }).waitFor();
await page.getByRole('button', { name: 'Categorias', exact: true }).click();
await page.getByRole('button', { name: 'Nova categoria' }).click();
await page.getByLabel('Nome da categoria').fill('Professores');
await page.getByRole('button', { name: 'Salvar categoria' }).click();
await page.getByRole('button', { name: 'Convites', exact: true }).click();
await page.getByRole('button', { name: 'Convidar pessoa' }).click();
await page.getByLabel('E-mail', { exact: true }).fill('ana@horizonte.com');
await page.getByRole('button', { name: 'Gerar convite' }).click();
const token = await page.evaluate(
  () => JSON.parse(localStorage.getItem('vercia.database.v1')).invites[0].id,
);
await page.getByRole('button', { name: 'Sair', exact: true }).click();
await page.goto('http://localhost:5173/?invite=' + token);
await page.getByLabel('Seu nome').fill('Ana Souza');
await page.getByLabel('Senha', { exact: true }).fill('SenhaTeste123!');
await page.getByRole('button', { name: 'Aceitar convite' }).click();
await page.getByRole('heading', { name: 'Olá, Ana' }).waitFor();
await page.getByRole('button', { name: 'Sair', exact: true }).click();
await page.getByLabel('E-mail', { exact: true }).fill('GESTORA@HORIZONTE.COM');
await page.getByLabel('Senha', { exact: true }).fill('SenhaTeste123!');
await page.getByRole('button', { name: 'Entrar no Vercia' }).click();
await page.getByRole('button', { name: 'Pessoas', exact: true }).click();
await page
  .getByRole('row')
  .filter({ hasText: 'Ana Souza' })
  .getByRole('button', { name: 'Gerenciar' })
  .click();
await page.getByLabel('Professores', { exact: true }).check();
await page.getByRole('button', { name: 'Salvar alterações' }).click();
await page.getByRole('button', { name: 'Notificações', exact: true }).click();
await page.getByRole('button', { name: 'Nova notificação' }).click();
await page.getByLabel('Título', { exact: true }).fill('Reunião pedagógica de novembro');
await page
  .getByLabel('Mensagem', { exact: true })
  .fill(
    'Nossa reunião será na sexta-feira, às 14h. Confirme sua ciência para organizarmos o encontro.',
  );
await page.locator('select[name=priority]').selectOption('high');
await page.locator('select[name=audience]').selectOption('categories');
await page.getByLabel('Professores', { exact: true }).check();
await page.getByRole('checkbox', { name: 'Solicitar confirmação de ciência' }).check();
await page.getByRole('button', { name: 'Publicar notificação' }).click();
await page.getByRole('dialog').waitFor({ state: 'hidden' });
await page.getByRole('button', { name: 'Visão geral', exact: true }).click();
await page.screenshot({ path: 'work/dashboard.png', fullPage: true });
await page.getByRole('button', { name: 'Sair', exact: true }).click();
await page.getByLabel('E-mail', { exact: true }).fill('ana@horizonte.com');
await page.getByLabel('Senha', { exact: true }).fill('SenhaTeste123!');
await page.getByRole('button', { name: 'Entrar no Vercia' }).click();
await page
  .getByRole('button', { name: /Minha caixa/ })
  .first()
  .click();
await page.getByRole('button', { name: /Reunião pedagógica/ }).click();
await page.getByText('Abertura registrada em').waitFor();
await page.getByRole('button', { name: 'Li e estou ciente' }).click();
await page.getByText('Ciência confirmada em').waitFor();
await page.getByRole('button', { name: 'Fechar', exact: true }).click();
await page.reload();
await page.getByRole('button', { name: /Reunião pedagógica/ }).click();
await page.getByText('Ciência confirmada em').waitFor();
await page.getByRole('button', { name: 'Fechar', exact: true }).click();
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: 'work/mobile.png', fullPage: true });
const overflow = await page.evaluate(
  () => document.documentElement.scrollWidth > window.innerWidth,
);
if (overflow) throw Error('Overflow horizontal no celular');
await page.getByRole('button', { name: 'Minha conta', exact: true }).click();
await page.getByLabel('Senha atual').fill('SenhaTeste123!');
await page.getByLabel('Nova senha', { exact: true }).fill('NovaSenhaTeste456!');
await page.getByLabel('Repita a nova senha').fill('NovaSenhaTeste456!');
await page.getByRole('dialog').getByRole('button', { name: 'Alterar senha', exact: true }).click();
await page.getByRole('dialog').waitFor({ state: 'hidden' });
await page.getByRole('button', { name: 'Minha conta', exact: true }).click();
await page.getByRole('button', { name: 'Sair da conta' }).click();
await page.getByLabel('E-mail', { exact: true }).fill('ana@horizonte.com');
await page.getByLabel('Senha', { exact: true }).fill('NovaSenhaTeste456!');
await page.getByRole('button', { name: 'Entrar no Vercia' }).click();
await page.getByRole('heading', { name: 'Olá, Ana' }).waitFor();
if (errors.length) throw Error(errors.join('\n'));
console.log(
  'OK: configuração, categoria, convite, cadastro, login, vínculo, publicação segmentada, abertura, ciência, persistência, troca de senha e saída no celular.',
);
await browser.close();
