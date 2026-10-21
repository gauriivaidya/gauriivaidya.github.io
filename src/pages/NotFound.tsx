import { PageLayout } from "../components/PageLayout";
import { Link } from "../router";
export function NotFound() {
  return <PageLayout title="Page not found" intro="That page doesn't exist — perhaps it moved."><p><Link to="/">Back to home →</Link></p></PageLayout>;
}
