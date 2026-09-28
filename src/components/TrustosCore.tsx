import { useId, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

const stages = [
  { number: '01', name: 'Identify', detail: 'Define the issue before taking action.' },
  { number: '02', name: 'Recover', detail: 'Explore an appropriate path, deliberately.' },
  { number: '03', name: 'Verify', detail: 'Review the result through independent checks.' },
] as const;

export function TrustosCore() {
  const [active, setActive] = useState<number | null>(null);
  const descriptionId = useId();
  return <div className={`core-panel core-mode-${active === null ? 'idle' : active}`} aria-label="Interactive conceptual Trustos recovery pipeline">
    <div className="core-panel-top">
      <span className="core-title"><span className="core-title-symbol" aria-hidden="true"><span /><span /><span /></span>TRUSTOS CORE</span>
      <span className="core-illustrative">PROCESS MODEL <span className="core-header-divider">/</span> 001</span>
    </div>
    <div className="core-visual">
      <div className="core-visual-meta core-visual-meta--left">SYSTEM / FLOW<br />01—03</div>
      
      <svg className="core-svg" viewBox="0 0 560 410" role="img" aria-labelledby={descriptionId}>
        <title id={descriptionId}>A geometric Trustos Core connected to Identify, Recover and Verify pathways. Select a step below to explore the conceptual process.</title>
        <defs>
          <linearGradient id="coreGradient" x1="0" x2="1" y1="1" y2="0"><stop offset="0" stopColor="#b34b26" /><stop offset=".57" stopColor="#fc8b45" /><stop offset="1" stopColor="#ffd5aa" /></linearGradient>
          <linearGradient id="coreFade" x1="0" x2="1"><stop offset="0" stopColor="#f38743" stopOpacity=".04" /><stop offset=".5" stopColor="#f38743" stopOpacity=".3" /><stop offset="1" stopColor="#f38743" stopOpacity=".04" /></linearGradient>
        </defs>
        <g className="core-backdrop">
          <path d="M280 14V396 M30 205H530" stroke="#47544d" strokeOpacity=".32" strokeWidth="1" strokeDasharray="2 9" />
          <circle cx="280" cy="205" r="174" fill="none" stroke="#46554d" strokeOpacity=".26" strokeWidth="1" />
          <circle cx="280" cy="205" r="133" fill="none" stroke="#526158" strokeOpacity=".25" strokeWidth="1" strokeDasharray="3 9" />
          <circle cx="280" cy="205" r="112" fill="none" stroke="#586960" strokeOpacity=".30" strokeWidth="1" />
          <path d="M111 205h338 M280 36v338" fill="none" stroke="#67776a" strokeOpacity=".13" />
          <path d="m154 79 252 252 M406 79 154 331" fill="none" stroke="#67776a" strokeOpacity=".10" />
          {Array.from({ length: 36 }, (_, i) => <line key={i} x1="280" y1="27" x2="280" y2={i % 3 === 0 ? '37' : '33'} stroke="#93a095" strokeOpacity={i % 3 === 0 ? '.52' : '.24'} strokeWidth="1" transform={`rotate(${i * 10} 280 205)`} />)}
          <path d="M105 204h43 M412 204h43 M279 33v39 M279 337v40" stroke="#a7b1a4" strokeOpacity=".46" strokeWidth="1" />
        </g>
        <g className="core-orbit-slow">
          <circle cx="280" cy="205" r="159" fill="none" stroke="#b07b52" strokeOpacity=".54" strokeWidth="2" strokeDasharray="110 900" />
          <circle cx="280" cy="205" r="145" fill="none" stroke="#a9b5a7" strokeOpacity=".28" strokeWidth="1" strokeDasharray="2 16 2 380" />
        </g>
        <g className="core-paths" fill="none" strokeWidth="1.6">
          <path className="core-path core-path-identify" d="M31 112h104l38 38h19" stroke="#909e91" />
          <path className="core-path core-path-recover" d="M280 0v86l34 34" stroke="#909e91" />
          <path className="core-path core-path-verify" d="M529 303H421l-38-38h-16" stroke="#909e91" />
          <path d="M31 112H11 M280 0v15 M529 303h19" stroke="#647568" strokeOpacity=".45" />
        </g>
        <g className="core-path-indicators">
          <circle className="core-node core-node-identify" cx="164" cy="141" r="4" fill="#94a395" />
          <circle className="core-node core-node-recover" cx="313" cy="120" r="4" fill="#94a395" />
          <circle className="core-node core-node-verify" cx="390" cy="271" r="4" fill="#94a395" />
          <circle cx="31" cy="112" r="3" fill="#627166" /><circle cx="280" cy="17" r="3" fill="#627166" /><circle cx="529" cy="303" r="3" fill="#627166" />
        </g>
        <g className="core-mechanism">
          <circle className="core-inner-ring" cx="280" cy="205" r="96" fill="none" stroke="url(#coreGradient)" strokeWidth="2" strokeDasharray="180 24 115 284" strokeLinecap="square" />
          <circle cx="280" cy="205" r="84" fill="none" stroke="#b3beb1" strokeOpacity=".43" strokeWidth="1" strokeDasharray="2 10" />
          <path d="m280 128 66 38v77l-66 38-66-38v-77z" fill="#1b2420" stroke="#778b78" strokeOpacity=".6" strokeWidth="1" />
          <path d="m280 146 50 29v59l-50 29-50-29v-59z" fill="none" stroke="url(#coreGradient)" strokeOpacity=".72" strokeWidth="1.3" />
          <path d="m280 145 0 26 m50 4-23 13 m23 46-23-13 m-27 42v-27 m-50-1 23-14 m-23-46 23 14" fill="none" stroke="#f7a76b" strokeOpacity=".45" strokeWidth="1" />
          <path d="M280 171v23l-18 11 18 11 18-11-18-11 M280 216v22" fill="none" stroke="url(#coreGradient)" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="280" cy="205" r="5" fill="#f48a46" />
          <circle className="core-heartbeat" cx="280" cy="205" r="18" fill="none" stroke="#ff9b50" strokeOpacity=".6" strokeWidth="1" />
          <path d="M280 109v18 M280 282v18 M183 205h18 M359 205h18" stroke="#d59662" strokeOpacity=".76" strokeWidth="2" />
        </g>
        <g className="core-satellite" fill="#de8c51">
          <circle cx="280" cy="45" r="2.5" /><circle cx="393" cy="318" r="2.5" /><circle cx="121" cy="205" r="2.5" />
        </g>
        <g className="core-labels" fill="#c2cec2" fontFamily="IBM Plex Mono, monospace" fontSize="9" letterSpacing="1.1">
          <text x="32" y="98">IDENTIFY / 01</text>
          <text x="298" y="37">RECOVER / 02</text>
          <text x="429" y="291">VERIFY / 03</text>
          <text x="273" y="348" fill="#8b9a8b">C O R E</text>
        </g>
      </svg>
      <div className="core-visual-footer"><span>01 / 03</span><span>INPUT → INTENT → REVIEW</span></div>
    </div>
    <div className="core-bottom">
      <div className="core-bottom-label"><span>RECOVERY PIPELINE</span><span>SELECT A STAGE <ArrowUpRight size={12} aria-hidden="true" /></span></div>
      <div className="core-steps" role="group" aria-label="Explore the conceptual recovery stages">
        {stages.map((step, i) => <button type="button" key={step.number} className={`core-step ${active === i ? 'core-step--active' : ''}`} aria-pressed={active === i} onClick={() => setActive(i)}>
          <span className="core-step-index">{step.number}</span><span className="core-step-name">{step.name}</span><ArrowUpRight size={15} aria-hidden="true" />
        </button>)}
      </div>
      <div className="core-step-detail" aria-live="polite"><span className="core-detail-indicator" />{active === null ? 'A conceptual view of the process. Select a stage to explore.' : stages[active].detail}</div>
    </div>
  </div>;
}
