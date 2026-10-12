import { Link } from 'react-router-dom';
export default function NotFound() { return <div className="page-center stack"><h1>404</h1><p>That page does not exist.</p><Link className="button primary" to="/">Go home</Link></div>; }
