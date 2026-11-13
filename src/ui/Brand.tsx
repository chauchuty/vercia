export default function Brand({ className = '' }: { className?: string }) {
  return (
    <div className={`vercia-brand ${className}`} aria-label="Vercia">
      <span>V</span>ERCIA
    </div>
  );
}
