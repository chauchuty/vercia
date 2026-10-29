import type { FormEvent, ReactNode } from 'react';
import { Building2, LogOut } from 'lucide-react';
import type { User } from '../domain/models';
interface Props {
  user: User;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onLogout: () => void;
  errorBox: ReactNode;
  busy: boolean;
}
export default function InstitutionSetup({ user, onSubmit, onLogout, errorBox, busy }: Props) {
  return (
    <main className="auth-main" style={{ minHeight: '100vh' }}>
      <section className="auth-form">
        <span className="eyebrow">VERCIA · ADMINISTRAÇÃO</span>
        <h1>Olá, {user.name}</h1>
        <p className="muted">
          A base está vazia. Nenhuma instituição, categoria, pessoa convidada ou notificação foi
          criada.
        </p>
        {errorBox}
        <form onSubmit={onSubmit}>
          <label>
            Nome da instituição
            <input
              name="institution"
              required
              maxLength={120}
              placeholder="Informe o nome da sua instituição"
            />
          </label>
          <button className="primary" disabled={busy}>
            <Building2 size={17} />
            Criar instituição
          </button>
        </form>
        <p className="help" style={{ marginTop: 20 }}>
          A instituição será criada apenas quando você enviar este formulário. Depois, altere a
          senha inicial em Minha conta.
        </p>
        <button className="text-button" onClick={onLogout}>
          <LogOut size={16} />
          Sair
        </button>
      </section>
    </main>
  );
}
