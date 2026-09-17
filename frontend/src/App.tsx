import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, AlertTriangle, ArrowLeft, ArrowRight, Camera, Check, CircleHelp,
  Download, FileText, Image as ImageIcon, LayoutDashboard, Menu, Plus, RefreshCw,
  Send, Settings, ShieldCheck, Stethoscope, Upload, UserRound, X
} from "lucide-react";
import { DEMO_MODE, imageUrl, predictImage } from "./api";
import type { Result, Patient, Step, View } from "./types";

const GRADE_ORDER = ["no_dr","mild","moderate","severe","proliferative_dr"];
const GRADE_LABEL = ["No DR","Mild","Moderate","Severe","Proliferative DR"];
const GRADE_COLORS = ["#2E9E6B","#C9A227","#E08B2C","#D6542B","#A32332"];
const CLINICAL_BASIS = [
  "No signs of diabetic retinopathy were found in this image.",
  "Mild NPDR — at least one microaneurysm is present, with no further hemorrhages or exudates.",
  "Moderate NPDR — more than just microaneurysms, but not yet meeting the criteria for severe disease.",
  "Severe NPDR — extensive hemorrhages across all four quadrants, definite venous beading in two or more quadrants, or prominent intraretinal microvascular abnormalities, without neovascularization.",
  "Proliferative DR — neovascularization and/or vitreous or preretinal hemorrhage is present. This is sight-threatening and needs urgent attention."
];
const REFERRAL = [
  ["No referral needed","Re-screen in 12 months",false],
  ["No referral needed","Re-screen in 6–12 months",false],
  ["Refer within 4 weeks","Referable DR (Grade 2+)",true],
  ["Refer within 2 weeks","Referable DR (Grade 2+)",true],
  ["Refer urgently","Sight-threatening — same week",true]
] as const;

function normalizeSeverity(s: string) {
  const x = s.toLowerCase().trim();
  if (x === "no dr") return "no_dr";
  if (x === "proliferative dr" || x === "proliferative") return "proliferative_dr";
  return x;
}

function FundusPlaceholder({ heat = false, src }: { heat?: boolean; src?: string }) {
  if (src) return <img src={src} alt="Retinal fundus" className="h-full w-full object-cover" />;
  return (
    <div className="relative h-full w-full overflow-hidden rounded-full"
      style={{ background: "radial-gradient(circle at 45% 42%, #F2A860 0%, #D9702F 45%, #7A2A16 100%)" }}>
      <div className="absolute left-[59%] top-[42%] h-8 w-8 rounded-full bg-[#F6D9A8]/90" />
      <div className="absolute left-[38%] top-[52%] h-4 w-6 rounded-full bg-[#5C1C10]/60" />
      <div className="absolute left-[24%] top-[49%] h-[2px] w-[50%] rotate-[14deg] bg-[#7A1F12]/75" />
      <div className="absolute left-[29%] top-[62%] h-[2px] w-[45%] -rotate-[17deg] bg-[#7A1F12]/75" />
      <div className="absolute left-[66%] top-[48%] h-[2px] w-[27%] rotate-[48deg] bg-[#7A1F12]/70" />
      {[["35%","47%"],["47%","30%"],["28%","65%"],["69%","72%"],["51%","75%"]].map(([l,t],i)=><span key={i} className="absolute h-1.5 w-1.5 rounded-full bg-[#3D0F08]" style={{left:l,top:t}} />)}
      {heat && <>
        <span className="absolute left-[20%] top-[39%] h-16 w-16 rounded-full bg-red-500/65 blur-xl"/>
        <span className="absolute left-[63%] top-[50%] h-20 w-20 rounded-full bg-orange-500/70 blur-xl"/>
        <span className="absolute left-[43%] top-[63%] h-16 w-16 rounded-full bg-yellow-300/65 blur-xl"/>
      </>}
    </div>
  );
}

function App() {
  const [view,setView] = useState<View>("dashboard");
  const [step,setStep] = useState<Step>(1);
  const [patient,setPatient] = useState<Patient>({
    name:"", id:"", age:"", eye:"Right (OD)", diabetesYears:"", contact:""
  });
  const [file,setFile] = useState<File|null>(null);
  const [preview,setPreview] = useState("");
  const [result,setResult] = useState<Result|null>(null);
  const [error,setError] = useState("");
  const [heat,setHeat] = useState(false);
  const [screened,setScreened] = useState(0);
  const [referred,setReferred] = useState(0);
  const [note,setNote] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const title = useMemo(() => ({
    dashboard:["Good morning","Tuesday, 16 September · Screening camp"],
    screening:["New screening","Follow the steps to capture and grade a fundus image"],
    results:["Screening report","Generated automatically · ready to review or print"]
  } as Record<View,string[]>)[view],[view]);

  const chooseFile = (f?: File) => {
    if (!f) return;
    setError("");
    if (!["image/jpeg","image/png"].includes(f.type)) return setError("Please choose a JPEG or PNG fundus image.");
    if (f.size > 15*1024*1024) return setError("Image is larger than 15 MB.");
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStep(3);
  };

  const start = () => {
    setError(""); setResult(null); setFile(null); setPreview(""); setStep(1);
    setPatient({name:"",id:"",age:"",eye:"Right (OD)",diabetesYears:"",contact:""});
    setView("screening");
  };

  const analyze = async () => {
    if (!file && !DEMO_MODE) return setError("Upload a fundus image first.");
    setError(""); setStep("analyzing");
    try {
      const response = await predictImage(file || new File([], "demo.jpg", {type:"image/jpeg"}));
      if (!response.success) { setStep("rejected"); setError(response.error); return; }
      const key = normalizeSeverity(response.severity || "No DR");
      const grade = Math.max(0, GRADE_ORDER.indexOf(key));
      setResult({ grade, key, label:GRADE_LABEL[grade], confidence:response.confidence, probabilities:response.probabilities, heatmapUrl:response.heatmap_url });
      setScreened(v=>v+1);
      if (grade >= 2) setReferred(v=>v+1);
      setView("results"); setHeat(false);
    } catch (e:any) {
      setError(e?.message || "Could not connect to the screening service.");
      setStep(3);
    }
  };

  const confirm = () => {
    setNote(""); setView("dashboard");
  };

  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden w-[216px] shrink-0 flex-col bg-navy p-3.5 text-[#CFE0E3] md:flex">
        <Brand/>
        <nav className="flex-1 space-y-1">
          <NavButton active={view==="dashboard"} icon={<LayoutDashboard size={18}/>} onClick={()=>setView("dashboard")}>Dashboard</NavButton>
          <NavButton active={view==="screening"} icon={<Plus size={18}/>} onClick={start}>New screening</NavButton>
          <NavButton active={view==="results"} icon={<FileText size={18}/>} onClick={()=>result && setView("results")} disabled={!result}>Latest report</NavButton>
          <NavButton icon={<Settings size={18}/>} onClick={()=>alert("Settings are reserved for the deployment configuration.")}>Settings</NavButton>
        </nav>
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center gap-2 text-xs text-[#8FB8A9]"><span className="h-2 w-2 rounded-full bg-[#4BC98E] shadow-[0_0_0_3px_rgba(75,201,142,.2)]"/>Synced · local session</div>
          <div className="mt-3 flex items-center gap-2"><div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#33505F] text-[11px] font-semibold text-white">RK</div><div><div className="text-xs font-semibold text-[#DCE8EA]">Screening technician</div><div className="text-[11px] text-[#7E979E]">Camp console</div></div></div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-[60px] items-center justify-between gap-3 border-b border-line bg-white px-4 py-3 md:px-7">
          <div><h1 className="serif text-xl font-semibold">{title[0]}</h1><div className="mt-0.5 text-xs text-muted">{title[1]}</div></div>
          <div className="hidden items-center gap-3 text-xs text-muted sm:flex"><span className="rounded-full bg-[#E7F5EE] px-2.5 py-1 font-semibold text-teal-dark">{DEMO_MODE ? "Demo mode" : "API connected"}</span><span>Portable camera ready</span></div>
          <button className="rounded-md p-2 md:hidden" onClick={()=>setView(view==="dashboard"?"screening":"dashboard")}><Menu size={20}/></button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 pb-12 md:p-8">
          {view==="dashboard" && <Dashboard screened={screened} referred={referred} onStart={start}/>}
          {view==="screening" && <Screening patient={patient} setPatient={setPatient} step={step} setStep={setStep} file={file} preview={preview} chooseFile={chooseFile} inputRef={inputRef} analyze={analyze} error={error} setView={setView}/>}
          {view==="results" && result && <Results result={result} patient={patient} preview={preview} heat={heat} setHeat={setHeat} note={note} setNote={setNote} onConfirm={confirm} onRecapture={start}/>}
        </main>
      </div>
    </div>
  );
}

function Brand(){return <div className="mb-4 flex items-center gap-2 border-b border-white/10 px-2 pb-5 pt-1"><div className="h-7 w-7 rounded-full bg-[radial-gradient(circle_at_35%_35%,#E08B2C,#A32332_75%)] shadow-[inset_0_0_0_2px_rgba(255,255,255,.15)]"/><div className="serif text-[17px] font-semibold leading-none text-white">Netra Screen<span className="mt-1 block font-sans text-[10px] font-medium text-[#87A0A8]">DR screening · camp console</span></div></div>}
function NavButton({active,icon,children,onClick,disabled}:{active?:boolean;icon:React.ReactNode;children:React.ReactNode;onClick:()=>void;disabled?:boolean}){return <button disabled={disabled} onClick={onClick} className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13.5px] font-medium transition ${active?"bg-white/10 text-white":"text-[#A9C0C5] hover:bg-white/5 hover:text-white"} disabled:cursor-not-allowed disabled:opacity-40`}>{icon}{children}</button>}

function Dashboard({screened,referred,onStart}:{screened:number;referred:number;onStart:()=>void}) {
 return <div className="mx-auto max-w-[1100px]">
  <section className="mb-5 flex items-center justify-between gap-8 rounded-[10px] bg-gradient-to-br from-navy to-navy-2 p-7 shadow-card md:p-9">
   <div><h2 className="serif max-w-[430px] text-2xl font-semibold leading-tight text-white md:text-[26px]">Let's screen the next patient.</h2><p className="mt-2.5 max-w-[410px] text-sm leading-6 text-[#A9C0C5]">Capture the image — Netra Screen handles quality checks, grading, and an explainable report from there.</p><button className="btn-primary mt-5" onClick={onStart}><Plus size={18}/>Start new screening</button></div>
   <div className="hidden h-32 w-32 shrink-0 items-center justify-center rounded-full bg-white/5 p-1 shadow-[0_0_0_6px_rgba(255,255,255,.05)] sm:flex"><FundusPlaceholder/></div>
  </section>
  <div className="mb-5 grid gap-3 md:grid-cols-3">
   {[
    ["1","Capture","Photo taken right at the camp table."],
    ["2","Enhance & grade","Quality-checked and graded on the ICDR scale (0–4) in seconds."],
    ["3","Confirm & refer","Plain-language report with a clear next step."]
   ].map(([n,h,p])=><div className="card flex gap-3.5 p-5" key={n}><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-tint font-mono text-xs font-semibold text-teal-dark">{n}</span><div><h4 className="serif text-sm font-semibold">{h}</h4><p className="mt-1 text-xs leading-5 text-muted">{p}</p></div></div>)}
  </div>
  <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
   <div className="card"><div className="border-b border-line px-5 py-4 font-serif font-semibold">This session</div><div className="grid grid-cols-2 gap-4 p-5"><Stat n={screened} label="Patients screened"/><Stat n={referred} label="Flagged for referral" alert/></div></div>
   <div className="card"><div className="border-b border-line px-5 py-4 font-serif font-semibold">Model, at a glance</div><div className="p-5 text-xs">{[["Architecture","DenseNet121"],["Classes","5 · ICDR 0–4"],["Trained on","APTOS 2019"],["Target sensitivity",">90%"],["Target specificity",">85%"],["Status","Evaluation in progress"]].map(([k,v])=><div className="flex justify-between border-b border-[#EAEFEE] py-2.5 last:border-0" key={k}><span className="text-muted">{k}</span><span className={k==="Status"?"font-semibold text-g2":"font-semibold"}>{v}</span></div>)}</div></div>
  </div>
 </div>
}
function Stat({n,label,alert}:{n:number;label:string;alert?:boolean}){return <div><div className={`serif text-3xl font-semibold ${alert?"text-g2":""}`}>{n}</div><div className="mt-1.5 text-xs font-medium text-muted">{label}</div></div>}

function Screening({patient,setPatient,step,setStep,file,preview,chooseFile,inputRef,analyze,error,setView}:{patient:Patient;setPatient:any;step:Step;setStep:any;file:File|null;preview:string;chooseFile:(f?:File)=>void;inputRef:any;analyze:()=>void;error:string;setView:(v:View)=>void}) {
 const labels=["Patient details","Capture image","Review & submit"];
 const actual = step==="analyzing"||step==="rejected"?3:step;
 return <div className="mx-auto max-w-[760px]">
  <div className="mb-7 flex items-center">{labels.map((l,i)=>{const n=i+1;return <div className="flex flex-1 items-center" key={l}><div className="flex items-center gap-2"><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold ${n<actual?"bg-teal text-white":n===actual?"bg-ink text-white":"bg-[#EAEFEE] text-faint"}`}>{n<actual?<Check size={14}/>:n}</span><span className={`hidden text-xs font-semibold sm:inline ${n<=actual?"text-ink":"text-faint"}`}>{l}</span></div>{n<3&&<div className="mx-2 h-px flex-1 bg-line"/>}</div>})}</div>
  {step===1&&<div className="card p-6"><h3 className="serif text-xl font-semibold">Patient details</h3><div className="mt-5 grid gap-4 sm:grid-cols-2">
   <Field label="Patient name"><input value={patient.name} onChange={e=>setPatient({...patient,name:e.target.value})} placeholder="Enter patient name"/></Field>
   <Field label="Patient ID"><input className="mono" value={patient.id} onChange={e=>setPatient({...patient,id:e.target.value})} placeholder="RH-…"/></Field>
   <Field label="Age"><input inputMode="numeric" value={patient.age} onChange={e=>setPatient({...patient,age:e.target.value})} placeholder="Age"/></Field>
   <Field label="Eye being imaged"><select value={patient.eye} onChange={e=>setPatient({...patient,eye:e.target.value})}><option>Right (OD)</option><option>Left (OS)</option></select></Field>
   <Field label="Years since diabetes diagnosis"><input inputMode="numeric" value={patient.diabetesYears} onChange={e=>setPatient({...patient,diabetesYears:e.target.value})} placeholder="Years"/></Field>
   <Field label="Contact number"><input className="mono" value={patient.contact} onChange={e=>setPatient({...patient,contact:e.target.value})} placeholder="Optional"/></Field>
  </div><div className="mt-6 flex justify-end gap-2"><button className="btn-secondary" onClick={()=>setView("dashboard")}>Cancel</button><button className="btn-primary" onClick={()=>setStep(2)} disabled={!patient.name||!patient.id||!patient.age}>Continue <ArrowRight size={16}/></button></div></div>}
  {step===2&&<div className="card p-6"><h3 className="serif text-xl font-semibold">Capture or upload fundus image</h3><p className="mt-1 text-xs text-muted">{patient.name} · {patient.id} · {patient.eye}</p>
   <input ref={inputRef} className="hidden" type="file" accept="image/jpeg,image/png" onChange={e=>chooseFile(e.target.files?.[0])}/>
   <button onClick={()=>inputRef.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();chooseFile(e.dataTransfer.files?.[0])}} className="mt-5 flex w-full flex-col items-center justify-center rounded-[10px] border-[1.5px] border-dashed border-line bg-[#EAEFEE] px-5 py-12 transition hover:border-teal hover:bg-teal-tint"><Upload className="mb-2 text-muted"/><span className="font-semibold">Tap to upload, or drop an image file</span><span className="mt-1 text-xs text-faint">JPEG/PNG · max 15 MB</span></button>
   {error&&<ErrorBox text={error}/>}<div className="mt-5 flex justify-start"><button className="btn-secondary" onClick={()=>setStep(1)}><ArrowLeft size={16}/>Back</button></div>
  </div>}
  {step===3&&<div className="card p-6"><h3 className="serif text-xl font-semibold">Review & submit</h3><p className="mt-1 text-xs text-muted">Quality is checked automatically by the screening API before grading.</p>
   <div className="mt-5 flex flex-col gap-5 sm:flex-row"><div className="h-40 w-40 shrink-0 overflow-hidden rounded-full border border-line bg-[#1a0f0a]">{preview?<img src={preview} className="h-full w-full object-cover" alt="Selected fundus"/>:<FundusPlaceholder/>}</div><div className="text-sm leading-6 text-muted"><b className="text-ink">{patient.name}</b><br/>{patient.id} · {patient.eye}<br/>{file?.name || "Demo image"}</div></div>
   {error&&<ErrorBox text={error}/>}<div className="mt-6 flex justify-end gap-2"><button className="btn-secondary" onClick={()=>setStep(2)}><RefreshCw size={16}/>Retake image</button><button className="btn-primary" onClick={analyze}><Activity size={16}/>Submit for analysis</button></div>
  </div>}
  {step==="analyzing"&&<div className="card flex flex-col items-center justify-center p-14 text-center"><div className="spinner"/><div className="mt-4 text-sm text-muted">Running quality checks, classifier, and explanation…</div><div className="mt-1 text-xs text-faint">This may take a few seconds.</div></div>}
  {step==="rejected"&&<div className="card p-8 text-center"><AlertTriangle className="mx-auto text-g3" size={34}/><h3 className="serif mt-3 text-xl font-semibold">Image couldn't be graded</h3><p className="mx-auto mt-2 max-w-md rounded-md bg-[#FBEAE7] px-3 py-2 font-mono text-xs text-[#A33420]">{error||"Image quality was not acceptable."}</p><p className="mx-auto mt-4 max-w-md text-xs leading-5 text-muted">No grade is produced when the backend rejects the image. Recapture with better focus, illumination, or field of view.</p><button className="btn-primary mt-6" onClick={()=>setStep(2)}><Camera size={16}/>Retake image</button></div>}
 </div>
}
function Field({label,children}:{label:string;children:React.ReactNode}){return <div className="field"><label>{label}</label>{children}</div>}
function ErrorBox({text}:{text:string}){return <div className="mt-4 flex gap-2 rounded-md border border-[#F1C5BD] bg-[#FBEAE7] p-3 text-xs text-[#A33420]"><AlertTriangle size={16} className="shrink-0"/>{text}</div>}

function printAs(mode: "full"|"slip") {
  document.body.setAttribute("data-print-mode", mode);
  requestAnimationFrame(() => window.print());
}

function ReferralSlip({result,patient}:{result:Result;patient:Patient}) {
  const ref = REFERRAL[result.grade];
  const today = new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
  return <div id="print-slip" className="fixed -left-[9999px] top-0 w-[380px] bg-white p-8 text-ink">
    <div className="border-b-2 border-ink pb-3"><div className="serif text-lg font-semibold">Netra Screen</div><div className="text-[10px] text-muted">AI-Assisted Diabetic Retinopathy Screening</div></div>
    <div className="mt-4 text-xs leading-6"><div><b>Patient:</b> {patient.name}</div><div><b>ID:</b> {patient.id}</div><div><b>Eye:</b> {patient.eye}</div><div><b>Date:</b> {today}</div></div>
    <div className="mt-4 rounded-md p-3 text-white" style={{background:GRADE_COLORS[result.grade]}}><div className="text-[10px] uppercase tracking-wide text-white/80">Screening result</div><div className="serif text-base font-semibold">{result.label}</div></div>
    <div className="mt-4 text-sm leading-6"><b>{ref[0]}</b><br/><span className="text-xs text-muted">{ref[1]}</span></div>
    <p className="mt-3 text-xs leading-5 text-muted">Please bring this slip to your ophthalmology appointment. This is an AI-assisted screening result and does not replace clinical diagnosis.</p>
    <div className="mt-8 flex justify-between text-[10px] text-muted"><div className="w-28 border-t border-ink pt-1">Technician</div><div className="w-28 border-t border-ink pt-1">Camp stamp</div></div>
  </div>;
}

function Results({result,patient,preview,heat,setHeat,note,setNote,onConfirm,onRecapture}:{result:Result;patient:Patient;preview:string;heat:boolean;setHeat:(v:boolean)=>void;note:string;setNote:(v:string)=>void;onConfirm:()=>void;onRecapture:()=>void}) {
 const ref=REFERRAL[result.grade];
 const heatSrc=imageUrl(result.heatmapUrl);
 useEffect(() => {
   const reset = () => document.body.removeAttribute("data-print-mode");
   window.addEventListener("afterprint", reset);
   return () => window.removeEventListener("afterprint", reset);
 }, []);
 return <div className="mx-auto max-w-[1020px]">
  <ReferralSlip result={result} patient={patient}/>
  <div className="flex flex-col justify-between gap-4 border-b-2 border-ink pb-4 sm:flex-row"><div><h2 className="serif text-2xl font-semibold">Screening report</h2><div className="mt-1.5 text-xs leading-5 text-muted"><b className="text-ink">{patient.name}</b> · ID <b className="mono text-ink">{patient.id}</b> · Eye <b className="text-ink">{patient.eye==="Right (OD)"?"OD":"OS"}</b> · Age {patient.age} · Diabetes duration {patient.diabetesYears}y</div></div><div className="flex gap-2"><button className="btn-secondary" onClick={()=>printAs("slip")}><FileText size={15}/>Referral slip</button><button className="btn-primary bg-ink hover:bg-[#233A47]" onClick={()=>printAs("full")}><Download size={15}/>Print / PDF</button></div></div>
  <div className="my-5 grid overflow-hidden rounded-[10px] bg-navy shadow-card sm:grid-cols-3">
   <Quick label="ICDR severity grade" value={`${result.grade} — ${result.label}`} sub="International Clinical DR scale, 0–4" color={GRADE_COLORS[result.grade]}/>
   <Quick label="Model confidence" value={`${Math.round(result.confidence*100)}%`} sub="Probability returned by model"/>
   <div className="p-4 sm:px-5" style={{background:ref[2]?GRADE_COLORS[result.grade]:"#2E9E6B"}}><div className="text-[10px] font-semibold uppercase tracking-wide text-white/75">Referral status</div><div className="serif mt-1 text-base font-semibold text-white">{ref[0]}</div><div className="mt-1 text-[11px] text-white/80">{ref[1]}</div></div>
  </div>
  <div id="print-full" className="grid border-t border-line md:grid-cols-2">
   <div className="border-b border-line py-6 md:border-b-0 md:border-r md:pr-7"><div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-faint">Fundus image & model attention</div><div className="mx-auto aspect-square max-w-[470px] overflow-hidden rounded-full border border-line bg-[#1a0f0a]">{heat ? (heatSrc?<img src={heatSrc} alt="Grad-CAM heatmap" className="h-full w-full object-cover"/>:<FundusPlaceholder heat/>) : (preview?<img src={preview} alt="Fundus" className="h-full w-full object-cover"/>:<FundusPlaceholder/>)}</div><div className="mt-3 flex justify-center gap-1.5"><button className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold ${!heat?"bg-ink text-white":"border-line text-muted"}`} onClick={()=>setHeat(false)}>Original</button><button className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold ${heat?"bg-ink text-white":"border-line text-muted"}`} onClick={()=>setHeat(true)}>Grad-CAM overlay</button></div><p className="mt-2 text-center text-[11px] text-faint">Highlighted regions represent model attention; they are not a lesion segmentation or diagnosis.</p>
    <div className="mt-7 text-[11px] font-semibold uppercase tracking-wide text-faint">Grading scale position</div><div className="mt-2 flex gap-1">{GRADE_COLORS.map((c,i)=><div key={c} className="h-1.5 flex-1 rounded" style={{background:c,opacity:i===result.grade?1:.28}}/>)}</div><div className="mt-1 flex justify-between text-[10px] text-faint"><span>0 No DR</span><span>1 Mild</span><span>2 Moderate</span><span>3 Severe</span><span>4 PDR</span></div>
   </div>
   <div className="py-6 md:pl-7"><div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-faint">Class probability breakdown</div>{GRADE_ORDER.map((k,i)=>{const pct=Math.round((result.probabilities[k]||0)*100);return <div className={`flex items-center gap-2.5 py-1.5 ${k===result.key?"rounded-md bg-teal-tint px-2.5":""}`} key={k}><div className="w-[125px] shrink-0 text-xs font-semibold text-muted">{i} · {GRADE_LABEL[i]}</div><div className="h-2 flex-1 overflow-hidden rounded-full bg-[#EAEFEE]"><div className="h-full rounded-full" style={{width:`${pct}%`,background:GRADE_COLORS[i]}}/></div><div className="mono w-9 text-right text-xs text-muted">{pct}%</div></div>})}
    <div className="mt-4 rounded-md bg-[#EAEFEE] p-4 text-xs leading-6 text-muted"><b className="text-ink">Why {result.label}:</b> {CLINICAL_BASIS[result.grade]}</div>
    <div className="mt-4 rounded-md border border-[#C7E4DF] bg-teal-tint p-4"><div className="text-xs font-bold uppercase tracking-wide text-teal-dark">Recommendation</div><p className="mt-1.5 text-sm leading-5 text-ink">{ref[2]?`Referable DR. ${ref[0].toLowerCase()}. Advise sooner if the patient reports any change in vision.`:"No referable disease detected today. Encourage the patient to keep up their regular screening schedule."}</p></div>
    <div className="mt-6 border-t border-line pt-5"><div className="text-[11px] font-semibold uppercase tracking-wide text-faint">Close out this screening</div><textarea value={note} onChange={e=>setNote(e.target.value)} className="mt-2 min-h-16 w-full resize-y rounded-md border border-line px-3 py-2 text-xs outline-none focus:border-teal" placeholder="Optional note — e.g. patient advised…"/><div className="mt-3 flex gap-2"><button className="btn-primary bg-g0 hover:bg-[#27875b]" onClick={onConfirm}><Check size={16}/>Confirm & complete</button><button className="btn-secondary" onClick={onRecapture}>Flag for recapture</button></div></div>
   </div>
  </div>
  <div className="mt-5 flex items-start gap-2 border-t border-line pt-4 text-[11px] leading-5 text-faint"><ShieldCheck size={15} className="mt-0.5 shrink-0"/><span>AI-assisted screening prototype. The result is intended for referral triage and must not replace clinical diagnosis. Confirm referable results with an eye-care professional.</span></div>
 </div>
}
function Quick({label,value,sub,color}:{label:string;value:string;sub:string;color?:string}){return <div className="p-4 sm:px-5"><div className="text-[10px] font-semibold uppercase tracking-wide text-[#8FA6AD]">{label}</div><div className="serif mt-1 flex items-center gap-2 text-xl font-semibold text-white">{color&&<span className="h-3 w-3 rounded-full" style={{background:color}}/>}{value}</div><div className="mt-1 text-[11px] text-[#9FB3B9]">{sub}</div></div>}
