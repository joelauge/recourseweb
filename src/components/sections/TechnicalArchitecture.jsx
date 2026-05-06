import recourseLogo from '../../../assets/recourse_logo_white.png';

const ARCHITECTURE_DATA = [
  {
    num: '01',
    title: 'Enabling Architecture',
    desc: 'RLLM is the bridge between static storage and active intelligence. It virtualizes your entire data layer, enabling models to treat petabytes of information as a single, unified memory space.'
  },
  {
    num: '02',
    title: 'Universal Inference',
    desc: 'Inference is no longer bound by token limits. Run queries across your entire file system simultaneously—the context window is no longer a constraint, but a viewport into your infinite data.'
  },
  {
    num: '03',
    title: 'Economic Optimization',
    desc: 'Virtualizing context dramatically reduces compute overhead. By eliminating redundant token processing, enterprise environments see a massive reduction in total inference costs.'
  }
];

export default function TechnicalArchitecture() {
  return (
    <section className="recourse-section" id="architecture" style={{ minHeight: '400px', display: 'block', zIndex: 10 }}>
      <div className="recourse-container">
        <div className="recourse-header">
          <div className="recourse-brand-wrapper" style={{ marginBottom: '60px', display: 'flex', justifyContent: 'center' }}>
            <img
              src={recourseLogo}
              alt="RecourseLLM"
              className="recourse-brand-logo"
              style={{ height: '50px', opacity: 0.9, filter: 'drop-shadow(0 0 10px rgba(214, 160, 75, 0.2))', display: 'block' }}
            />
          </div>
          <span className="recourse-subtitle">Orchestration</span>
          <h2 className="recourse-title">
            Infinite Scale.<br />
          </h2>
          <p className="recourse-meta-desc" style={{ maxWidth: '800px', margin: '24px auto 0', color: 'rgba(255,255,255,0.7)', lineHeight: '1.7', fontSize: '1.15rem', fontStyle: 'italic' }}>
            "ReCourseLLM's orchestration models enable stateful inference across huge datasets and monolithic files.
            KnowDrive is only possible because of RLLM's orchestration models."
          </p>
        </div>

        <div className="recourse-grid">
          {ARCHITECTURE_DATA.map((item, index) => (
            <div key={index} className="recourse-card">
              <span className="recourse-card-num">{item.num}</span>
              <h3 className="recourse-card-title">{item.title}</h3>
              <p className="recourse-card-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
