import { Link } from "react-router-dom";
import { Compass, ArrowLeft } from "lucide-react";
export default function NotFound() {
  return (
    <div className="not-found">
      <div className="empty-orbit">
        <Compass size={40} />
      </div>
      <div className="eyebrow">404 · UNCHARTED TERRITORY</div>
      <h1>A little off the map.</h1>
      <p>This page doesn’t exist, but there’s a whole world waiting for you.</p>
      <Link className="button primary" to="/">
        <ArrowLeft size={16} /> Back to dashboard
      </Link>
    </div>
  );
}
