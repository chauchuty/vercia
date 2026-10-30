import { useEffect, useId, useRef, type ReactNode } from 'react';
import { ArrowDown, Minus, ArrowUp, Flame, X, Bell } from 'lucide-react';
import { priorities, type Priority } from '../domain/models';
export function PriorityIcon({ value }: { value: Priority }) {
  const Icon = { low: ArrowDown, medium: Minus, high: ArrowUp, urgent: Flame }[value];
  return (
    <span
      className={`priority ${value}`}
      title={`Prioridade ${priorities[value]}`}
      aria-label={`Prioridade ${priorities[value]}`}
    >
      <Icon size={17} />
    </span>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const titleId = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const element = ref.current;
    const focusable = () =>
      Array.from(
        element?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
        ) || [],
      );
    focusable()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      const topOverlay = document.querySelectorAll('.overlay');
      if (topOverlay[topOverlay.length - 1] !== element?.closest('.overlay')) return;
      if (e.key === 'Escape') closeRef.current();
      if (e.key === 'Tab') {
        const items = focusable();
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = originalOverflow;
      previous?.focus();
    };
  }, []);
  return (
    <div className="overlay" onClick={onClose}>
      <section
        ref={ref}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <header>
          <h2 id={titleId}>{title}</h2>
          <button className="icon-button" aria-label="Fechar" onClick={onClose}>
            <X size={20} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
export function Empty({ title, description }: { title: string; description: string }) {
  return (
    <div className="empty">
      <Bell size={30} />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
