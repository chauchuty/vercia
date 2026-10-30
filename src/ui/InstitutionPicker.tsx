import { Building2, LogOut, Plus } from 'lucide-react';
import type { Institution, User } from '../domain/models';
import { institutionTextColor } from '../domain/institution';
export default function InstitutionPicker({
  user,
  institutions,
  onSelect,
  onCreate,
  onLogout,
}: {
  user: User;
  institutions: Institution[];
  onSelect: (id: string) => void;
  onCreate: () => void;
  onLogout: () => void;
}) {
  return (
    <main className="auth-main institution-picker">
      <section className="auth-form">
        <span className="eyebrow">VERCIA · GESTÃO</span>
        <h1>Escolha uma instituição</h1>
        <p className="muted">
          Olá, {user.name.split(' ')[0]}. Selecione a instituição que deseja administrar.
        </p>
        {institutions.length ? (
          <ul className="institution-picker-list">
            {institutions.map((institution) => (
              <li key={institution.id}>
                <button type="button" onClick={() => onSelect(institution.id)}>
                  <span
                    className="institution-symbol"
                    style={{
                      backgroundColor: institution.color,
                      color: institutionTextColor(institution.color),
                    }}
                  >
                    {institution.acronym}
                  </span>
                  <strong>{institution.name}</strong>
                  <Building2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="help">Você ainda não cadastrou uma instituição.</p>
        )}
        <button type="button" className="primary" onClick={onCreate}>
          <Plus size={17} /> Cadastrar instituição
        </button>
        <button
          type="button"
          className="text-button navigation-button institution-picker-logout"
          onClick={onLogout}
        >
          <LogOut size={16} /> Sair
        </button>
      </section>
    </main>
  );
}
