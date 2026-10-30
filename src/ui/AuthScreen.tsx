import ThemeToggle from './ThemeToggle';
import PasswordInput from './PasswordInput';
import type { FormEvent, ReactNode } from 'react';
import { ArrowUpRight, Bell } from 'lucide-react';
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
  onLogin,
  onBack,
}: Props) {
  return (
    <div className="auth-shell">
      <header className="standalone-topbar">
        <ThemeToggle />
      </header>
      <main className="auth-main">
        <div className="auth-form">
          <div className="brand auth-brand">
            <span className="brand-icon">
              <Bell size={20} />
            </span>
            vercia<span className="brand-dot">.</span>
          </div>

          <h1>{inviteToken ? 'Você foi convidado' : 'Entrar'}</h1>
          <p className="muted">
            {inviteToken
              ? `Acesse ${data.institutions.find((i) => i.id === invite?.institutionId)?.name || 'a instituição'} com segurança.`
              : 'Acesse suas notificações e sua instituição.'}
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
                    <PasswordInput
                      name="password"

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
              <button type="button" className="text-button navigation-button" onClick={onBack}>
                Voltar ao acesso
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
                <PasswordInput
                  name="password"

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
