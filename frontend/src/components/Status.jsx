export function LoadingState({ label = 'Loading...' }) {
  return <div className="state-card">{label}</div>;
}

export function ErrorState({ message }) {
  if (!message) return null;
  return <div className="alert error">{message}</div>;
}

export function SuccessState({ message }) {
  if (!message) return null;
  return <div className="alert success">{message}</div>;
}
