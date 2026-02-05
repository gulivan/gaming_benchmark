import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <main className="page centered">
      <h1>Page Not Found</h1>
      <p>The game or page you requested does not exist.</p>
      <Link className="home-link" to="/">
        Back to hub
      </Link>
    </main>
  );
};
