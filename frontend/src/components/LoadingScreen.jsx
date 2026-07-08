export default function LoadingScreen({ compact = false }) {
  return (
    <div className={compact ? 'loading-inline' : 'loading-screen'}>
      <span className="spinner" aria-hidden="true" />
      <span>Loading...</span>
    </div>
  );
}
