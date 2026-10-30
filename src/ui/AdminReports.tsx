import { useState } from 'react';
import type { Database, User } from '../domain/models';
import { membershipIsActive } from '../application/service';
import { date } from './helpers';

export default function AdminReports({ data, managers }: { data: Database; managers: User[] }) {
  const [selected, setSelected] = useState('all');
  const visible =
    selected === 'all' ? managers : managers.filter((manager) => manager.id === selected);
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">ADMINISTRAÇÃO</span>
          <h1>Relatórios</h1>
          <p>Consulte os dados e as atividades de cada gestor.</p>
        </div>
      </div>
      <label className="report-filter">
        Gestor
        <select value={selected} onChange={(event) => setSelected(event.target.value)}>
          <option value="all">Todos os gestores</option>
          {managers.map((manager) => (
            <option key={manager.id} value={manager.id}>
              {manager.name} · {manager.email}
            </option>
          ))}
        </select>
      </label>
      {!visible.length ? (
        <section className="panel admin-empty">Nenhum gestor cadastrado.</section>
      ) : (
        <div className="report-list">
          {visible.map((manager) => {
            const links = data.memberships.filter(
              (m) => m.userId === manager.id && m.role === 'manager',
            );
            const institutions = data.institutions.filter((institution) =>
              links.some((link) => link.institutionId === institution.id),
            );
            const institutionIds = new Set(institutions.map((institution) => institution.id));
            const people = data.memberships.filter(
              (membership) =>
                institutionIds.has(membership.institutionId) &&
                membership.role === 'member' &&
                membershipIsActive(membership),
            ).length;
            const categories = data.categories.filter(
              (category) => institutionIds.has(category.institutionId) && !category.archived,
            ).length;
            const published = data.notices.filter(
              (notice) => institutionIds.has(notice.institutionId) && notice.status === 'published',
            ).length;
            const activities = (data.managerActivities || [])
              .filter((activity) => activity.userId === manager.id)
              .slice()
              .reverse();
            return (
              <section className="panel report-card" key={manager.id}>
                <div className="report-person">
                  <span className="avatar">{manager.name.slice(0, 2).toUpperCase()}</span>
                  <div>
                    <h2>{manager.name}</h2>
                    <p>{manager.email}</p>
                  </div>
                </div>
                <div className="report-institutions">
                  <strong>Instituição</strong>
                  {institutions.length ? (
                    institutions.map((institution) => (
                      <span key={institution.id}>
                        {institution.name} · {institution.acronym}
                        {links.some(
                          (link) =>
                            link.institutionId === institution.id && membershipIsActive(link),
                        )
                          ? ''
                          : ' · vínculo inativo'}
                      </span>
                    ))
                  ) : (
                    <span>Sem instituição cadastrada</span>
                  )}
                </div>
                <dl className="report-metrics">
                  <div>
                    <dt>Usuários ativos</dt>
                    <dd>{people}</dd>
                  </div>
                  <div>
                    <dt>Categorias ativas</dt>
                    <dd>{categories}</dd>
                  </div>
                  <div>
                    <dt>Notificações publicadas</dt>
                    <dd>{published}</dd>
                  </div>
                </dl>
                <details className="report-activities">
                  <summary>
                    Atividades do gestor <span>({activities.length})</span>
                  </summary>
                  {activities.length ? (
                    <ul>
                      {activities.map((activity) => (
                        <li key={activity.id}>
                          <span>{activity.description}</span>
                          <small>{date(activity.at)}</small>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Nenhuma atividade registrada.</p>
                  )}
                </details>
              </section>
            );
          })}
        </div>
      )}
      <p className="help report-note">
        Os dados e as atividades disponíveis são os registrados neste navegador. As contagens são
        por instituição vinculada ao gestor.
      </p>
    </>
  );
}
