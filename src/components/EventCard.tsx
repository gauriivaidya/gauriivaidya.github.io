import type { EventItem } from "../data/events";

const INITIALS: Record<string, string> = { "Invited Talks": "Talk", "Conference Presentations": "Conf.", Workshops: "Workshop", Panels: "Panel", "Media Appearances": "Media", "Awards / Recognition": "Award", "Other Events": "Event" };

export function EventRow({ e }: { e: EventItem }) {
  return (
    <li className="event-row" data-type={e.type}>
      <div className="ev-thumb">
        {e.image ? <img src={e.image} alt={e.imageAlt ?? ""} loading="lazy" decoding="async" width="132" height="88" />
          : <div className="ev-ph" aria-hidden="true"><span>{INITIALS[e.type] ?? "Event"}</span></div>}
      </div>
      <div className="ev-body">
        <p className="event-type">{e.type}</p>
        <h3 className="event-title">{e.title}</h3>
        <p className="event-meta">
          <span>{e.date}</span>
          {e.host && <span>{e.host}</span>}
          {e.location && <span>{e.location}</span>}
          {e.role && <span className="ev-role">{e.role}</span>}
        </p>
        {e.description && <p className="event-desc">{e.description}</p>}
      </div>
      <div className="ev-links">
        {e.link ? <a href={e.link.url} target="_blank" rel="noopener noreferrer">{e.link.label} →</a> : null}
      </div>
    </li>
  );
}
