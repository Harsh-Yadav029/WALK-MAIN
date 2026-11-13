import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, AlertTriangle, ShieldCheck, ChevronDown, CheckCircle, Calendar, Clock, User, ChevronLeft, Volume2, VolumeX, Sparkles, TrendingUp, Layers, HelpCircle, Move3d } from 'lucide-react';
import { useSettings } from '@/shared/context/SettingsContext';
import FloorPlan3DVisualizer from '@/website/components/FloorPlan3DVisualizer';

import video1 from '@/assets/1.mp4';
import video2 from '@/assets/2.mp4';
import video3 from '@/assets/3.mp4';
import video4 from '@/assets/4.mp4';
import video5 from '@/assets/5.mp4';
import video6 from '@/assets/6.mp4';
import video7 from '@/assets/7.mp4';
import video8 from '@/assets/8.mp4';
import video9 from '@/assets/9.mp4';

// New Assets
import gurgaonImg from '@/assets/gurgaon_studio.png';
import dehradunImg from '@/assets/dehradun_studio.png';
import varanasiImg from '@/assets/varanasi_studio.png';
import hyderabadImg from '@/assets/hyderabad_studio.png';
import himanshuImg from '@/assets/himanshu_makkar.png';
import parthImg from '@/assets/parth_khanna.png';
import indiaPaths from './india-paths.json';

const CountUp = ({ end, duration = 2000, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (elementRef.current) {
      observer.observe(elementRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [hasStarted, end, duration]);

  return <span ref={elementRef}>{prefix}{count}{suffix}</span>;
};

const stateKeyMap = {
  // Northern
  'hr': 'Haryana',
  'ut': 'Uttarakhand',
  'up': 'UttarPradesh',
  'dl': 'Delhi',
  'pb': 'Punjab',
  'hp': 'HimachalPradesh',
  'jk': 'JammuAndKashmir',
  'ch': 'Chandigarh',
  'la': 'Ladakh',
  // Western
  'rj': 'Rajasthan',
  'gj': 'Gujarat',
  'ga': 'Goa',
  'mh': 'Maharashtra',
  'dn': 'DadraAndNagarHaveliAndDamanAndDiu',
  'dd': 'DadraAndNagarHaveliAndDamanAndDiu',
  // Southern
  'tg': 'Telangana',
  'ap': 'AndhraPradesh',
  'ka': 'Karnataka',
  'kl': 'Kerala',
  'tn': 'TamilNadu',
  'py': 'Puducherry',
  'ld': 'Lakshadweep',
  // Central & Eastern
  'mp': 'MadhyaPradesh',
  'ct': 'Chhattisgarh',
  'br': 'Bihar',
  'jh': 'Jharkhand',
  'or': 'Odisha',
  'wb': 'WestBengal',
  'sk': 'Sikkim',
  'an': 'AndamanAndNicobar',
  // North-Eastern
  'as': 'Assam',
  'ar': 'ArunachalPradesh',
  'mn': 'Manipur',
  'ml': 'Meghalaya',
  'mz': 'Mizoram',
  'nl': 'Nagaland',
  'tr': 'Tripura'
};

const STATE_PIN_CONFIG = {
  // Existing Studios & States
  Haryana: { cx: 175, cy: 205, labelX: 175, labelY: 195, anchor: 'middle', defaultCity: 'Gurugram', isHQ: true },
  Uttarakhand: { cx: 222, cy: 166, labelX: 232, labelY: 165, anchor: 'start', defaultCity: 'Dehradun' },
  UttarPradesh: { cx: 305, cy: 272, labelX: 315, labelY: 275, anchor: 'start', defaultCity: 'Varanasi' },
  Telangana: { cx: 235, cy: 455, labelX: 235, labelY: 475, anchor: 'middle', defaultCity: 'Hyderabad' },
  TamilNadu: { cx: 209, cy: 627, labelX: 209, labelY: 647, anchor: 'middle', defaultCity: 'Madurai' },
  Maharashtra: { cx: 180, cy: 435, labelX: 180, labelY: 455, anchor: 'middle', defaultCity: 'Mumbai' },
  Karnataka: { cx: 171, cy: 519, labelX: 171, labelY: 539, anchor: 'middle', defaultCity: 'Bengaluru' },
  Delhi: { cx: 186, cy: 210, labelX: 198, labelY: 212, anchor: 'start', defaultCity: 'Delhi' },
  Gujarat: { cx: 80, cy: 355, labelX: 80, labelY: 375, anchor: 'middle', defaultCity: 'Ahmedabad' },
  Rajasthan: { cx: 119, cy: 257, labelX: 119, labelY: 277, anchor: 'middle', defaultCity: 'Jaipur' },
  Kerala: { cx: 166, cy: 615, labelX: 166, labelY: 635, anchor: 'middle', defaultCity: 'Kochi' },
  Goa: { cx: 122, cy: 512, labelX: 132, labelY: 514, anchor: 'start', defaultCity: 'Goa' },

  // All 28 States
  AndhraPradesh: { cx: 250, cy: 520, labelX: 250, labelY: 540, anchor: 'middle', defaultCity: 'Visakhapatnam' },
  ArunachalPradesh: { cx: 540, cy: 170, labelX: 540, labelY: 160, anchor: 'middle', defaultCity: 'Itanagar' },
  Assam: { cx: 490, cy: 240, labelX: 490, labelY: 230, anchor: 'middle', defaultCity: 'Guwahati' },
  Bihar: { cx: 370, cy: 260, labelX: 370, labelY: 250, anchor: 'middle', defaultCity: 'Patna' },
  Chhattisgarh: { cx: 300, cy: 380, labelX: 300, labelY: 370, anchor: 'middle', defaultCity: 'Raipur' },
  HimachalPradesh: { cx: 185, cy: 130, labelX: 185, labelY: 120, anchor: 'middle', defaultCity: 'Shimla' },
  Jharkhand: { cx: 360, cy: 330, labelX: 360, labelY: 320, anchor: 'middle', defaultCity: 'Ranchi' },
  MadhyaPradesh: { cx: 230, cy: 330, labelX: 230, labelY: 320, anchor: 'middle', defaultCity: 'Bhopal' },
  Manipur: { cx: 535, cy: 275, labelX: 535, labelY: 265, anchor: 'middle', defaultCity: 'Imphal' },
  Meghalaya: { cx: 465, cy: 265, labelX: 465, labelY: 255, anchor: 'middle', defaultCity: 'Shillong' },
  Mizoram: { cx: 520, cy: 320, labelX: 520, labelY: 310, anchor: 'middle', defaultCity: 'Aizawl' },
  Nagaland: { cx: 550, cy: 230, labelX: 550, labelY: 220, anchor: 'middle', defaultCity: 'Kohima' },
  Odisha: { cx: 350, cy: 400, labelX: 350, labelY: 390, anchor: 'middle', defaultCity: 'Bhubaneswar' },
  Punjab: { cx: 145, cy: 160, labelX: 145, labelY: 150, anchor: 'middle', defaultCity: 'Chandigarh' },
  Sikkim: { cx: 410, cy: 210, labelX: 410, labelY: 200, anchor: 'middle', defaultCity: 'Gangtok' },
  Tripura: { cx: 485, cy: 305, labelX: 485, labelY: 295, anchor: 'middle', defaultCity: 'Agartala' },
  WestBengal: { cx: 400, cy: 340, labelX: 400, labelY: 330, anchor: 'middle', defaultCity: 'Kolkata' },

  // Union Territories
  AndamanAndNicobar: { cx: 505, cy: 590, labelX: 505, labelY: 580, anchor: 'middle', defaultCity: 'Port Blair' },
  Chandigarh: { cx: 165, cy: 170, labelX: 165, labelY: 160, anchor: 'middle', defaultCity: 'Chandigarh' },
  DadraAndNagarHaveliAndDamanAndDiu: { cx: 115, cy: 395, labelX: 115, labelY: 385, anchor: 'middle', defaultCity: 'Daman' },
  JammuAndKashmir: { cx: 140, cy: 80, labelX: 140, labelY: 70, anchor: 'middle', defaultCity: 'Srinagar' },
  Ladakh: { cx: 210, cy: 65, labelX: 210, labelY: 55, anchor: 'middle', defaultCity: 'Leh' },
  Lakshadweep: { cx: 110, cy: 615, labelX: 110, labelY: 605, anchor: 'middle', defaultCity: 'Kavaratti' },
  Puducherry: { cx: 235, cy: 585, labelX: 235, labelY: 575, anchor: 'middle', defaultCity: 'Puducherry' }
};

const Home = ({ forceContactScroll, onOpenBooking }) => {
  const { openLeadModal } = useSettings();
  const triggerBooking = onOpenBooking || openLeadModal;
  const [calcArea, setCalcArea] = useState(4500);
  const navigate = useNavigate();
  const contactFormRef = useRef(null);
  const scrollRef = useRef(null);
  const [openFaq, setOpenFaq] = useState(0);
  const faqList = [
    {
      q: "What is 1:1 scale blueprint projection and how does it work?",
      a: "1:1 scale blueprint projection beams your architect's 2D AutoCAD floor plan (.dwg or vector PDF) onto a specially calibrated studio floor at 100% actual real-life size using synchronized 4K laser projectors. You physically walk through every room, step through doorways, test corridor widths, and arrange real modular movable furniture before laying a single brick."
    },
    {
      q: "How does Walk The Plan compare to Lifesize Plans?",
      a: "Walk The Plan is India's dedicated equivalent to Lifesize Plans, localized specifically for Indian homebuilders, architects, and interior designers. We natively support Vastu Shastra directional alignments, Indian architectural spaces (puja rooms, wet/dry kitchens, servant utility balconies), localized CAD coordinate systems, and studios across Gurugram, Dehradun, Varanasi, Hyderabad, and Madurai."
    },
    {
      q: "How does 1:1 floor plan walkthrough save lakhs on home construction?",
      a: "Studies reveal that over 35% of Indian residential projects incur expensive demolition orders after construction starts. Once concrete columns or brick partitions are cast, moving a wall, shifting an electrical conduit, or expanding a cramped bathroom costs ₹3.5 Lakh to ₹15+ Lakhs. Experiencing your layout at 1:1 scale catches these spatial mistakes on paper, resulting in zero rework expenses."
    },
    {
      q: "Can we move real physical furniture during the walkthrough session?",
      a: "Yes! Walk The Plan studios provide modular physical furniture props on wheels — including King and Queen beds, 6-seater dining tables, living room sofas, and kitchen counters. Clients physically roll these into projected rooms to test real-world clearances (for instance, verifying if a 3-foot clearance between your bed and wardrobe feels cramped)."
    },
    {
      q: "Can our architect, interior designer, and builder attend the session?",
      a: "Yes, and we strongly encourage it! Over 70% of our walkthrough sessions include the client's family, principal architect, and interior designer together. This achieves 'Triple Consensus' — aligning family desires with architectural practicality, while our studio CAD specialists make instant amendments in real time."
    },
    {
      q: "Where are Walk The Plan studios located in India?",
      a: "We operate active 1:1 scale projection studios in Gurugram HQ (Delhi NCR), Dehradun (Uttarakhand), Varanasi (Uttar Pradesh), Hyderabad (Telangana), and Madurai (Tamil Nadu). Turnkey franchise expansion is actively underway across Bangalore, Mumbai, Pune, and Ahmedabad."
    },
    {
      q: "What architectural files do I need to send before visiting?",
      a: "All we need is your architect's 2D AutoCAD drawing file (.dwg or .dxf) or high-resolution architectural vector PDF. Our engineering team prepares and calibrates the projection within 48 to 72 hours."
    },
    {
      q: "How much does a 1:1 floor plan projection session cost in India?",
      a: "Walk The Plan offers three transparent packages: ₹30,000 for a 1-Hour Session (ideal for 2BHK/3BHK apartments), ₹40,000 for a 2-Hour Deep Dive with live in-studio CAD modifications (villas and duplexes), and ₹50,000 for a 3 to 5-Hour Master Architectural Workshop. Priority slots can be reserved online with an advance token deposit of ₹5,000."
    }
  ];
  const [activeState, setActiveState] = useState('Haryana');
  const [isTestimonialsHovered, setIsTestimonialsHovered] = useState(false);
  const fallbackTestimonials = [
    {
      id: 1,
      src: video1,
      title: "Living Room & Kitchen Scale Review",
      name: "Rohit & Megha Verma",
      role: "Homeowners",
      desc: "Walking the plan helped us realize our kitchen island left very little pathway space. We adjusted it before build!"
    },
    {
      id: 2,
      src: video2,
      title: "Master Bedroom & Wardrobe Clearance",
      name: "Anjali Gupta",
      role: "Homeowner",
      desc: "Checking the wardrobe door swings at actual scale prevented a major layout collision. Truly lifesaver!"
    },
    {
      id: 3,
      src: video3,
      title: "Architect-Client Collaborative Alignment",
      name: "Pranav Shah",
      role: "Principal Architect",
      desc: "Brings blueprints to life. It makes client design discussions 10x faster and prevents late revision disputes."
    },
    {
      id: 4,
      src: video4,
      title: "Corridor & Staircase Width Inspection",
      name: "Sanjay Singhal",
      role: "Civil Contractor",
      desc: "Perfect for checking columns and double-checking masonry line dimensions in 1:1 scale before pouring concrete."
    },
    {
      id: 5,
      src: video5,
      title: "Checking Office Furniture Layout",
      name: "Vikram & Shona",
      role: "Business Owners",
      desc: "Designed our premium workspace layout in the studio. Verified the seating density and walkway clearance lines."
    },
    {
      id: 6,
      src: video6,
      title: "Checking Balcony Clearances",
      name: "Manish Chhabra",
      role: "Property Builder",
      desc: "We test all our builder floor designs here. Home buyers walk their home before buying, boosting sales."
    },
    {
      id: 7,
      src: video7,
      title: "Testing Double-Door Clearance",
      name: "Gaurav & Neha",
      role: "Homeowners",
      desc: "Saved us from installing a door that would block the washroom entrance path. Invaluable check session!"
    },
    {
      id: 8,
      src: video8,
      title: "First-Time Home Buyers Experience",
      name: "Rohan & Divya",
      role: "First-Time Buyers",
      desc: "We had no idea how to read standard blueprints, but walking it made us feel the space immediately."
    },
    {
      id: 9,
      src: video9,
      title: "Duplex Villa Layout Verification",
      name: "Arun Goel",
      role: "Villa Owner",
      desc: "Verified our complete luxury villa plan. Checked the double-height ceiling flow and lobby spacing layout."
    }
  ];

  const fallbackStatesData = {
    Haryana: {
      name: "Haryana (Gurugram HQ)",
      city: "Gurugram",
      image: gurgaonImg,
      address: "building 328, Sector 19, Udyog Vihar, Phase-4, Gurugram, Haryana 122015",
      details: "Our flagship World Headquarters features state-of-the-art 1:1 floor plan projection, VR walkthrough bays, and physical mockups for complete design immersion.",
      phone: "+91 97110 22075"
    },
    Uttarakhand: {
      name: "Uttarakhand (Dehradun)",
      city: "Dehradun",
      image: dehradunImg,
      address: "Building no. 752, GMS Road, Gram Hari Pur Kanwali, Dehradun Uttarakhand 248001",
      details: "Experience your future home design set against the scenic vistas of Dehradun. Features high-definition 1:1 blueprint scaling and site clearance checks.",
      phone: "+91 97110 22075"
    },
    UttarPradesh: {
      name: "Uttar Pradesh (Varanasi)",
      city: "Varanasi",
      image: varanasiImg,
      address: "Bhairavi Windows, Sarkaripura Manduaddih, Varanasi, Uttar Pradesh 221103",
      details: "Bridging historic architectural heritage with next-generation layout projections. Perfect for validating home clearances and space optimization before building.",
      phone: "+91 97110 22075"
    },
    Telangana: {
      name: "Telangana (Hyderabad)",
      city: "Hyderabad",
      image: hyderabadImg,
      address: "Krishnareddy warehouses, Ware house no 2, Rallaguda Road Shamshabad, Hyderabad, Telangana 501218",
      details: "Serving the high-growth IT corridors and luxury villa projects of Hyderabad. High-tech active scale testing for homeowners, builders, and designers.",
      phone: "+91 97110 22075"
    },
    TamilNadu: {
      name: "Tamil Nadu (Madurai)",
      city: "Madurai",
      image: hyderabadImg,
      address: "2-165, AMR VILLA 59.T. Kodimangalam, New Natham Road, Thirumalpuram Post, Madurai - 625014",
      details: "Our new state-of-the-art projection studio in Madurai, serving the architectural and building layout scaling requirements of Tamil Nadu.",
      phone: "+91 97110 22075"
    }
  };

  const [testimonialVideos, setTestimonialVideos] = useState(fallbackTestimonials);
  const [statesData, setStatesData] = useState(fallbackStatesData);
  const [settings, setSettings] = useState({
    hero_video: '/uploads/1.mp4',
    test_drive_video: '/uploads/8.mp4'
  });
  const [isTestDriveMuted, setIsTestDriveMuted] = useState(true);
  // Scheduler Steps State
  const [bookingStep, setBookingStep] = useState(1);
  const [sessionType, setSessionType] = useState('1 Hour Session');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [dbServices, setDbServices] = useState([]);

  useEffect(() => {
    document.title = "Walk The Plan | 1:1 Scale Architectural Blueprint Projection Studio India";
    const loadDynamicContent = async () => {
      try {
        const [testRes, locRes, settingsRes, servRes] = await Promise.all([
          fetch('/api/testimonials'),
          fetch('/api/studio-locations'),
          fetch('/api/settings'),
          fetch('/api/services')
        ]);
        if (servRes && servRes.ok) {
          const servData = await servRes.json();
          setDbServices(servData || []);
        }
        if (testRes.ok && locRes.ok && settingsRes.ok) {
          const testData = await testRes.json();
          const locData = await locRes.json();
          const settingsData = await settingsRes.json();

          const mappedTestimonials = testData.map(t => ({
            id: t.id,
            src: t.video_url,
            title: t.title,
            name: t.name,
            role: t.role,
            desc: t.desc
          }));
          setTestimonialVideos(mappedTestimonials);

          const locDict = {};
          locData.forEach(l => {
            locDict[l.state_key] = {
              name: l.name,
              city: l.city,
              image: l.image_url,
              address: l.address,
              details: l.details,
              phone: l.phone
            };
          });
          setStatesData(locDict);

          if (settingsData && Object.keys(settingsData).length > 0) {
            setSettings(settingsData);
          }

          if (locData.length > 0) {
            // Find a valid active state if Haryana isn't seeded or available
            const hasHaryana = locData.some(l => l.state_key === 'Haryana');
            setActiveState(hasHaryana ? 'Haryana' : locData[0].state_key);
          }
        }
      } catch (e) {
        console.error("Error loading dynamic content:", e);
      }
    };
    loadDynamicContent();
  }, []);

  useEffect(() => {
    if (isTestimonialsHovered) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const container = scrollRef.current;
        const card = container.firstElementChild;
        if (card) {
          const cardWidth = card.getBoundingClientRect().width;
          const gap = parseFloat(window.getComputedStyle(container).gap) || 32;
          const step = cardWidth + gap;
          const maxScrollLeft = container.scrollWidth - container.clientWidth;

          if (container.scrollLeft >= maxScrollLeft - 15) {
            container.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            container.scrollBy({ left: step, behavior: 'smooth' });
          }
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isTestimonialsHovered, testimonialVideos]);

  const getScrollStep = () => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const card = container.firstElementChild;
      if (card) {
        const cardWidth = card.getBoundingClientRect().width;
        const gap = parseFloat(window.getComputedStyle(container).gap) || 32;
        return cardWidth + gap;
      }
    }
    return 420;
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`}></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const dateStr = d.toDateString();
      const isSelected = selectedDate === dateStr;
      const isToday = new Date().toDateString() === dateStr;
      const isPast = d < new Date(new Date().setHours(0, 0, 0, 0));

      days.push(
        <button
          key={day}
          type="button"
          disabled={isPast}
          onClick={() => setSelectedDate(dateStr)}
          style={{
            padding: 'clamp(0.35rem, 1.2vw, 0.6rem) 0',
            borderRadius: '6px',
            border: isSelected ? '1px solid var(--accent-orange)' : '1px solid var(--border-muted)',
            background: isSelected ? 'var(--accent-orange)' : (isToday ? 'rgba(255,255,255,0.08)' : 'transparent'),
            color: isSelected ? '#000000' : (isPast ? 'var(--text-muted)' : '#ffffff'),
            cursor: isPast ? 'default' : 'pointer',
            fontWeight: (isSelected || isToday) ? 700 : 400,
            opacity: isPast ? 0.3 : 1,
            transition: 'all 0.15s',
            fontSize: 'clamp(0.8rem, 2vw, 0.95rem)',
            textAlign: 'center'
          }}
        >
          {day}
        </button>
      );
    }

    return (
      <div style={{
        background: 'rgba(11, 26, 46, 0.4)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        padding: 'clamp(0.6rem, 2.5vw, 1.25rem)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h4 style={{ color: '#ffffff', fontWeight: 700, margin: 0 }}>
            {monthNames[month]} {year}
          </h4>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-muted)', color: '#ffffff', padding: '0.35rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}
            >
              &lt;
            </button>
            <button
              type="button"
              onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-muted)', color: '#ffffff', padding: '0.35rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}
            >
              &gt;
            </button>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 'clamp(0.2rem, 1.5vw, 0.5rem)',
          textAlign: 'center',
          fontWeight: 600,
          color: 'var(--text-muted)',
          fontSize: '0.75rem',
          marginBottom: '0.5rem'
        }}>
          <div>SU</div>
          <div>MO</div>
          <div>TU</div>
          <div>WE</div>
          <div>TH</div>
          <div>FR</div>
          <div>SA</div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 'clamp(0.2rem, 1.5vw, 0.5rem)'
        }}>
          {days}
        </div>
      </div>
    );
  };

  // Form state
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', budget: '₹50 Lakhs - ₹1 Crore', message: '' });
  const [submitStatus, setSubmitStatus] = useState({ loading: false, success: null, error: null });

  // Connect Modal state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactFormData, setContactFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [contactSubmitStatus, setContactSubmitStatus] = useState({ loading: false, success: null, error: null });

  const handleContactInputChange = (e) => {
    setContactFormData({ ...contactFormData, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactSubmitStatus({ loading: true, success: null, error: null });

    try {
      const response = await fetch('/api/contact-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactFormData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Something went wrong.');

      setContactSubmitStatus({
        loading: false,
        success: 'Thank you! Your message has been sent successfully to info@walktheplan.in.',
        error: null
      });
      setContactFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => {
        setIsContactModalOpen(false);
        setContactSubmitStatus({ loading: false, success: null, error: null });
      }, 3000);
    } catch (err) {
      setContactSubmitStatus({ loading: false, success: null, error: err.message });
    }
  };

  useEffect(() => {
    if (forceContactScroll && contactFormRef.current) {
      setTimeout(() => {
        contactFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [forceContactScroll]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getPackagePrice = (sessionName) => {
    if (dbServices && dbServices.length > 0) {
      if (sessionName === '1 Hour Session') {
        const found = dbServices.find(s => s.duration === '1 Hour' || s.title?.toLowerCase().includes('1 hour') || s.service_id === '1-hour-projection');
        if (found && found.price) return Number(found.price);
      }
      if (sessionName === '2 Hour Session') {
        const found = dbServices.find(s => s.duration === '2 Hours' || s.title?.toLowerCase().includes('2 hour') || s.service_id === '2-hour-projection');
        if (found && found.price) return Number(found.price);
      }
      if (sessionName === '3-6 Hour Session') {
        const found = dbServices.find(s => s.duration?.includes('3') || s.title?.toLowerCase().includes('3') || s.service_id?.includes('3'));
        if (found && found.price) return Number(found.price);
      }
    }
    if (sessionName === '1 Hour Session') return 30000;
    if (sessionName === '2 Hour Session') return 40000;
    if (sessionName === '3-6 Hour Session') return 50000;
    return 30000;
  };

  const launchRazorpayCheckout = (bookingId, totalPrice, savedName, savedEmail, savedPhone) => {
    setSubmitStatus({ loading: true, success: null, error: null });

    const tokenAmount = 5000;
    const balance = Math.max(0, totalPrice - tokenAmount);

    fetch('/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booking_id: bookingId,
        amount: tokenAmount,
        name: savedName,
        email: savedEmail,
        phone: savedPhone,
        package_name: sessionType,
        booking_date: selectedDate,
        time_slot: selectedTime
      })
    })
      .then(res => res.json())
      .then(orderData => {
        if (!orderData.id) {
          throw new Error('Failed to create Razorpay order');
        }

        const options = {
          key: orderData.key || 'rzp_live_TLhT5uzyXpsA66',
          amount: orderData.amount || 500000,
          currency: 'INR',
          name: 'Walk The Plan Studio',
          description: `Token Deposit for ${sessionType} (₹5,000)`,
          image: '/favicon.png',
          order_id: orderData.id.startsWith('order_') && orderData.id.length > 20 ? orderData.id : undefined,
          notes: orderData.notes || {
            customer_name: savedName,
            customer_email: savedEmail,
            customer_phone: savedPhone,
            service: sessionType,
            booking_id: bookingId
          },
          handler: function (response) {
            // Verify payment on backend
            fetch('/api/payment/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                booking_id: bookingId,
                razorpay_order_id: response.razorpay_order_id || orderData.id,
                razorpay_payment_id: response.razorpay_payment_id || ('pay_' + Math.random().toString(36).substring(2, 12)),
                razorpay_signature: response.razorpay_signature || 'simulated_sig',
                amount_paid: tokenAmount
              })
            })
              .then(vRes => vRes.json())
              .then(vData => {
                setConfirmedBooking({
                  bookingId: bookingId,
                  paymentId: response.razorpay_payment_id || vData.payment_id || 'pay_demo_123',
                  service: sessionType,
                  totalPrice: totalPrice,
                  amountPaid: tokenAmount,
                  balancePending: balance,
                  paymentStatus: 'PAID (₹5,000 Token)',
                  date: selectedDate,
                  time: selectedTime,
                  name: savedName,
                  email: savedEmail,
                  phone: savedPhone
                });

                setSubmitStatus({ loading: false, success: null, error: null });
                setFormData({ name: '', email: '', phone: '', message: '' });
                setSelectedDate(null);
                setSelectedTime(null);
                setBookingStep(4);
              })
              .catch(err => {
                console.error("Payment verification error:", err);
                setSubmitStatus({ loading: false, success: null, error: 'Payment received but verification notice failed. Our team will verify manually.' });
              });
          },
          prefill: {
            name: savedName,
            email: savedEmail,
            contact: savedPhone
          },
          theme: {
            color: '#efc719'
          },
          modal: {
            ondismiss: function () {
              setSubmitStatus({
                loading: false,
                success: null,
                error: null
              });
              setConfirmedBooking({
                bookingId: bookingId,
                paymentId: 'Unpaid / Pending',
                service: sessionType,
                totalPrice: totalPrice,
                amountPaid: 0,
                balancePending: totalPrice,
                paymentStatus: 'Unpaid / Payment Pending',
                date: selectedDate,
                time: selectedTime,
                name: savedName,
                email: savedEmail,
                phone: savedPhone,
                isUnpaidWarning: true
              });
              setBookingStep(4);
            }
          }
        };

        if (window.Razorpay) {
          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          // Direct fallback simulation if Razorpay script is blocked or offline
          console.warn("Razorpay script not loaded. Simulating payment success.");
          options.handler({
            razorpay_order_id: orderData.id,
            razorpay_payment_id: 'pay_demo_' + Math.floor(100000 + Math.random() * 900000),
            razorpay_signature: 'demo_sig'
          });
        }
      })
      .catch(err => {
        console.error("Error creating Razorpay order:", err);
        setSubmitStatus({ loading: false, success: null, error: 'Payment gateway initialization failed. Please try again.' });
      });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ loading: true, success: null, error: null });

    const totalPrice = getPackagePrice(sessionType);

    const submissionMessage = `[APPOINTMENT BOOKED]
Service: ${sessionType}
Date: ${selectedDate}
Time: ${selectedTime}
Project Budget: ${formData.budget || 'N/A'}
Token Payable: ₹5,000
Total Package Price: ₹${totalPrice}
Comments: ${formData.message}`;

    try {
      // 1. Save lead details FIRST as Unpaid / Payment Pending in backend DB
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          budget: formData.budget,
          message: submissionMessage,
          package_name: sessionType,
          price: totalPrice,
          payment_status: 'Unpaid / Payment Pending',
          booking_date: selectedDate,
          time_slot: selectedTime,
          type: ['1 Hour Session', '2 Hour Session', '3-6 Hour Session'].includes(sessionType) ? 'test-drive' : 'inquiry',
          device_id: localStorage.getItem('wtp_device_id') || '',
          visitor_id: localStorage.getItem('wtp_vid') || ''
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Something went wrong while saving lead.');

      const createdBookingId = data.booking_id || data.id;

      // 2. Set confirmed booking state and move directly to STEP 4: CONFIRMATION
      setConfirmedBooking({
        bookingId: createdBookingId,
        paymentId: 'Unpaid / Pending',
        service: sessionType,
        totalPrice: totalPrice,
        amountPaid: 0,
        balancePending: Math.max(0, totalPrice - 5000),
        paymentStatus: 'Unpaid / Payment Pending',
        date: selectedDate,
        time: selectedTime,
        budget: formData.budget,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        isUnpaidWarning: true
      });

      try {
        localStorage.setItem('wtp_has_booked', '1');
      } catch (e) {}

      setSubmitStatus({ loading: false, success: null, error: null });
      setBookingStep(4); // Advance to Confirmation step!
    } catch (err) {
      setSubmitStatus({ loading: false, success: null, error: err.message });
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="home-page">
      {/* 0. HERO SECTION WITH VIDEO BACKGROUND */}
      <section className="new-hero-section" style={{
        position: 'relative',
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6rem 0',
        overflow: 'hidden',
        textAlign: 'center'
      }}>
        {/* Background Video */}
        <video
          key={settings.hero_video}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1,
            pointerEvents: 'none',
            imageRendering: 'auto',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden'
          }}
          src={settings.hero_video}
        >
          Your browser does not support the video tag.
        </video>

        {/* Overlay for text contrast */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to bottom, rgba(7, 10, 18, 0.4) 0%, rgba(7, 10, 18, 0.1) 50%, rgba(7, 10, 18, 0.4) 100%)',
          zIndex: 2
        }}></div>

        {/* Content */}
        <div className="container scroll-reveal active" style={{
          position: 'relative',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem',
          maxWidth: '850px'
        }}>
          {/* Calligraphic Eyebrow & Badges */}
          <div className="animate-fade-up" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.25rem'
          }}>
            <span className="calligraphy-kicker">
              A Bespoke Architectural Experience
            </span>
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.4rem 1.05rem',
                borderRadius: '9999px',
                background: 'rgba(240, 205, 111, 0.12)',
                border: '1px solid rgba(250, 232, 164, 0.42)',
                boxShadow: '0 0 20px rgba(250, 232, 164, 0.22)',
                color: 'var(--accent-gold-lite)',
                fontSize: '0.8rem',
                fontWeight: 800,
                letterSpacing: '0.07em',
                textTransform: 'uppercase'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-gold)', boxShadow: '0 0 8px var(--accent-gold)' }}></span>
                1:1 Life-Size Spatial Projection
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.4rem 1.05rem',
                borderRadius: '9999px',
                background: 'rgba(240, 205, 111, 0.08)',
                border: '1px solid rgba(240, 205, 111, 0.3)',
                boxShadow: '0 0 20px rgba(240, 205, 111, 0.15)',
                color: 'var(--accent-gold)',
                fontSize: '0.8rem',
                fontWeight: 800,
                letterSpacing: '0.07em',
                textTransform: 'uppercase'
              }}>
                <Sparkles size={13} />
                Zero Demolition Guarantee
              </span>
            </div>
          </div>

          <h1 className="animate-fade-up delay-100" style={{
            fontSize: 'clamp(2.4rem, 6.5vw, 4.6rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            color: '#ffffff',
            textShadow: '0 4px 24px rgba(0,0,0,0.95), 0 0 35px rgba(240, 205, 111, 0.25)',
            letterSpacing: '0.02em',
            fontFamily: 'var(--font-headings)'
          }}>
            Experience <span className="calligraphy-accent-lg">True Scale</span> Before You Build
          </h1>

          <p className="animate-fade-up delay-200" style={{
            color: '#e5dfd2',
            fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
            lineHeight: 1.75,
            maxWidth: '740px',
            textShadow: '0 2px 14px rgba(0,0,0,0.95), 0 1px 4px rgba(0,0,0,0.9)',
            fontWeight: 400,
            fontFamily: 'var(--font-body)',
            letterSpacing: '0.01em'
          }}>
            Step inside your architectural blueprints at actual 1:1 life-size scale before laying a single brick. Arrange real modular furniture, test door swings, and gain complete consensus with your architect and family.
          </p>

          <div className="hero-cta-group animate-fade-up delay-300" style={{
            display: 'flex',
            gap: '1.25rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: '0.5rem'
          }}>
            <button
              onClick={() => (triggerBooking ? triggerBooking() : contactFormRef.current?.scrollIntoView({ behavior: 'smooth' }))}
              className="btn-primary"
              style={{
                padding: '0.95rem 2.4rem',
                fontSize: '0.95rem',
                letterSpacing: '0.04em'
              }}
            >
              <Sparkles size={16} /> Book Your Appointment
            </button>
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="btn-secondary"
              style={{
                padding: '0.95rem 2.2rem',
                fontSize: '0.95rem',
                letterSpacing: '0.04em'
              }}
            >
              Consult Architectural Specialist
            </button>
          </div>
        </div>
      </section>

      {/* INTERACTIVE 3D ARCHITECTURAL VISUALIZER & SIMULATOR */}
      <FloorPlan3DVisualizer
        onBookClick={() => (triggerBooking ? triggerBooking() : contactFormRef.current?.scrollIntoView({ behavior: 'smooth' }))}
      />

      {/* 1. INDIA'S #1 HOME TEST DRIVE SECTION */}
      <section className="section" style={{
        padding: '6rem 0',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-muted)'
      }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '4rem',
          alignItems: 'center'
        }}>
          <div className="hero-text" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <span className="calligraphy-kicker">
                The Blueprint Revolution
              </span>
              <div style={{
                display: 'inline-flex',
                padding: '0.4rem 1rem',
                background: 'rgba(240, 205, 111, 0.1)',
                border: '1px solid var(--border-color)',
                borderRadius: '100px',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--accent-gold-lite)',
                width: 'fit-content'
              }}>
                🇮🇳 India's First Home Test Drive
              </div>
            </div>
            <h2 style={{
              fontSize: 'clamp(2.3rem, 4.5vw, 3.6rem)',
              fontWeight: 800,
              lineHeight: 1.18,
              fontFamily: 'var(--font-headings)'
            }}>
              <span className="gradient-text">India's #1 Home</span> <span className="calligraphy-accent">Test Drive</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', fontWeight: 400, lineHeight: 1.75 }}>
              Walk the Plan lets you physically step inside your floor plan at actual <strong>1:1 scale</strong>, before a single brick is laid. Catch layout errors, spatial collisions, and door conflicts free of cost.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <button
                onClick={() => (triggerBooking ? triggerBooking() : contactFormRef.current?.scrollIntoView({ behavior: 'smooth' }))}
                className="btn-primary"
              >
                Book Your Session <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate('/gallery')}
                className="btn-secondary"
              >
                See Studio Gallery
              </button>
            </div>
          </div>

          {/* Side Video Playing */}
          <div className="hero-visual" style={{
            position: 'relative',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            aspectRatio: '9/16',
            maxWidth: '280px',
            margin: '0 auto',
            width: '100%'
          }}>
            <video
              key={settings.test_drive_video}
              src={settings.test_drive_video}
              autoPlay
              loop
              muted={isTestDriveMuted}
              playsInline
              style={{
                width: '100%',
                height: '100%',
                display: 'block',
                objectFit: 'cover'
              }}
            />
            {/* Sound Toggle Button */}
            <button
              type="button"
              onClick={() => setIsTestDriveMuted(!isTestDriveMuted)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                zIndex: 10,
                background: 'rgba(7, 10, 18, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#ffffff',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                transition: 'all 0.2s ease-in-out'
              }}
              title={isTestDriveMuted ? "Turn Sound On" : "Mute Sound"}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(7, 10, 18, 0.85)';
                e.currentTarget.style.borderColor = 'var(--accent-orange)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(7, 10, 18, 0.65)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
              }}
            >
              {isTestDriveMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(7, 10, 18, 0.95))',
              padding: '1.25rem',
              color: '#ffffff',
              fontSize: '0.9rem',
              textAlign: 'center',
              fontWeight: 500
            }}>
              1:1 Floor Projection walkthrough in action
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS BAR */}
      <section className="scroll-reveal" style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-muted)', padding: '3rem 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', textAlign: 'center' }}>
          <div>
            <h3 style={{ fontSize: '2.5rem', color: 'var(--accent-orange)' }}>
              <CountUp end={200} duration={2000} suffix="+" />
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Happy Homeowners</p>
          </div>
          <div>
            <h3 style={{ fontSize: '2.5rem', color: '#ffffff' }}>
              <CountUp end={1} duration={1000} />:<CountUp end={1} duration={1000} />
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Full Scale. No guessing.</p>
          </div>
          <div>
            <h3 style={{ fontSize: '2.5rem', color: 'var(--accent-orange)' }}>
              <CountUp end={2} duration={1500} />–<CountUp end={3} duration={1500} /> Days
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Setup Turnaround</p>
          </div>
          <div>
            <h3 style={{ fontSize: '2.5rem', color: '#ffffff' }}>
              ₹<CountUp end={1} duration={1000} />–<CountUp end={30} duration={2000} suffix="L" />
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Avg. Construction Costs Saved</p>
          </div>
        </div>
      </section>

      {/* 3. KEY BENEFITS SECTION (STAKEHOLDERS) */}
      <section id="who-its-for" className="section" style={{
        padding: '6rem 0',
        borderBottom: '1px solid var(--border-muted)'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span className="calligraphy-kicker">Tailored For Every Vision</span>
            <h2 style={{ fontSize: 'clamp(2.1rem, 4.2vw, 3rem)', marginTop: '0.5rem', fontWeight: 800, fontFamily: 'var(--font-headings)' }}>
              Value & Clarity <span className="calligraphy-accent">For Everyone</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '620px', margin: '0.75rem auto 0 auto', fontSize: '1.08rem', lineHeight: 1.75 }}>
              One walkthrough session. Complete spatial certainty, eliminate blind spots, and align all project members before construction starts.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3.5rem'
          }}>
            {/* Stakeholder 1 */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2.5rem', height: '100%' }}>
              <div style={{ fontSize: '2.5rem' }}>🏡</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff' }}>1st: Enduser (Homeowner)</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', flexGrow: 1 }}>
                Catch scale mistakes, furniture layout misalignments, and bad bathroom clearances on paper. Save ₹2L to ₹10L on mid-construction modifications and gain total layout confidence.
              </p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: 0, listStyle: 'none' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}><Check size={16} color="var(--accent-orange)" /> Cost-Saving Spatial Clarity</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}><Check size={16} color="var(--accent-orange)" /> Material Flow Verification</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}><Check size={16} color="var(--accent-orange)" /> Family Plan Alignment</li>
              </ul>
            </div>

            {/* Stakeholder 2 */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2.5rem', height: '100%' }}>
              <div style={{ fontSize: '2.5rem' }}>📐</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff' }}>2nd: Architect & Interior Designer</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', flexGrow: 1 }}>
                Get clients to understand scale immediately. Stop repeating explanations of 2D plans. Get faster approvals, freeze drawings, and eliminate late-stage revision disputes.
              </p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: 0, listStyle: 'none' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}><Check size={16} color="var(--accent-orange)" /> Plan Freeze on Day 1</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}><Check size={16} color="var(--accent-orange)" /> Site Revision Elimination</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}><Check size={16} color="var(--accent-orange)" /> Premium Immersive Client Experience</li>
              </ul>
            </div>

            {/* Stakeholder 3 */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2.5rem', height: '100%' }}>
              <div style={{ fontSize: '2.5rem' }}>🏢</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff' }}>3rd: Builder & Developer</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', flexGrow: 1 }}>
                Sell luxury projects and inventory before building structural columns. Walk clients through their exact penthouse layouts, generating instant trust and pre-sales.
              </p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: 0, listStyle: 'none' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}><Check size={16} color="var(--accent-orange)" /> Accelerate Presales Velocity</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}><Check size={16} color="var(--accent-orange)" /> Zero Sample Flat Rework</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}><Check size={16} color="var(--accent-orange)" /> Higher Investor Conversion</li>
              </ul>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => navigate('/services')}
              className="btn-primary"
              style={{
                padding: '1rem 2.5rem',
                fontSize: '1.05rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, var(--accent-orange) 0%, #d1a60a 100%)',
                color: '#000000',
                boxShadow: '0 4px 14px rgba(239, 199, 25, 0.3)'
              }}
            >
              Know More About Our Services
            </button>
          </div>
        </div>
      </section>

      {/* 4. INDIA MAP & STATES SECTION */}
      <section className="section" style={{
        padding: '6rem 0',
        backgroundColor: 'rgba(17, 26, 46, 0.4)',
        borderBottom: '1px solid var(--border-muted)'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span className="calligraphy-kicker">Nationwide Footprint</span>
            <h2 style={{ fontSize: 'clamp(2.1rem, 4.2vw, 3rem)', marginTop: '0.5rem', fontWeight: 800, fontFamily: 'var(--font-headings)' }}>
              Our Studios <span className="calligraphy-accent">Across India</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '620px', margin: '0.75rem auto 0 auto', fontSize: '1.08rem', lineHeight: 1.75 }}>
              Operational in Gurugram, Dehradun, Varanasi, Hyderabad, and Madurai. Select any active state on the interactive map to inspect studio capabilities.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: 'clamp(1.5rem, 3vw, 3rem)',
            alignItems: 'center'
          }}>
            {/* Interactive SVG map column */}
            <div className="glass-card" style={{
              padding: 'clamp(1.25rem, 3vw, 2.5rem) clamp(1rem, 2vw, 1.5rem)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              minHeight: '440px'
            }}>
              {/* Quick Studio Selector Buttons (One-tap navigation on mobile & tablet) */}
              <div style={{
                display: 'flex',
                gap: '0.45rem',
                flexWrap: 'wrap',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                width: '100%'
              }}>
                {Object.entries(statesData || {}).map(([stateKey, data]) => {
                  const isActive = activeState === stateKey;
                  const isHQ = STATE_PIN_CONFIG[stateKey]?.isHQ;
                  return (
                    <button
                      key={stateKey}
                      type="button"
                      onClick={() => setActiveState(stateKey)}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: '9999px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        letterSpacing: '0.03em',
                        cursor: 'pointer',
                        border: isActive ? '1px solid var(--accent-orange)' : '1px solid rgba(255,255,255,0.1)',
                        background: isActive ? 'rgba(240, 205, 111, 0.2)' : 'rgba(255,255,255,0.04)',
                        color: isActive ? 'var(--accent-orange)' : 'var(--text-secondary)',
                        transition: 'all 0.2s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: isActive ? 'var(--accent-orange)' : (isHQ ? 'var(--accent-orange)' : '#3b82f6')
                      }} />
                      {data?.city || stateKey} {isHQ ? 'HQ' : ''}
                    </button>
                  );
                })}
              </div>

              <svg viewBox="0 0 612 696" style={{ width: '100%', height: 'auto', maxHeight: '400px' }}>
                {/* Accurate map of India rendering all states */}
                {indiaPaths.map((state) => {
                  const stateKey = stateKeyMap[state.id];
                  const isOperational = stateKey && statesData && statesData[stateKey];
                  const isActive = activeState === stateKey;

                  return (
                    <path
                      key={state.id}
                      d={state.d}
                      fill={isOperational ? (isActive ? 'rgba(239, 199, 25, 0.32)' : 'rgba(239, 199, 25, 0.08)') : 'rgba(255, 255, 255, 0.02)'}
                      stroke={isOperational ? 'var(--accent-orange)' : 'rgba(255, 255, 255, 0.08)'}
                      strokeWidth={isActive ? '2.5' : (isOperational ? '1.5' : '0.6')}
                      style={{
                        cursor: isOperational ? 'pointer' : 'default',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={isOperational ? () => setActiveState(stateKey) : undefined}
                      onMouseEnter={isOperational ? () => setActiveState(stateKey) : undefined}
                    />
                  );
                })}

                {/* Studio Location Markers placed precisely inside operational states */}
                {Object.entries(statesData || {}).map(([stateKey, data]) => {
                  const pinCfg = STATE_PIN_CONFIG[stateKey];
                  if (!pinCfg) return null;
                  const isHQ = pinCfg.isHQ;
                  const isSelected = activeState === stateKey;
                  const color = isHQ ? 'var(--accent-orange)' : (isSelected ? 'var(--accent-orange)' : '#3b82f6');
                  const labelText = data?.city || pinCfg.defaultCity;

                  return (
                    <g
                      key={stateKey}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setActiveState(stateKey)}
                      onMouseEnter={() => setActiveState(stateKey)}
                    >
                      <circle cx={pinCfg.cx} cy={pinCfg.cy} r={isSelected ? "11" : "8"} fill={color} opacity="0.3">
                        <animate attributeName="r" values={isSelected ? "9;15;9" : "7;12;7"} dur={isHQ ? "1.8s" : "2.2s"} repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.45;0.1;0.45" dur={isHQ ? "1.8s" : "2.2s"} repeatCount="indefinite" />
                      </circle>
                      <circle
                        cx={pinCfg.cx}
                        cy={pinCfg.cy}
                        r={isSelected ? "5.5" : "4.5"}
                        fill={color}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                      <text
                        x={pinCfg.labelX}
                        y={pinCfg.labelY}
                        fill="#ffffff"
                        fontSize={isSelected ? "10" : "9"}
                        fontWeight="bold"
                        textAnchor={pinCfg.anchor}
                        style={{
                          pointerEvents: 'none',
                          filter: 'drop-shadow(0px 1px 3px rgba(0,0,0,0.95)) drop-shadow(0px 0px 5px rgba(0,0,0,0.8))'
                        }}
                      >
                        {isHQ ? `${labelText} HQ` : labelText}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* State details content column */}
            <div className="glass-card" style={{
              padding: '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              border: '1px solid rgba(239, 199, 25, 0.25)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              minHeight: '400px'
            }}>
              {statesData && statesData[activeState] ? (
                <>
                  <div style={{ height: '220px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <img
                      src={statesData[activeState]?.image}
                      alt={statesData[activeState]?.name}
                      loading="lazy"
                      decoding="async"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-orange)', marginBottom: '0.5rem' }}>
                      {statesData[activeState]?.name}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', fontFamily: 'monospace' }}>
                      📍 {statesData[activeState]?.address}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6' }}>
                      {statesData[activeState]?.details}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto', borderTop: '1px solid var(--border-muted)', paddingTop: '1.25rem' }}>
                    <button
                      onClick={() => (triggerBooking ? triggerBooking(statesData[activeState]?.name) : contactFormRef.current?.scrollIntoView({ behavior: 'smooth' }))}
                      className="btn-primary"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      Book at {statesData[activeState]?.city || 'Studio'} →
                    </button>
                    {statesData[activeState]?.phone && (
                      <a
                        href={`tel:${statesData[activeState]?.phone}`}
                        className="btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 1.25rem' }}
                      >
                        📞 Call
                      </a>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  Select a state on the map to view studio details.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>



      {/* 6. THE PROBLEM SECTION */}
      {/* <section className="section scroll-reveal" style={{ padding: '7rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ color: 'var(--accent-orange)', fontSize: '0.95rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>The Dilemma</span>
            <h2 style={{ fontSize: '2.5rem', marginTop: '0.5rem' }}>The Real Problem</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '1rem auto 0 auto', fontSize: '1.1rem' }}>
              You've stared at that 2D floor plan a hundred times. And you still can't feel the room.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ color: 'var(--accent-orange)', background: 'rgba(239, 199, 25,0.1)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem' }}>Plans are for builders, not you</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                A blueprint is a professional document designed for architects and structural engineers. It shows thickness and electrical outlets, not whether your family will feel cramped.
              </p>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ color: '#3b82f6', background: 'rgba(59,130,246,0.1)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem' }}>Camera lenses lie in 3D renders</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Standard 3D computer renders are captured using virtual ultra-wide focal lengths. They stretch space to look double its size, hiding actual room deficits until construction finishes.
              </p>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ color: 'var(--accent-orange)', background: 'rgba(239, 199, 25,0.1)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem' }}>Post-excavation changes are crippling</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Once structural walls are poured, moving an outlet, a bathroom partition, or a kitchen counter causes massive delay, builder conflicts, and costs lakhs in rework fee.
              </p>
            </div>
          </div>

          <div className="glass-card" style={{ marginTop: '3rem', padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <h4 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>The Construction vs. Finished Home Gap</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                You are committing crores to a finished home your family will live in for the next 30+ years, but working off a paper layout you can't truly experience. <strong>Walk the Plan seals this gap.</strong>
              </p>
            </div>
            <button onClick={() => contactFormRef.current.scrollIntoView({ behavior: 'smooth' })} className="btn-primary" style={{ flexShrink: 0 }}>
              Close the Gap Now
            </button>
          </div>
        </div>
      </section> */}

      {/* 7. HOW IT WORKS */}
      <section id="how-it-works" className="section scroll-reveal">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span className="calligraphy-kicker">Simple & Seamless</span>
            <h2 style={{ fontSize: 'clamp(2.1rem, 4.2vw, 3rem)', marginTop: '0.5rem', fontWeight: 800, fontFamily: 'var(--font-headings)' }}>
              4 Steps to <span className="calligraphy-accent">Complete Spatial Clarity</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '620px', margin: '0.75rem auto 0 auto', fontSize: '1.08rem', lineHeight: 1.75 }}>
              We've eliminated the friction. Send us your CAD floor plan and step into your space in just 2 to 3 days.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem 1.5rem', position: 'relative', marginTop: '1.5rem' }}>
            <div className="glass-card" style={{ position: 'relative', borderTop: '4px solid var(--accent-orange)', overflow: 'visible', paddingTop: '2.25rem' }}>
              <div style={{
                position: 'absolute',
                top: '-21px',
                left: '20px',
                width: '42px',
                height: '42px',
                background: 'linear-gradient(135deg, #f5d77f 0%, #d4af37 100%)',
                color: '#070a10',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.15rem',
                boxShadow: '0 4px 14px rgba(212, 175, 55, 0.45)',
                border: '2px solid #07090e',
                zIndex: 10
              }}>1</div>
              <h3 style={{ fontSize: '1.2rem', marginTop: '0.25rem', marginBottom: '0.75rem' }}>Share Floor Plan</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Email or WhatsApp us your architect's final AutoCAD file (.dwg). No backend hassle. We take over immediately.
              </p>
            </div>

            <div className="glass-card" style={{ position: 'relative', borderTop: '4px solid #ffffff', overflow: 'visible', paddingTop: '2.25rem' }}>
              <div style={{
                position: 'absolute',
                top: '-21px',
                left: '20px',
                width: '42px',
                height: '42px',
                background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
                color: '#070a10',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.15rem',
                boxShadow: '0 4px 14px rgba(255, 255, 255, 0.35)',
                border: '2px solid #07090e',
                zIndex: 10
              }}>2</div>
              <h3 style={{ fontSize: '1.2rem', marginTop: '0.25rem', marginBottom: '0.75rem' }}>We Build Experience</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Our team maps the vectors, imports dimensional mock furniture, and sets up scaling systems. Completed in 2-3 days.
              </p>
            </div>

            <div className="glass-card" style={{ position: 'relative', borderTop: '4px solid var(--accent-orange)', overflow: 'visible', paddingTop: '2.25rem' }}>
              <div style={{
                position: 'absolute',
                top: '-21px',
                left: '20px',
                width: '42px',
                height: '42px',
                background: 'linear-gradient(135deg, #f5d77f 0%, #d4af37 100%)',
                color: '#070a10',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.15rem',
                boxShadow: '0 4px 14px rgba(212, 175, 55, 0.45)',
                border: '2px solid #07090e',
                zIndex: 10
              }}>3</div>
              <h3 style={{ fontSize: '1.2rem', marginTop: '0.25rem', marginBottom: '0.75rem' }}>Walk Your Home</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Visit our nearest walkthrough studio. Walk rooms at actual size, open mock doors, test spaces, and experience sightlines live.
              </p>
            </div>

            <div className="glass-card" style={{ position: 'relative', borderTop: '4px solid #ffffff', overflow: 'visible', paddingTop: '2.25rem' }}>
              <div style={{
                position: 'absolute',
                top: '-21px',
                left: '20px',
                width: '42px',
                height: '42px',
                background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
                color: '#070a10',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.15rem',
                boxShadow: '0 4px 14px rgba(255, 255, 255, 0.35)',
                border: '2px solid #07090e',
                zIndex: 10
              }}>4</div>
              <h3 style={{ fontSize: '1.2rem', marginTop: '0.25rem', marginBottom: '0.75rem' }}>Build with Confidence</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Take your Catch List back to your designer. Make changes on paper for free and initiate building with zero regret.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. COMPETITOR & METHOD COMPARISON MATRIX */}
      <section className="section scroll-reveal" style={{
        padding: '6rem 0',
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-gold-subtle)',
        borderBottom: '1px solid var(--border-gold-subtle)',
        position: 'relative'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="luxury-badge" style={{ marginBottom: '0.75rem' }}>
              <Layers size={14} /> Competitive Advantage
            </span>
            <h2 style={{ fontSize: 'clamp(1.9rem, 3.8vw, 2.75rem)', marginTop: '0.5rem' }}>
              Why 1:1 Scale Floor Projection <span className="gold-gradient-text">Beats All Other Methods</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '680px', margin: '0.75rem auto 0 auto', fontSize: '1.05rem' }}>
              See how Walk The Plan's physical 1:1 scale blueprint studio compares against traditional 2D paper blueprints and virtual 3D renders.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
            <table className="compare-table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ minWidth: '220px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.82rem' }}>Feature / Capability</th>
                  <th style={{ minWidth: '180px', color: 'var(--text-secondary)', textAlign: 'center' }}>Traditional 2D Blueprints</th>
                  <th style={{ minWidth: '190px', color: 'var(--text-secondary)', textAlign: 'center' }}>3D Virtual Renders & VR</th>
                  <th style={{ minWidth: '220px', color: 'var(--accent-orange)', textAlign: 'center', background: 'rgba(229, 184, 66, 0.08)', borderLeft: '1px solid var(--border-gold-subtle)', borderRight: '1px solid var(--border-gold-subtle)' }}>
                    ✨ Walk The Plan (1:1 Scale)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>True Spatial Depth & Walkway Feel</td>
                  <td style={{ textAlign: 'center', color: '#ef4444' }}>❌ 0% (Abstract flat lines)</td>
                  <td style={{ textAlign: 'center', color: '#eab308' }}>⚠️ Warped wide-angle lens (looks 30% larger)</td>
                  <td style={{ textAlign: 'center', color: '#10b981', fontWeight: 700, background: 'rgba(229, 184, 66, 0.04)', borderLeft: '1px solid var(--border-gold-subtle)', borderRight: '1px solid var(--border-gold-subtle)' }}>
                    ✅ 100% True Physical Footprint
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Physical Movable Furniture Testing</td>
                  <td style={{ textAlign: 'center', color: '#ef4444' }}>❌ Impossible</td>
                  <td style={{ textAlign: 'center', color: '#eab308' }}>⚠️ Virtual only, no physical touch</td>
                  <td style={{ textAlign: 'center', color: '#10b981', fontWeight: 700, background: 'rgba(229, 184, 66, 0.04)', borderLeft: '1px solid var(--border-gold-subtle)', borderRight: '1px solid var(--border-gold-subtle)' }}>
                    ✅ Real beds, tables & counters rolled on lines
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Door Swing & Passage Clearance Check</td>
                  <td style={{ textAlign: 'center', color: '#ef4444' }}>❌ Hidden until walls are erected</td>
                  <td style={{ textAlign: 'center', color: '#ef4444' }}>❌ Collisions routinely missed</td>
                  <td style={{ textAlign: 'center', color: '#10b981', fontWeight: 700, background: 'rgba(229, 184, 66, 0.04)', borderLeft: '1px solid var(--border-gold-subtle)', borderRight: '1px solid var(--border-gold-subtle)' }}>
                    ✅ Physical door swings & hallway clearance
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Live On-Site CAD / Vector Adjustment</td>
                  <td style={{ textAlign: 'center', color: '#ef4444' }}>❌ Days of redraws and back-and-forth</td>
                  <td style={{ textAlign: 'center', color: '#ef4444' }}>❌ Weeks of expensive re-rendering</td>
                  <td style={{ textAlign: 'center', color: '#10b981', fontWeight: 700, background: 'rgba(229, 184, 66, 0.04)', borderLeft: '1px solid var(--border-gold-subtle)', borderRight: '1px solid var(--border-gold-subtle)' }}>
                    ✅ Real-time CAD tweaking live on projector
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Stakeholder Consensus (Owner + Architect + Contractor)</td>
                  <td style={{ textAlign: 'center', color: '#ef4444' }}>❌ Frequent site arguments & blame games</td>
                  <td style={{ textAlign: 'center', color: '#eab308' }}>⚠️ Solitary headset view</td>
                  <td style={{ textAlign: 'center', color: '#10b981', fontWeight: 700, background: 'rgba(229, 184, 66, 0.04)', borderLeft: '1px solid var(--border-gold-subtle)', borderRight: '1px solid var(--border-gold-subtle)' }}>
                    ✅ All 3 parties walk and agree in 60 mins
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Average Cost Saved on Demolition Rework</td>
                  <td style={{ textAlign: 'center', color: '#ef4444' }}>₹0 (Costs ₹3L–₹15L in change orders)</td>
                  <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Minimal rework reduction</td>
                  <td style={{ textAlign: 'center', color: 'var(--accent-orange)', fontWeight: 800, background: 'rgba(229, 184, 66, 0.08)', borderLeft: '1px solid var(--border-gold-subtle)', borderRight: '1px solid var(--border-gold-subtle)' }}>
                    🏆 ₹3.5 Lakh – ₹15+ Lakh Saved
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 9. RECONSTRUCTION SAVINGS & ROI CALCULATOR */}
      <section className="section scroll-reveal" style={{ padding: '6rem 0' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(13, 18, 28, 0.95) 0%, rgba(20, 28, 44, 0.85) 100%)',
            border: '1px solid var(--border-gold-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: 'clamp(2rem, 5vw, 4rem)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem auto' }}>
              <span className="calligraphy-kicker">Guaranteed Capital Protection</span>
              <h2 style={{ fontSize: 'clamp(2.1rem, 4.2vw, 3rem)', marginTop: '0.5rem', fontWeight: 800, fontFamily: 'var(--font-headings)' }}>
                Estimate Your <span className="calligraphy-accent">Demolition Savings</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem', fontSize: '1.08rem', lineHeight: 1.75 }}>
                Industry data reveals 1 in 3 Indian luxury home builds undergoes structural demolition due to plan misinterpretations. Calculate your exact capital protection.
              </p>
            </div>

            <div style={{ maxWidth: '640px', margin: '0 auto 2.5rem auto', textAlign: 'center' }}>
              <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Select Your Project Built-Up Area: <span style={{ color: 'var(--accent-orange)', fontSize: '1.25rem', fontWeight: 800 }}>{calcArea.toLocaleString('en-IN')} Sq Ft</span>
              </label>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }}>
                {[2000, 3500, 5000, 8000, 12000, 20000].map(area => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => setCalcArea(area)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: calcArea === area ? '1px solid var(--accent-orange)' : '1px solid var(--border-muted)',
                      background: calcArea === area ? 'rgba(229, 184, 66, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      color: calcArea === area ? 'var(--accent-orange)' : 'var(--text-secondary)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {area.toLocaleString('en-IN')} sq ft
                  </button>
                ))}
              </div>

              <input
                type="range"
                min="1500"
                max="25000"
                step="500"
                value={calcArea}
                onChange={(e) => setCalcArea(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: 'var(--accent-orange)',
                  cursor: 'pointer',
                  height: '6px'
                }}
              />
            </div>

            {/* Results Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2.5rem'
            }}>
              <div className="glass-card" style={{ textAlign: 'center', padding: '1.75rem 1.25rem', borderTop: '3px solid var(--accent-orange)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estimated Demolition Saved</span>
                <h3 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', color: 'var(--accent-orange)', margin: '0.5rem 0' }}>
                  ₹{Math.round(calcArea * 175).toLocaleString('en-IN')}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Based on avg. plumbing, wall shifting & slab rework costs</p>
              </div>

              <div className="glass-card" style={{ textAlign: 'center', padding: '1.75rem 1.25rem', borderTop: '3px solid var(--accent-cyan)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Construction Delays Prevented</span>
                <h3 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', color: 'var(--accent-cyan)', margin: '0.5rem 0' }}>
                  ~{Math.round(20 + (calcArea / 1200) * 3)} Days
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Eliminates contractor rework disputes & stop-work orders</p>
              </div>

              <div className="glass-card" style={{ textAlign: 'center', padding: '1.75rem 1.25rem', borderTop: '3px solid #10b981' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Layout Clashes Caught</span>
                <h3 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', color: '#10b981', margin: '0.5rem 0' }}>
                  ~{Math.min(10, Math.max(3, Math.round(calcArea / 1400)))} Major Flaws
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Door swing collisions, narrow foyers & AC duct clashes</p>
              </div>

              <div className="glass-card" style={{ textAlign: 'center', padding: '1.75rem 1.25rem', borderTop: '3px solid var(--accent-gold)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Session ROI Multiple</span>
                <h3 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', color: 'var(--accent-gold)', margin: '0.5rem 0' }}>
                  {Math.round((calcArea * 175) / 10000)}x Return
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Guaranteed peace of mind before pouring concrete</p>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => (triggerBooking ? triggerBooking() : contactFormRef.current?.scrollIntoView({ behavior: 'smooth' }))}
                className="btn-primary"
                style={{ padding: '1rem 2.5rem', fontSize: '1rem', letterSpacing: '0.03em' }}
              >
                <Sparkles size={16} /> Protect My Project — Book Your Appointment Now →
              </button>
            </div>
          </div>
        </div>
      </section>





      {/* 10. CLIENT VIDEO CAROUSEL SECTION */}
      <section className="section scroll-reveal" style={{ padding: '5rem 0', backgroundColor: 'rgba(11, 26, 46, 0.2)', borderTop: '1px solid var(--border-muted)', borderBottom: '1px solid var(--border-muted)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <span className="calligraphy-kicker">Authentic Experiences</span>
              <h2 style={{ fontSize: 'clamp(2.1rem, 4.2vw, 3rem)', marginTop: '0.5rem', fontWeight: 800, fontFamily: 'var(--font-headings)' }}>
                Client Video <span className="calligraphy-accent">Testimonials</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '620px', marginTop: '0.75rem', fontSize: '1.08rem', lineHeight: 1.75 }}>
                Watch actual walk sessions and reactions from homeowners, architects, and builders validating their designs in full scale.
              </p>
            </div>

            {/* Scroll navigation arrows */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={scrollLeft}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: '#ffffff',
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                className="scroll-btn"
                title="Scroll Left"
              >
                <ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} />
              </button>
              <button
                onClick={scrollRight}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: '#ffffff',
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                className="scroll-btn"
                title="Scroll Right"
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {/* Horizontal scroll video row */}
          <div
            ref={scrollRef}
            onMouseEnter={() => setIsTestimonialsHovered(true)}
            onMouseLeave={() => setIsTestimonialsHovered(false)}
            style={{
              display: 'flex',
              gap: '2rem',
              overflowX: 'auto',
              scrollBehavior: 'smooth',
              paddingBottom: '2.5rem',
              scrollbarWidth: 'thin',
              scrollbarColor: 'var(--border-color) transparent',
              msOverflowStyle: 'none'
            }}
            className="horizontal-video-scroll"
          >
            {testimonialVideos.map((video) => (
              <div
                key={video.id}
                className="glass-card"
                style={{
                  flex: '0 0 auto',
                  width: 'clamp(300px, 85vw, 420px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  padding: '1.25rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  background: 'rgba(11, 26, 46, 0.4)'
                }}
              >
                {/* Video wrapper */}
                <div style={{ position: 'relative', width: '100%', borderRadius: '8px', overflow: 'hidden', background: '#000000', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <video
                    src={video.src}
                    controls
                    playsInline
                    preload="metadata"
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '480px',
                      display: 'block',
                      objectFit: 'contain'
                    }}
                  />
                </div>

                {/* Video Info metadata */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', lineHeight: '1.4' }}>
                    {video.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-orange)' }}>
                      {video.name}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      • {video.role}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.5', marginTop: '0.25rem' }}>
                    "{video.desc}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* 11. CRAWLABLE FAQ & KNOWLEDGE BASE SECTION (AEO / GEO / SEO ENHANCED) */}
      <section className="section scroll-reveal" style={{ padding: '5rem 0', background: 'linear-gradient(180deg, rgba(5, 10, 20, 0.4) 0%, rgba(11, 26, 46, 0.6) 100%)' }}>
        <div className="container" style={{ maxWidth: '980px' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="calligraphy-kicker">Architectural Knowledge Base</span>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1rem',
              borderRadius: '9999px',
              background: 'rgba(240, 205, 111, 0.08)',
              border: '1px solid rgba(240, 205, 111, 0.25)',
              color: 'var(--accent-gold-lite)',
              fontSize: '0.82rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '1rem'
            }}>
              <HelpCircle size={15} />
              <span>Blueprint Projection Guide & FAQs</span>
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.9rem)', fontWeight: 800, color: '#ffffff', letterSpacing: '0.01em', marginBottom: '1rem', lineHeight: 1.25, fontFamily: 'var(--font-headings)' }}>
              Everything You Need To Know <br />
              <span className="calligraphy-accent">Before Walking Your Plan</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '660px', margin: '0 auto', lineHeight: 1.75 }}>
              Got questions about 1:1 blueprint projection, real-scale movable furniture, or studio appointments? Explore direct answers vetted by our structural and CAD design team.
            </p>
          </div>

          <div
            itemScope
            itemType="https://schema.org/FAQPage"
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            {faqList.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  itemScope
                  itemProp="mainEntity"
                  itemType="https://schema.org/Question"
                  style={{
                    borderRadius: '12px',
                    border: isOpen ? '1px solid rgba(239, 199, 25, 0.45)' : '1px solid rgba(255, 255, 255, 0.08)',
                    background: isOpen ? 'rgba(11, 26, 46, 0.85)' : 'rgba(8, 16, 28, 0.5)',
                    backdropFilter: 'blur(12px)',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    overflow: 'hidden',
                    boxShadow: isOpen ? '0 12px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(239, 199, 25, 0.1)' : 'none'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    aria-expanded={isOpen}
                    style={{
                      width: '100%',
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span
                      itemProp="name"
                      style={{
                        fontSize: 'clamp(1rem, 2vw, 1.12rem)',
                        fontWeight: 700,
                        color: isOpen ? 'var(--accent-orange)' : '#ffffff',
                        lineHeight: 1.45,
                        transition: 'color 0.2s ease'
                      }}
                    >
                      {faq.q}
                    </span>
                    <span
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: isOpen ? 'rgba(239, 199, 25, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        border: isOpen ? '1px solid rgba(239, 199, 25, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isOpen ? 'var(--accent-orange)' : 'var(--text-secondary)',
                        flexShrink: 0,
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s ease, background 0.2s ease'
                      }}
                    >
                      <ChevronDown size={18} />
                    </span>
                  </button>

                  <div
                    itemScope
                    itemProp="acceptedAnswer"
                    itemType="https://schema.org/Answer"
                    style={{
                      padding: isOpen ? '0 1.5rem 1.35rem 1.5rem' : '0 1.5rem',
                      maxHeight: isOpen ? '600px' : '0px',
                      opacity: isOpen ? 1 : 0,
                      overflow: 'hidden',
                      transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                      pointerEvents: isOpen ? 'auto' : 'none'
                    }}
                  >
                    <p
                      itemProp="text"
                      style={{
                        fontSize: '0.98rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.75,
                        margin: 0,
                        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                        paddingTop: '0.9rem'
                      }}
                    >
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Helper Banner */}
          <div style={{
            marginTop: '2.5rem',
            padding: '1.25rem 1.75rem',
            borderRadius: '12px',
            background: 'rgba(239, 199, 25, 0.04)',
            border: '1px dashed rgba(239, 199, 25, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                Have a specialized floor plan or Vastu layout question?
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                Talk directly with our senior CAD projection engineer on WhatsApp.
              </p>
            </div>
            <a
              href="https://wa.me/919711022075?text=Hello%20Walk%20The%20Plan%2C%20I%20have%20a%20question%20regarding%201%3A1%20scale%20blueprint%20projection."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', gap: '0.4rem' }}
            >
              Ask on WhatsApp →
            </a>
          </div>
        </div>
      </section>

      {/* 13. INTERACTIVE APPOINTMENT SCHEDULER WIDGET */}
      <section ref={contactFormRef} className="section scroll-reveal" style={{ padding: '6rem 0 8rem 0' }}>
        <div className="container" style={{ maxWidth: '850px' }}>
          <div className="glass-card" style={{
            border: '1px solid var(--border-color)',
            boxShadow: '0 20px 45px rgba(0,0,0,0.5), 0 0 20px var(--glow-color)',
            padding: 'clamp(1rem, 5vw, 2.5rem)',
            borderRadius: '16px'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <span className="calligraphy-kicker">Reserve Your Immersion</span>
              <h2 style={{ fontSize: 'clamp(2.1rem, 3.8vw, 2.85rem)', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-headings)' }}>
                Book Your <span className="calligraphy-accent">Studio Appointment</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.02rem', lineHeight: 1.65 }}>
                Select your preferred service, choose an available date & time slot, and confirm your details.
              </p>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 'clamp(0.35rem, 2vw, 1rem)',
              marginBottom: '2.5rem',
              flexWrap: 'wrap'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: bookingStep >= 1 ? 'var(--accent-orange)' : 'var(--text-muted)'
              }}>
                <span style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: `2px solid ${bookingStep >= 1 ? 'var(--accent-orange)' : 'var(--border-muted)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}>1</span>
                <span style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', fontWeight: bookingStep === 1 ? 600 : 400 }}>Service</span>
              </div>
              <div style={{ width: 'clamp(15px, 4vw, 40px)', height: '2px', backgroundColor: bookingStep >= 2 ? 'var(--accent-orange)' : 'var(--border-muted)', flexShrink: 1 }}></div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: bookingStep >= 2 ? 'var(--accent-orange)' : 'var(--text-muted)'
              }}>
                <span style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: `2px solid ${bookingStep >= 2 ? 'var(--accent-orange)' : 'var(--border-muted)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}>2</span>
                <span style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', fontWeight: bookingStep === 2 ? 600 : 400 }}>Date & Time</span>
              </div>
              <div style={{ width: 'clamp(15px, 4vw, 40px)', height: '2px', backgroundColor: bookingStep >= 3 ? 'var(--accent-orange)' : 'var(--border-muted)', flexShrink: 1 }}></div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: bookingStep >= 3 ? 'var(--accent-orange)' : 'var(--text-muted)'
              }}>
                <span style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: `2px solid ${bookingStep >= 3 ? 'var(--accent-orange)' : 'var(--border-muted)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}>3</span>
                <span style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', fontWeight: bookingStep === 3 ? 600 : 400 }}>Your Info</span>
              </div>

              <div style={{ width: 'clamp(15px, 4vw, 40px)', height: '2px', backgroundColor: bookingStep >= 4 ? 'var(--accent-orange)' : 'var(--border-muted)', flexShrink: 1 }}></div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: bookingStep >= 4 ? 'var(--accent-orange)' : 'var(--text-muted)'
              }}>
                <span style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: `2px solid ${bookingStep >= 4 ? 'var(--accent-orange)' : 'var(--border-muted)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}>4</span>
                <span style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', fontWeight: bookingStep === 4 ? 600 : 400 }}>Confirmation</span>
              </div>
            </div>

            {/* STEP 1: SERVICE TYPE */}
            {bookingStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>Select Booking Type:</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>All sessions include full 1:1 scale immersive floor projection</p>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-orange)', background: 'rgba(239, 199, 25, 0.08)', padding: '0.25rem 0.65rem', borderRadius: '12px', border: '1px solid rgba(239, 199, 25, 0.2)' }}>
                    ₹5,000 token deposit reserves your slot
                  </span>
                </div>

                {[
                  {
                    type: '1 Hour Session',
                    duration: '1 Hour',
                    badge: null,
                    desc: 'Physically step inside your layouts projected at true 1:1 scale on our showroom floor. Spot layout, corridor, or furniture issues.'
                  },
                  {
                    type: '2 Hour Session',
                    duration: '2 Hours',
                    badge: 'Most Popular',
                    desc: 'More time for larger projects or double-checking layout details with family, architects, or interior designers.'
                  },
                  {
                    type: '3-6 Hour Session',
                    duration: '3-6 Hours',
                    badge: 'Comprehensive',
                    desc: 'A comprehensive session for full commercial, multiple layout reviews, builders, and large luxury villa walkthroughs.'
                  }
                ].map((opt) => {
                  const isSelected = sessionType === opt.type;
                  const price = getPackagePrice(opt.type);
                  const tokenAmt = 5000;
                  const balanceAmt = Math.max(0, price - tokenAmt);

                  return (
                    <div
                      key={opt.type}
                      className="glass-card"
                      style={{
                        border: isSelected ? '2px solid var(--accent-orange)' : '1px solid var(--border-color)',
                        padding: '1.4rem 1.5rem',
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(239, 199, 25, 0.06)' : 'rgba(255,255,255,0.01)',
                        transition: 'all 0.2s',
                        borderRadius: '14px',
                        boxShadow: isSelected ? '0 0 20px rgba(239, 199, 25, 0.12)' : 'none'
                      }}
                      onClick={() => setSessionType(opt.type)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.6rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                          <h4 style={{ fontWeight: 700, color: '#ffffff', fontSize: '1.15rem', margin: 0 }}>{opt.type}</h4>
                          <span style={{
                            color: 'var(--accent-orange)',
                            background: 'rgba(239, 199, 25, 0.1)',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            padding: '0.2rem 0.6rem',
                            borderRadius: '20px',
                            border: '1px solid rgba(239, 199, 25, 0.25)'
                          }}>
                            {opt.duration}
                          </span>
                          {opt.badge && (
                            <span style={{
                              background: 'linear-gradient(135deg, var(--accent-orange), #d1a60a)',
                              color: '#000000',
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              padding: '0.2rem 0.55rem',
                              borderRadius: '20px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em'
                            }}>
                              {opt.badge}
                            </span>
                          )}
                        </div>

                        {/* Prominent Price Display */}
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                          <span style={{ color: 'var(--accent-orange)', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                            ₹{price.toLocaleString('en-IN')}
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>/ session</span>
                        </div>
                      </div>

                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 0.85rem 0' }}>
                        {opt.desc}
                      </p>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '0.75rem',
                        borderTop: '1px dashed rgba(255, 255, 255, 0.08)',
                        fontSize: '0.82rem',
                        color: 'var(--text-muted)',
                        flexWrap: 'wrap',
                        gap: '0.5rem'
                      }}>
                        <span>Slot Booking Token: <strong style={{ color: '#ffffff' }}>₹{tokenAmt.toLocaleString('en-IN')}</strong></span>
                        <span>Balance payable at studio: <strong style={{ color: 'var(--accent-orange)' }}>₹{balanceAmt.toLocaleString('en-IN')}</strong></span>
                      </div>
                    </div>
                  );
                })}

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', width: '100%' }}>
                  <button
                    onClick={() => setBookingStep(2)}
                    className="btn-primary"
                    style={{ padding: '0.85rem 2.5rem', minWidth: '240px', maxWidth: '100%', justifyContent: 'center' }}
                  >
                    Choose Date & Time →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: DATE & TIME SELECTOR */}
            {bookingStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => setBookingStep(1)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <ChevronLeft size={20} /> Back
                    </button>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>Select Date & Time</h3>
                  </div>
                  <div style={{
                    background: 'rgba(239, 199, 25, 0.08)',
                    border: '1px solid rgba(239, 199, 25, 0.25)',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}>
                    <span style={{ color: 'var(--text-muted)' }}>Selected:</span>
                    <strong>{sessionType}</strong>
                    <span style={{ color: 'var(--accent-orange)', fontWeight: 700 }}>
                      ₹{getPackagePrice(sessionType).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 'clamp(1.5rem, 4vw, 2.5rem)',
                  alignItems: 'start'
                }}>
                  {/* Left Column: Calendar */}
                  <div>
                    <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select Date</h4>
                    {renderCalendar()}
                  </div>

                  {/* Right Column: Time Slots */}
                  <div>
                    <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select Time Slot</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {["10:00 AM", "02:00 PM", "06:00 PM"].map((t) => {
                        const isSelected = selectedTime === t;

                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setSelectedTime(t)}
                            style={{
                              padding: '1rem',
                              borderRadius: '8px',
                              border: isSelected ? '2px solid var(--accent-orange)' : '1px solid var(--border-muted)',
                              background: isSelected ? 'rgba(239, 199, 25, 0.15)' : 'transparent',
                              color: isSelected ? 'var(--accent-orange)' : '#ffffff',
                              fontSize: '0.95rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <span>{t}</span>
                            {isSelected && (
                              <span style={{
                                fontSize: '0.75rem',
                                background: 'rgba(239, 199, 25, 0.2)',
                                color: 'var(--accent-orange)',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                                fontWeight: 700
                              }}>
                                Selected
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', width: '100%' }}>
                  <button
                    disabled={!selectedDate || !selectedTime}
                    onClick={() => setBookingStep(3)}
                    className="btn-primary"
                    style={{
                      padding: '0.85rem 2.5rem',
                      minWidth: '240px',
                      maxWidth: '100%',
                      justifyContent: 'center',
                      opacity: (!selectedDate || !selectedTime) ? 0.5 : 1
                    }}
                  >
                    Enter Your Information →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: LEAD INFORMATION */}
            {bookingStep === 3 && (
              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => setBookingStep(2)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <ChevronLeft size={20} /> Back
                    </button>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>Step 3: Enter Your Details</h3>
                  </div>
                  <div style={{
                    background: 'rgba(239, 199, 25, 0.08)',
                    border: '1px solid rgba(239, 199, 25, 0.25)',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}>
                    <span style={{ color: 'var(--text-muted)' }}>Package:</span>
                    <strong>{sessionType}</strong>
                    <span style={{ color: 'var(--accent-orange)', fontWeight: 700 }}>
                      ₹{getPackagePrice(sessionType).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="e.g. Rahul Sharma"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="mobile-single-col">
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="sharma@gmail.com"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="phone">Phone Number *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="9999999999"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="budget">Estimated Project / Construction Budget</label>
                  <select
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    className="form-control"
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="Under ₹50 Lakhs">Under ₹50 Lakhs</option>
                    <option value="₹50 Lakhs - ₹1 Crore">₹50 Lakhs - ₹1 Crore</option>
                    <option value="₹1 Crore - ₹2.5 Crores">₹1 Crore - ₹2.5 Crores</option>
                    <option value="₹2.5 Crores - ₹5 Crores">₹2.5 Crores - ₹5 Crores</option>
                    <option value="₹5 Crores+ (Ultra Luxury)">₹5 Crores+ (Ultra Luxury)</option>
                    <option value="Planning Phase / Architecture Design">Planning Phase / Architecture Design</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="message">Message / Floor Plan Status (Optional)</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="e.g. Planning my house layout in Gurgaon. Excavation starts next month."
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.95rem', fontSize: '1.05rem', fontWeight: 700 }}
                  disabled={submitStatus.loading}
                >
                  {submitStatus.loading ? 'Saving Booking Lead...' : 'Proceed to Step 4: Confirmation →'}
                </button>

                {submitStatus.error && (
                  <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '6px', color: '#ef4444', fontSize: '0.9rem', textAlign: 'center' }}>
                    {submitStatus.error}
                  </div>
                )}
              </form>
            )}

            {/* STEP 4: CONFIRMATION SCREEN WITH EXACT SUMMARY CARD & RAZORPAY PAYMENT */}
            {bookingStep === 4 && confirmedBooking && (
              <div style={{ textAlign: 'center', padding: '1rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>

                <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', width: '100%', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                    {confirmedBooking.isUnpaidWarning ? 'Step 4: Booking Confirmation' : 'Appointment & Payment Confirmed!'}
                  </h3>
                </div>

                {/* THE EXACT REQUESTED BOOKING SUMMARY CARD */}
                <div className="glass-card" style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1.5px solid var(--accent-orange)',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  width: '100%',
                  textAlign: 'left'
                }}>

                  {/* Service, Date, Time Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', borderBottom: '1px dashed rgba(255,255,255,0.12)', paddingBottom: '1.25rem' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SERVICE:</span>
                      <strong style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 700 }}>{confirmedBooking.service}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SCHEDULED DATE:</span>
                      <strong style={{ color: 'var(--accent-orange)', fontSize: '1.05rem', fontWeight: 700 }}>{confirmedBooking.date}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TIME SLOT:</span>
                      <strong style={{ color: 'var(--accent-orange)', fontSize: '1.05rem', fontWeight: 700 }}>{confirmedBooking.time}</strong>
                    </div>
                  </div>

                  {/* Price & Action Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '0.25rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Total Package Price: </span>
                      <strong style={{ color: '#ffffff', fontSize: '1.4rem', fontWeight: 800 }}>₹{confirmedBooking.totalPrice.toLocaleString('en-IN')}</strong>
                    </div>

                    {confirmedBooking.isUnpaidWarning ? (
                      <button
                        onClick={() => launchRazorpayCheckout(confirmedBooking.bookingId, confirmedBooking.totalPrice, confirmedBooking.name, confirmedBooking.email, confirmedBooking.phone)}
                        style={{
                          background: 'rgba(239, 199, 25, 0.15)',
                          border: '1.5px solid var(--accent-orange)',
                          color: 'var(--accent-orange)',
                          padding: '0.65rem 1.25rem',
                          borderRadius: '30px',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          cursor: 'pointer',
                          boxShadow: '0 4px 15px rgba(239, 199, 25, 0.15)',
                          transition: 'all 0.2s'
                        }}
                      >
                        Pay Booking Amount Now: ₹5,000
                      </button>
                    ) : (
                      <div style={{ background: 'rgba(37, 211, 102, 0.15)', border: '1px solid #25D366', color: '#25D366', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <CheckCircle size={16} /> Paid ₹5,000 Token Deposit
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.85rem' }}>
                    * Remaining balance of ₹{confirmedBooking.balancePending.toLocaleString('en-IN')} payable after team contacts you.
                  </div>
                </div>

                {/* Additional Payment & Booking Reference Information */}
                <div className="glass-card" style={{
                  width: '100%',
                  background: 'rgba(255, 255, 25, 0.02)',
                  border: '1px solid rgba(255, 255, 25, 0.08)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Booking Reference ID:</span>
                    <strong style={{ color: 'var(--accent-orange)', fontSize: '0.95rem', fontFamily: 'monospace' }}>#{confirmedBooking.bookingId}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Customer Name:</span>
                    <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>{confirmedBooking.name}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Estimated Budget:</span>
                    <strong style={{ color: 'var(--accent-orange)', fontSize: '0.9rem' }}>{confirmedBooking.budget || formData.budget || 'N/A'}</strong>
                  </div>

                  {confirmedBooking.paymentId && confirmedBooking.paymentId !== 'Unpaid / Pending' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Razorpay Payment ID:</span>
                      <code style={{ color: '#ffffff', background: 'rgba(0,0,0,0.3)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                        {confirmedBooking.paymentId}
                      </code>
                    </div>
                  )}

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    📞 Our team will contact you at <strong style={{ color: '#ffffff' }}>{confirmedBooking.phone}</strong> to confirm your floor plan drawing files and assist with your session!
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', marginTop: '0.5rem', width: '100%' }}>
                  {confirmedBooking.isUnpaidWarning ? (
                    <>
                      <button
                        type="button"
                        onClick={() => launchRazorpayCheckout(confirmedBooking.bookingId, confirmedBooking.totalPrice, confirmedBooking.name, confirmedBooking.email, confirmedBooking.phone)}
                        className="btn-primary"
                        style={{
                          width: '100%',
                          maxWidth: '450px',
                          justifyContent: 'center',
                          padding: '1.1rem 2rem',
                          fontSize: '1.15rem',
                          fontWeight: 800,
                          letterSpacing: '0.02em',
                          boxShadow: '0 4px 20px rgba(239, 199, 25, 0.35)'
                        }}
                      >
                        Pay Booking Amount Now: ₹5,000 →
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setConfirmedBooking(null);
                          setBookingStep(1);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontSize: '0.88rem',
                          textDecoration: 'underline',
                          marginTop: '0.25rem'
                        }}
                      >
                        Or Book Another Appointment
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmedBooking(null);
                        setBookingStep(1);
                      }}
                      className="btn-primary"
                      style={{ padding: '0.8rem 2.5rem' }}
                    >
                      Book Another Appointment
                    </button>
                  )}
                </div>
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              ⚠️ Once excavation starts, structural changes cost ₹3 to 10 lakhs. Test-drive now.
            </div>
          </div>
        </div>
      </section>

      {/* CONNECT WITH US MAIL MINI-FORM MODAL */}
      {isContactModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(7, 10, 18, 0.85)',
          backdropFilter: 'blur(16px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '550px',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid rgba(239, 199, 25, 0.3)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.6), 0 0 30px rgba(239, 199, 25,0.15)',
            padding: 'clamp(1.25rem, 5vw, 2.5rem)',
            borderRadius: '16px',
            position: 'relative',
            backgroundColor: '#0b1a2e',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            {/* Close Button */}
            <button
              onClick={() => setIsContactModalOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '1.5rem',
                cursor: 'pointer',
                transition: 'color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => e.target.style.color = '#ffffff'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
            >
              ✕
            </button>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: '#ffffff' }}>
                Connect With Us
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Have a query? Drop us a mail through this quick form.
              </p>
            </div>

            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-name">Full Name</label>
                <input
                  type="text"
                  id="contact-name"
                  name="name"
                  value={contactFormData.name}
                  onChange={handleContactInputChange}
                  className="form-control"
                  placeholder="e.g. Rahul Sharma"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-email">Email Address</label>
                <input
                  type="email"
                  id="contact-email"
                  name="email"
                  value={contactFormData.email}
                  onChange={handleContactInputChange}
                  className="form-control"
                  placeholder="sharma@gmail.com"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-phone">Phone Number</label>
                <input
                  type="tel"
                  id="contact-phone"
                  name="phone"
                  value={contactFormData.phone}
                  onChange={handleContactInputChange}
                  className="form-control"
                  placeholder="9999999999"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-message">Query / Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={contactFormData.message}
                  onChange={handleContactInputChange}
                  className="form-control"
                  placeholder="Tell us about your home plan query..."
                  rows={4}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '0.9rem' }}
                disabled={contactSubmitStatus.loading}
              >
                {contactSubmitStatus.loading ? 'Sending Query...' : 'Send Mail Inquiry →'}
              </button>

              {contactSubmitStatus.success && (
                <div style={{ padding: '1rem', background: 'rgba(37,211,102,0.1)', border: '1px solid #25D366', borderRadius: '6px', color: '#25D366', fontSize: '0.9rem', textAlign: 'center' }}>
                  {contactSubmitStatus.success}
                </div>
              )}

              {contactSubmitStatus.error && (
                <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '6px', color: '#ef4444', fontSize: '0.9rem', textAlign: 'center' }}>
                  {contactSubmitStatus.error}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 576px) {
          .mobile-single-col {
            grid-template-columns: 1fr !important;
            gap: 0 !important;
          }
        }
        @keyframes pulse-glow {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        .map-glow {
          animation: pulse-glow 2s infinite ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Home;
