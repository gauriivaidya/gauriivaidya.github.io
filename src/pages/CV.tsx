import { Icon } from "../components/Icons";
import { PageLayout } from "../components/PageLayout";

/** CV: the PDF in public/cv.pdf, embedded on larger screens, with Download / Open buttons everywhere. */
export function CV() {
  return (
    <PageLayout title="CV" wide action={
      <div className="cv-actions">
        <a className="btn btn-primary" href="/cv.pdf" download="Gauri-Vaidya-CV.pdf"><Icon name="download" /> Download PDF</a>
        <a className="btn btn-ghost" href="/cv.pdf" target="_blank" rel="noopener noreferrer">Open in new tab <span aria-hidden="true">↗</span></a>
      </div>}>
      <div className="cv-frame"><iframe src="/cv.pdf#view=FitH&navpanes=0" title="Gauri Vaidya — CV (PDF)" loading="lazy" /></div>
      <p className="cv-note">On a phone? Use <a href="/cv.pdf" download="Gauri-Vaidya-CV.pdf">Download PDF</a> or <a href="/cv.pdf" target="_blank" rel="noopener noreferrer">open it in a new tab</a>.</p>
    </PageLayout>
  );
}
