import { useState, type FormEvent, type ReactNode } from 'react';
import { DEFAULT_INSTITUTION_COLOR, institutionTextColor } from '../domain/institution';
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
  const [acronym, setAcronym] = useState('');
  const [color, setColor] = useState(DEFAULT_INSTITUTION_COLOR);
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
          <div className="form-grid">
            <label>
              Sigla da instituição
              <input
                name="acronym"
                required
                minLength={4}
                maxLength={4}
                pattern="[A-Za-z0-9]{4}"
                value={acronym}
                onChange={(e) => setAcronym(e.target.value.toUpperCase())}
                placeholder="Ex.: CHOR"
                aria-describedby="acronym-help"
              />
              <small id="acronym-help" className="help">
                Exatamente 4 letras ou números.
              </small>
            </label>
            <label>
              Cor de referência
              <input
                type="color"
                aria-label="Cor de referência"
                name="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                required
                className="color-picker"
              />
              <small className="help">{color.toUpperCase()}</small>
            </label>
          </div>
          <div className="institution-preview" aria-label="Prévia da identidade da instituição">
            <span
              className="institution-symbol"
              style={{ backgroundColor: color, color: institutionTextColor(color) }}
            >
              {acronym || 'SIGLA'}
            </span>
            <span>
              Identificação da instituição<small>Sua sigla e cor de referência</small>
            </span>
          </div>
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
