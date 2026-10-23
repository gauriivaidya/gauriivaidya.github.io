import data from "./events.json";

export const EVENT_TYPES = [
  "Invited Talks",
  "Conference Presentations",
  "Workshops",
  "Panels",
  "Media Appearances",
  "Awards / Recognition",
  "Other Events",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export type EventItem = {
  id: string;
  type: EventType;
  title: string;
  date: string; // display text
  year: number;
  host?: string;
  location?: string;
  role?: string; // Invited Speaker | Presenter | Facilitator | Panellist | Honouree | Organiser ...
  description?: string;
  image?: string; // path under /public/images/events — only real photos
  imageAlt?: string;
  link?: { label: string; url: string }; // only verified URLs
};

/** Generated from content/talks.yaml + content/awards.yaml by scripts/content2json.py — edit the YAML, not this. Newest first. */
export const events = data as EventItem[];
