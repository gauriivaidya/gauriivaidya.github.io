import { CopyBlock } from "../components/CopyBlock";
import { PageLayout } from "../components/PageLayout";
import { longBio, shortBio } from "../data/bio";

export function About() {
  return (
    <PageLayout title="About" intro="Bios for talk introductions, programmes and press. Feel free to copy and use them.">
      <CopyBlock id="short-bio" title="Short bio" paras={shortBio} />
      <CopyBlock id="long-bio" title="Long bio" paras={longBio} />
    </PageLayout>
  );
}
