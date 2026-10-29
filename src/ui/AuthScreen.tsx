import type { FormEvent, ReactNode } from 'react';
import { ArrowUpRight, Bell, ShieldCheck } from 'lucide-react';
import type { Database, Invite, User } from '../domain/models';
import { validInvite } from '../application/service';
interface Props {
  data: Database;
  user: User | undefined;
  invite: Invite | undefined;
  inviteToken: string;
  errorBox: ReactNode;
  busy: boolean;
  onAccept: (e: FormEvent<HTMLFormElement>) => void;
  onSetup: (e: FormEvent<HTMLFormElement>) => void;
  onLogin: (e: FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
}
export default function AuthScreen({
  data,
  user,
  invite,
  inviteToken,
  errorBox,
  busy,
  onAccept,
  onSetup,
  onLogin,
  onBack,
}: Props) {
  return (
    <div className="auth-shell">
      <aside className="auth-story">
        <div className="brand">
          <span className="brand-icon">
            <Bell size={23} />
          </span>
          vercia<span className="brand-dot">.</span>
        </div>
        <div>
          <span className="eyebrow">CONEXÕES QUE IMPORTAM</span>
          <h1>
            A informação certa.
            <br />
            Para as pessoas certas.
          </h1>
          <p>Uma comunicação escolar mais próxima, organizada e transparente.</p>
          <div className="story-card">
            <ShieldCheck size={25} />
            <div>
              <strong>Comunicar é cuidar.</strong>
              <p>Cada aviso recebido. Cada confirmação acompanhada.</p>
            </div>
          </div>
        </div>
        <small>Feito para a sua comunidade escolar.</small>
      </aside>
      <main className="auth-main">
        <div className="auth-form">
          <span className="eyebrow">COMUNICAÇÃO ESCOLAR</span>
          <h1>
            {inviteToken
              ? 'Você foi convidado'
              : !data.users.length
                ? 'Sua escola começa aqui'
                : 'Bom ter você de volta'}
          </h1>
          <p className="muted">
            {inviteToken
              ? `Acesse ${data.institutions.find((i) => i.id === invite?.institutionId)?.name || 'a instituição'} com segurança.`
              : !data.users.length
                ? 'Configure a instituição e sua conta de gestor.'
                : 'Entre para acompanhar o que importa.'}
          </p>
          {errorBox}
          {inviteToken && (!invite || !validInvite(invite)) && (
            <p className="error" role="alert">
              Este convite é inválido, expirou, foi revogado ou já foi utilizado. Solicite um novo
              link ao gestor. Em outro navegador, os convites locais não estarão disponíveis.
            </p>
          )}
          {inviteToken ? (
            <form onSubmit={onAccept}>
              <label>
                E-mail convidado
                <input value={invite?.email || ''} disabled />
              </label>
              {!user && (
                <>
                  {!data.users.some((u) => u.email === invite?.email) && (
                    <label>
                      Seu nome
                      <input name="name" required autoComplete="name" />
                    </label>
                  )}
                  <label>
                    Senha
                    <input
                      name="password"
                      type="password"
                      required
                      minLength={8}
                      autoComplete="current-password"
                    />
                  </label>
                </>
              )}
              <button className="primary" disabled={busy || !invite || !validInvite(invite)}>
                {busy ? 'Aguarde…' : 'Aceitar convite'}
                <ArrowUpRight size={17} />
              </button>
              <button type="button" className="text-button" onClick={onBack}>
                Voltar ao acesso
              </button>
            </form>
          ) : !data.users.length ? (
            <form onSubmit={onSetup}>
              <label>
                Nome da instituição
                <input name="institution" required placeholder="Colégio Horizonte" />
              </label>
              <label>
                Seu nome
                <input name="name" required autoComplete="name" />
              </label>
              <label>
                E-mail
                <input name="email" type="email" required autoComplete="email" />
              </label>
              <label>
                Senha
                <input
                  name="password"
                  type="password"
                  minLength={8}
                  required
                  placeholder="Pelo menos 8 caracteres"
                  autoComplete="new-password"
                />
              </label>
              <button className="primary" disabled={busy}>
                {busy ? 'Configurando…' : 'Criar minha instituição'}
                <ArrowUpRight size={17} />
              </button>
            </form>
          ) : (
            <form onSubmit={onLogin}>
              <label>
                E-mail
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="voce@colegio.com.br"
                />
              </label>
              <label>
                Senha
                <input
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="Sua senha"
                />
              </label>
              <button className="primary" disabled={busy}>
                {busy ? 'Entrando…' : 'Entrar no Vercia'}
                <ArrowUpRight size={17} />
              </button>
              <p className="help">
                Primeiro acesso? Utilize o link de convite enviado pela sua instituição. Sem acesso
                à senha? Procure um gestor.
              </p>
            </form>
          )}
          <div className="local-note">
            <span />
            Versão local · dados salvos neste navegador
          </div>
        </div>
      </main>
    </div>
  );
}
