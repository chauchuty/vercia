# PRD — Vercia

## Objetivo

O Vercia é uma aplicação de comunicados para instituições. Gestores publicam mensagens para pessoas ou grupos, acompanham aberturas e confirmações de ciência e respondem a conversas privadas iniciadas pelos destinatários. O nome reúne a ideia de **ver notificações e confirmar ciência**.

## Plataforma e perfis

- Aplicação web responsiva, mobile first e instalável como PWA.
- Frontend React e TypeScript; API Node.js; Firebase Authentication e Cloud Firestore; implantação no Render.
- **Admin:** gerencia contas de gestores e consulta relatórios administrativos.
- **Gestor:** administra suas instituições, categorias, pessoas, convites e comunicados; acompanha ciência e responde às conversas.
- **Usuário:** acessa as instituições às quais está vinculado, lê comunicados, confirma ciência quando solicitada e inicia conversas privadas por comunicado.
- Autorizações e isolamento por instituição devem ser validados no backend. O primeiro administrador deve ser criado por processo seguro, sem credencial pública.

## Referência visual obrigatória

A [última imagem aprovada](docs/design/referencia-dashboard.png) é a referência visual oficial do dashboard do usuário. A implementação deve reproduzir fielmente a composição, a identidade visual, os fundos em pixel art, os ícones, as cores de cada temática, a tipografia humanista, a logo integrada Vercia, os filtros, os cartões e o menu inferior apresentados na imagem. A tela deve ser tão próxima quanto possível da referência, preservando responsividade, legibilidade e funcionamento real dos controles em diferentes tamanhos de tela. Os nomes e conteúdos da imagem são exemplos, substituídos por dados reais.

A imagem mostra os temas claros de escola, quartel, padaria, empresa corporativa e genérico azul. Eles são referência para a criação dos temas adicionais abaixo, usando a mesma linguagem de pixel art e a mesma estrutura. A arte deve permanecer decorativa e não encobrir textos ou controles.

## Temas por instituição

O gestor escolhe o tema da instituição em suas configurações. A escolha altera conjuntamente fundo ilustrado, paleta, destaques, ícones e elementos interativos; a identidade Vercia e a organização da interface permanecem consistentes. Uma pessoa com vínculos em várias instituições vê o tema correspondente à instituição selecionada.

O MVP deve disponibilizar estes temas em modo claro e escuro:

| Tema | Direção visual inicial |
| --- | --- |
| Educação | Escola e livros; azul e amarelo |
| Organização militar | Quartel; verde e oliva |
| Comércio e serviços | Padaria e trigo; terracota e creme |
| Empresa e escritório | Prédios e maleta; azul-marinho e cinza |
| Órgão público | Edifício público; azul institucional |
| Clínica e hospital | Fachada de saúde; verde-água |
| Condomínio | Edifícios residenciais; azul-petróleo |
| Associação e ONG | Comunidade e colaboração; verde |
| Igreja e comunidade religiosa | Espaço de encontro; violeta suave |
| Clube e academia | Atividades e movimento; laranja |
| Genérico 1 | Envelope e paisagem; azul, conforme a referência |
| Genérico 2 | Comunicação e formas abstratas; paleta neutra distinta |

As direções dos temas adicionais são propostas de arte a desenvolver; a imagem aprovada é a referência detalhada para os cinco temas nela mostrados. A escolha do tema deve ser independente do nome ou dados da instituição. Novas instituições usam Genérico 1 até que o gestor escolha outro.

## Modo claro e escuro

- O usuário pode alternar entre claro e escuro; a preferência persiste entre visitas no mesmo navegador.
- Ambos os modos devem funcionar em todos os temas e telas, inclusive login, cadastro, Admin, Gestor, Usuário e diálogos.
- O modo claro segue a imagem aprovada. O modo escuro deve adaptar cada paleta e ilustração ao fundo escuro, mantendo sua identidade e contraste legível; deve haver estados de foco, seleção, erro e desabilitado reconhecíveis.
- A troca de instituição altera o tema institucional sem alterar a preferência claro/escuro do usuário.

## Requisitos funcionais

1. Entrar com e-mail e senha, sair, verificar e-mail e recuperar senha usando Firebase Authentication.
2. O Admin cadastra e administra gestores; cada gestor cria e configura suas instituições.
3. O Gestor gerencia categorias, vínculos e convites com validade e revogação. O usuário aceita convite para criar conta ou usar uma conta existente.
4. O Gestor cria rascunhos e publica comunicados para todos, categorias ou pessoas específicas, com prioridade e ciência opcional.
5. O Usuário consulta apenas comunicados destinados a ele, registra abertura e confirma ciência quando solicitada. O Gestor acompanha os resultados.
6. O Gestor pode editar publicações e consultar histórico; alterações de conteúdo, prioridade ou exigência de ciência reiniciam os registros da nova versão.
7. O destinatário inicia conversa privada por comunicado e o Gestor responde, com isolamento entre instituições e destinatários.
8. O dashboard apresenta a quantidade de ciências pendentes, filtros e navegação inferior como na referência, conectados a dados e ações reais.
9. A instalação PWA deve funcionar nos navegadores compatíveis. Sem conexão, mostrar estado informativo; publicação, conversa e confirmação dependem de conexão.
10. Registrar ações críticas de auditoria com autor, instituição, recurso, ação e horário do servidor, com retenção de dois anos e exclusão após o prazo. A retenção de comunicados e conversas ainda precisa ser definida.

## Critérios de aceite

- Em celular, o dashboard claro reproduz a referência aprovada para os cinco temas ilustrados; os outros sete seguem a mesma linguagem visual. Controles e conteúdos não apresentam rolagem horizontal nem sobreposição.
- O gestor escolhe cada um dos 12 temas; ele persiste e é aplicado aos usuários da instituição, inclusive após nova sessão e em outro dispositivo.
- A alternância claro/escuro persiste e funciona em todos os perfis e temas; textos e controles continuam legíveis.
- Um gestor publica em um dispositivo, um usuário autorizado lê e confirma em outro e o resultado aparece para o gestor. Acesso entre instituições é bloqueado.
- O sistema roda em Node.js no Render, usa Firebase Authentication e Firestore e fornece instruções de configuração e execução.

## Estado atual

O repositório contém um protótipo React com dados e autenticação locais e alternância claro/escuro. Ainda é necessário implementar a referência visual, os temas por instituição, o backend, Firebase, PWA e implantação; o modo escuro existente deve ser adaptado e validado para a nova identidade visual.
