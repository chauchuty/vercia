import { useEffect, useState } from 'react';
import type { Database, Notice, User } from '../domain/models';
import { sendNoticeMessage } from '../application/service';
import { uid, date } from './helpers';

interface Props {
  data: Database;
  notice: Notice;
  user: User;
  manager: boolean;
  busy: boolean;
  run: (action: () => void | Promise<void>) => Promise<void>;
  commit: (db: Database) => void;
}
export default function NoticeConversation({
  data,
  notice,
  user,
  manager,
  busy,
  run,
  commit,
}: Props) {
  const [thread, setThread] = useState('');
  useEffect(() => setThread(''), [notice.id]);
  const messages = notice.messages || [];
  const threadIds = [
    ...new Set(messages.filter((m) => m.authorId === m.threadUserId).map((m) => m.threadUserId)),
  ];
  const currentThread = manager
    ? threadIds.includes(thread)
      ? thread
      : threadIds[0] || ''
    : user.id;
  const visible = messages.filter((m) => m.threadUserId === currentThread);
  return (
    <section className="notice-conversation" aria-label="Conversa da notificação">
      <h3>Mensagens</h3>
      {manager && threadIds.length > 0 && (
        <label>
          Conversa com
          <select value={currentThread} onChange={(e) => setThread(e.target.value)}>
            {threadIds.map((id) => {
              const person = data.users.find((u) => u.id === id);
              return (
                <option key={id} value={id}>
                  {person ? `${person.name} · ${person.email}` : 'Usuário indisponível'}
                </option>
              );
            })}
          </select>
        </label>
      )}
      {!currentThread ? (
        <p className="help">Nenhum destinatário enviou mensagem ainda.</p>
      ) : (
        <>
          {visible.length ? (
            <ol className="conversation-list">
              {visible.map((message) => (
                <li key={message.id} className={message.authorId === user.id ? 'own' : ''}>
                  <div>
                    <strong>
                      {data.users.find((u) => u.id === message.authorId)?.name || 'Usuário'}
                    </strong>
                    <time dateTime={message.createdAt}>{date(message.createdAt)}</time>
                  </div>
                  <p>{message.body}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="help">Nenhuma mensagem nesta conversa.</p>
          )}
          {notice.status === 'published' ? (
            <form
              className="conversation-form"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const body = String(new FormData(form).get('message') || '');
                run(() => {
                  commit(
                    sendNoticeMessage(data, user.id, notice.id, {
                      id: uid(),
                      threadUserId: currentThread,
                      authorId: user.id,
                      body,
                      createdAt: new Date().toISOString(),
                    }),
                  );
                  form.reset();
                });
              }}
            >
              <label>
                Mensagem
                <textarea
                  name="message"
                  rows={3}
                  maxLength={2000}
                  required
                  placeholder={manager ? 'Escreva sua resposta' : 'Escreva para o gestor'}
                />
              </label>
              <button type="submit" className="primary" disabled={busy}>
                {manager ? 'Responder' : 'Enviar mensagem'}
              </button>
            </form>
          ) : (
            <p className="help">Esta notificação está arquivada. Desarquive-a para responder.</p>
          )}
        </>
      )}
      <p className="help">Mensagens salvas neste navegador.</p>
    </section>
  );
}
