import { PageLayout } from "../components/PageLayout";
import { Link } from "../router";

export function About() {
  return (
    <PageLayout title="About">
      <div>
        <div className="prose">
          <p className="lede-p">I'm a researcher working where data, AI and health systems meet. My work spans healthcare research, applied machine learning, teaching and interdisciplinary collaboration, and I care most about research that holds up in the real world.</p>

          <h2>Research interests &amp; approach</h2>
          <p>My PhD in Artificial Intelligence at the University of Limerick (2021–2025), supervised by Prof. Conor Ryan and Prof. Meghana Kshirsagar, focused on making model training more efficient. I developed three hyperparameter optimisation frameworks — HyperEstimator, HyperGE and PurGE — which reached up to 2.2× faster convergence, 40% energy savings and 30% lower memory use compared with state-of-the-art methods.</p>
          <p>Since then my focus has moved firmly towards health. I work on emergency department patient flow using AI and agent-based modelling, responsible and bias-aware approaches to prostate cancer risk stratification, knowledge graphs and large language models for chronic lymphocytic leukaemia care, and how model explainability evolves with real-world cancer data.</p>

          <h2>Current role</h2>
          <p>I am a Senior Postdoctoral Researcher with the National Kidney Disease Surveillance System, School of Medicine, University of Limerick, Ireland. I apply data analysis and machine learning to quantify the burden and impact of chronic kidney disease in Ireland, and help develop a secure, linked health data infrastructure that brings together national hospital, registry and population data.</p>

          <h2>Teaching &amp; mentoring</h2>
          <p>I lead the graduate module Research Methods and Specifications at the University of Limerick, and have supported many undergraduate computer science modules as a teaching assistant. I supervise undergraduate and master's students and have mentored research interns on applied machine learning projects. <Link to="/teaching/">More on teaching</Link>.</p>

          <h2>Selected experience &amp; recognition</h2>
          <ul>
            <li>Named one of Business Post's <em>30 Under 30 Top People in Tech</em> (2025).</li>
            <li>Doctoral Fellowship, Research Ireland Centre for Training in Artificial Intelligence (2021–2025).</li>
            <li>Named collaborator on two funded projects on AI and digital twins in emergency care.</li>
            <li>Earlier work with Intel on a cryptographically secure random number generator, and on blockchain-based health data sharing under an EU Horizon 2020 project.</li>
            <li>Before research, a Trainee Analyst at Principal Global Services, automating insurance workflows.</li>
          </ul>

          <h2>Collaboration</h2>
          <p>I'm keen to collaborate on applied AI for healthcare, health data infrastructure, responsible and explainable machine learning, and teaching that makes data science accessible. <Link to="/contact/">Get in touch</Link>.</p>
        </div>
      </div>
    </PageLayout>
  );
}
