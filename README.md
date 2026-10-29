# Vercia

Comunicação escolar em React + TypeScript. Gestores administram pessoas, categorias e convites e publicam notificações com ciência opcional. Usuários acessam por e-mail e senha, abrem mensagens e confirmam ciência quando solicitado.

## Executar

```sh
npm install
npm run dev
```

Abra o endereço exibido pelo Vite. A base inicia somente com o usuário Administrador, sem instituições, vínculos, categorias, convites ou notificações. Entre com `administrador@vercia.local` e senha inicial `Administrador123!`. Após o login, você pode criar a primeira instituição. Altere a senha em Minha conta depois de criar a instituição. Requer navegador moderno e localhost ou HTTPS para a Web Crypto API.

```sh
npm run build
npm test
```

## Fluxo de uso

1. Entre com a conta Administrador e crie sua instituição, quando desejar.
2. Crie categorias, se desejar, e gere convites pelo e-mail das pessoas.
3. Copie o link do convite e saia da conta gestora. Abra o link no **mesmo navegador e origem** para cadastrar o usuário ou entrar em uma conta existente. Não existe SMTP.
4. Entre novamente como gestor, associe categorias na tela Pessoas e publique uma notificação para todos ou para categorias selecionadas.
5. Entre como destinatário. A caixa mostra somente o título e o ícone de prioridade. Abra para registrar acesso e confirme ciência, se solicitado.
6. Consulte as aberturas e confirmações na tela Notificações do gestor.

Os destinatários ficam fixos na publicação. Uma pessoa em várias categorias recebe apenas uma entrega. Rascunhos podem ser editados e excluídos; publicações podem ser arquivadas. Categorias e vínculos podem ser desativados. O último gestor ativo não pode ser removido. Uma conta pode aceitar convites de mais de uma instituição, com seleção de instituição na barra lateral.

## Organização

- `src/domain`: modelos e vocabulário do negócio.
- `src/application`: autenticação, publicação, autorização e registros de leitura/ciência.
- `src/data`: persistência versionada no LocalStorage e sessão por aba no SessionStorage.
- `src/ui`: interface responsiva e componentes compartilhados.

Senhas são derivadas com PBKDF2/SHA-256, salt individual e 210 mil iterações. A troca de senha exige a senha atual; o gestor pode redefinir a senha de uma conta vinculada, com aviso de que a conta é compartilhada entre instituições.

## Limites desta versão

Este é um frontend local: dados, convites e permissões podem ser alterados por quem controla o navegador. Não oferece segurança de servidor e não deve armazenar dados pessoais reais em produção. Não há sincronização entre dispositivos ou navegadores, envio de e-mails, recuperação automática de senha nem notificações push. Limpar os dados do site apaga a base local. Senhas alteradas não revogam sessões já abertas em outras abas.

A interface usa fontes do Google Fonts com fallback local; os fluxos e dados funcionam sem serviços de backend. A credencial inicial do Administrador é pública e serve apenas para este protótipo local; o armazenamento contém somente seu hash, não a senha em texto puro.

## Validação no navegador

Com o servidor de desenvolvimento ativo em `http://localhost:5173`, execute:

```sh
npm run test:e2e
```

O teste usa Chromium em `/usr/bin/chromium`. Em outro ambiente, informe o caminho com `CHROMIUM_PATH=/caminho/para/chromium npm run test:e2e`. Ele utiliza um contexto isolado e descarta seus dados ao encerrar, sem preencher a base de uso da aplicação. Verifica configuração inicial, categorias, convite, cadastro, login, segmentação, abertura, confirmação, persistência, troca de senha e uso em celular. Capturas ficam em `work/`, ignorada pelo Git.

O GitHub Actions valida TypeScript, build, testes de regras e formatação a cada push e pull request.

## Reinício da base nesta atualização

A versão 2 do armazenamento substitui a base local anterior uma única vez: remove a chave `vercia.database.v1`, encerra a sessão antiga e cria `vercia.database.v2` contendo apenas o Administrador. Os dados criados a partir desta versão são preservados nas próximas aberturas. Os testes de navegador usam dados isolados e não adicionam exemplos à aplicação.
