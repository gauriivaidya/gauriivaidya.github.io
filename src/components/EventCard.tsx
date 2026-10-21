import type { EventItem } from "../data/events";
import { Row } from "./YearGroup";

const SHORT: Record<string, string> = { "Invited Talks": "Talk", "Conference Presentations": "Conference", Workshops: "Workshop", Panels: "Panel", "Media Appearances": "Media", "Awards / Recognition": "Award", "Other Events": "Event" };

/** One talk/event: type badge · title · date/host/place/role · description · link. */
export function EventRow({ e }: { e: EventItem }) {
  return (
    <Row className="event-row" badge={SHORT[e.type] ?? "Event"} title={e.type} data-type={e.type}>
      <h3 className="row-title">{e.title}</h3>
      <p className="row-meta">
        <span>{e.date}</span>{e.host && <span>{e.host}</span>}{e.location && <span>{e.location}</span>}{e.role && <span className="ev-role">{e.role}</span>}
      </p>
      {e.description && <p className="row-desc">{e.description}</p>}
      {e.link && <div className="pub-links"><a className="act" href={e.link.url} target="_blank" rel="noopener noreferrer">{e.link.label}</a></div>}
    </Row>
  );
}
