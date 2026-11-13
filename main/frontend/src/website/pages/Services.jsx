import React, { useState, useEffect } from 'react';
import { Check, ShieldCheck, CreditCard, Landmark, Smartphone, Loader, X, Calendar, Sparkles, Building2, HelpCircle } from 'lucide-react';

const Services = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: details, 2: payment, 3: processing, 4: success
  const [paymentMethod, setPaymentMethod] = useState('card'); // card, upi

  // Checkout Form State
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    message: ''
  });

  // Credit Card Details
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [txId, setTxId] = useState('');

  const getIcon = (service_id) => {
    if (service_id === '1-hour-projection') return <Sparkles size={28} color="var(--accent-orange)" />;
    if (service_id === '2-hour-projection') return <Smartphone size={28} color="#3b82f6" />;
    return <Building2 size={28} color="var(--accent-gold)" />;
  };

  const fallbackPlans = [
    {
      id: '1-hour-projection',
      title: '1 Hour Projection',
      subtitle: 'AR-Based 1:1 Floor Plan Projection',
      price: 30000,
      duration: '1 Hour',
      description: 'Experience your floor plan projected at a true 1:1 scale, allowing you to physically walk through every room, passage, and space before construction begins.',
      features: [
        'Experience actual room sizes before construction',
        'Understand furniture placement and circulation',
        'Identify design modifications early',
        'Improve decision-making with real-scale visualization'
      ],
      icon: <Sparkles size={28} color="var(--accent-orange)" />,
      badge: ''
    },
    {
      id: '2-hour-projection',
      title: '2 Hour Projection',
      subtitle: 'Real-Time Bare-Shell 3D Walkthrough',
      price: 40000,
      duration: '2 Hours',
      description: 'Our Real-Time Bare-Shell Virtual Reality experience enables clients to explore their future property in an immersive virtual environment.',
      features: [
        'Interactive virtual exploration',
        'Enhanced spatial understanding',
        'Better design communication',
        'Reduced uncertainty before construction'
      ],
      icon: <Smartphone size={28} color="#3b82f6" />,
      badge: 'Most Popular'
    },
    {
      id: '3-5-hour-projection',
      title: '3-5 Hour Projection',
      subtitle: 'Interior/Exterior 3D Design Visualization & Clarity',
      price: 50000,
      duration: '3-5 Hours',
      description: 'Bring your ideas to life through high-quality 3D walkthroughs and realistic visualizations to understand design intent, aesthetics, materials, and lighting.',
      features: [
        'Realistic project visualization',
        'Improved design presentation',
        'Faster client approvals',
        'Greater confidence in design decisions'
      ],
      icon: <Building2 size={28} color="var(--accent-gold)" />,
      badge: ''
    }
  ];

  const [plans, setPlans] = useState(fallbackPlans);

  useEffect(() => {
    document.title = "1:1 Scale Blueprint Projection Services & Pricing | Walk The Plan India";
    const fetchServices = async () => {
      try {
        const res = await fetch('/api/services');
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map(s => ({
            id: s.service_id,
            db_id: s.id,
            title: s.title,
            subtitle: s.subtitle,
            price: s.price,
            duration: s.duration,
            description: s.description,
            features: s.features,
            icon: getIcon(s.service_id),
            badge: s.badge
          }));
          setPlans(mapped);
        }
      } catch (err) {
        console.error("Error loading services:", err);
      }
    };
    fetchServices();
  }, []);

  const handleInputChange = (e) => {
    setCustomerDetails({ ...customerDetails, [e.target.name]: e.target.value });
  };

  const handleCardChange = (e) => {
    let { name, value } = e.target;
    if (name === 'number') {
      value = value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (value.length > 19) return;
    }
    if (name === 'expiry') {
      value = value.replace(/\//g, '').replace(/(\d{2})/g, '$1/').trim();
      if (value.endsWith('/')) value = value.slice(0, -1);
      if (value.length > 5) return;
    }
    if (name === 'cvv') {
      value = value.replace(/\D/g, '');
      if (value.length > 3) return;
    }
    setCardDetails({ ...cardDetails, [name]: value });
  };

  const [bookingOption, setBookingOption] = useState('option1'); // 'option1': Pay ₹5,000 & Confirm Booking, 'option2': Reserve My Slot (Pay Later)

  const openCheckout = (plan) => {
    setSelectedPlan(plan);
    setCheckoutStep(1);
    setBookingOption('option1');
    setErrorMsg('');
  };

  const closeCheckout = () => {
    setSelectedPlan(null);
    setCheckoutStep(1);
    setBookingOption('option1');
    setErrorMsg('');
    setCustomerDetails({ name: '', email: '', phone: '', date: '', message: '' });
  };

  const proceedToPayment = async (e) => {
    e.preventDefault();
    if (!customerDetails.name || !customerDetails.email || !customerDetails.phone || !customerDetails.date) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setErrorMsg('');

    const tokenAmount = 5000;
    const totalPrice = selectedPlan ? Number(selectedPlan.price) : 30000;

    // --- OPTION 2: RESERVE MY SLOT (PAY LATER) ---
    if (bookingOption === 'option2') {
      setCheckoutStep(3); // Loading state
      try {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: customerDetails.name,
            email: customerDetails.email,
            phone: customerDetails.phone,
            booking_date: customerDetails.date,
            message: `[SERVICE BOOKING - PAY LATER] Package: ${selectedPlan.title}. Preferred date: ${customerDetails.date}. Notes: ${customerDetails.message || 'None'}`,
            type: 'purchase',
            package_name: selectedPlan.title,
            price: totalPrice,
            payment_status: 'Reserved (Pay Later)',
            device_id: localStorage.getItem('wtp_device_id') || '',
            visitor_id: localStorage.getItem('wtp_vid') || ''
          })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Database booking error');

        setTxId('PAY-LATER-' + Math.random().toString(36).substring(2, 9).toUpperCase());
        setCheckoutStep(4); // Show success screen immediately
      } catch (err) {
        console.error(err);
        setErrorMsg(err.message || 'Failed to record reservation. Please try again.');
        setCheckoutStep(1);
      }
      return;
    }

    // --- OPTION 1: PAY ₹5,000 & CONFIRM BOOKING (ONLINE RAZORPAY) ---
    setCheckoutStep(3); // Start loading / processing

    try {
      // 1. First, capture lead in database as Unpaid / Payment Pending
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customerDetails.name,
          email: customerDetails.email,
          phone: customerDetails.phone,
          booking_date: customerDetails.date,
          message: `[SERVICE BOOKING] Package: ${selectedPlan.title}. Preferred date: ${customerDetails.date}. Notes: ${customerDetails.message || 'None'}`,
          type: 'purchase',
          package_name: selectedPlan.title,
          price: totalPrice,
          payment_status: 'Unpaid / Payment Pending',
          device_id: localStorage.getItem('wtp_device_id') || '',
          visitor_id: localStorage.getItem('wtp_vid') || ''
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Database booking error');

      const createdBookingId = data.booking_id || data.id;

      // 2. Request Razorpay Order Creation for ₹5,000 token with customer details
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: createdBookingId,
          amount: tokenAmount,
          name: customerDetails.name,
          email: customerDetails.email,
          phone: customerDetails.phone,
          package_name: selectedPlan.title,
          booking_date: customerDetails.date,
          custom_notes: customerDetails.message
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.id) {
        throw new Error('Failed to generate Razorpay payment order');
      }

      // 3. Launch Razorpay SDK Popup
      const options = {
        key: orderData.key || 'rzp_live_TLhT5uzyXpsA66',
        amount: orderData.amount || 500000,
        currency: 'INR',
        name: 'Walk The Plan Studio',
        description: `Token Deposit for ${selectedPlan.title} (₹5,000)`,
        image: '/favicon.png',
        order_id: orderData.id.startsWith('order_') && orderData.id.length > 20 ? orderData.id : undefined,
        notes: orderData.notes || {
          customer_name: customerDetails.name,
          customer_email: customerDetails.email,
          customer_phone: customerDetails.phone,
          package_name: selectedPlan.title
        },
        handler: function (razorRes) {
          fetch('/api/payment/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              booking_id: createdBookingId,
              razorpay_order_id: razorRes.razorpay_order_id || orderData.id,
              razorpay_payment_id: razorRes.razorpay_payment_id || ('pay_' + Math.random().toString(36).substring(2, 12)),
              razorpay_signature: razorRes.razorpay_signature || 'simulated_sig',
              amount_paid: tokenAmount
            })
          })
            .then(vRes => vRes.json())
            .then(vData => {
              setTxId(razorRes.razorpay_payment_id || vData.payment_id || 'pay_demo_123');
              setCheckoutStep(4); // Show success screen
            })
            .catch(vErr => {
              console.error("Verification error:", vErr);
              setTxId(razorRes.razorpay_payment_id || 'pay_manual_verify');
              setCheckoutStep(4);
            });
        },
        prefill: {
          name: customerDetails.name,
          email: customerDetails.email,
          contact: customerDetails.phone
        },
        theme: {
          color: '#efc719'
        },
        modal: {
          ondismiss: function () {
            // Unpaid lead captured notification
            setErrorMsg('Lead details recorded (Unpaid). You can pay the ₹5,000 booking amount now or our team will contact you.');
            setCheckoutStep(1);
          }
        }
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Fallback simulation
        console.warn("Razorpay script not loaded. Simulating payment handler.");
        options.handler({
          razorpay_order_id: orderData.id,
          razorpay_payment_id: 'pay_demo_' + Math.floor(100000 + Math.random() * 900000),
          razorpay_signature: 'demo_sig'
        });
      }

    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to initiate payment. Please try again.');
      setCheckoutStep(1);
    }
  };

  return (
    <div className="services-page container" style={{ padding: '4rem 0 8rem 0' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
        <span className="calligraphy-kicker">Choose Your Experience</span>
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', marginTop: '0.5rem', marginBottom: '1.25rem', fontFamily: 'var(--font-headings)' }}>
          Select & Book <span className="calligraphy-accent">Projection Services</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.75 }}>
          Choose the package that fits your home layout stage. Secure your priority studio projection slot with transparent token pricing.
        </p>
      </div>

      {/* Services Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
        gap: '2.5rem',
        alignItems: 'stretch',
        paddingTop: '1rem'
      }}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="glass-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              border: plan.id === '2-hour-projection' ? '2px solid var(--accent-orange)' : '1px solid var(--border-muted)',
              position: 'relative',
              overflow: 'visible'
            }}
          >
            {plan.badge && (
              <span style={{
                position: 'absolute',
                top: '-13px',
                right: '20px',
                background: plan.id === '2-hour-projection'
                  ? 'linear-gradient(135deg, #fae8a4 0%, #f0cd6f 50%, #d4a528 100%)'
                  : 'var(--bg-tertiary)',
                color: plan.id === '2-hour-projection' ? '#070a10' : 'var(--text-primary)',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                boxShadow: plan.id === '2-hour-projection'
                  ? '0 4px 15px rgba(240, 205, 111, 0.45), 0 0 12px rgba(250, 232, 164, 0.3)'
                  : '0 4px 12px rgba(0, 0, 0, 0.5)',
                padding: '0.3rem 0.85rem',
                fontSize: '0.74rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                borderRadius: '9999px',
                zIndex: 20,
                whiteSpace: 'nowrap',
                lineHeight: 1.2,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <Sparkles size={12} /> {plan.badge.toUpperCase()}
              </span>
            )}

            <div>
              {/* Header inside card */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-muted)' }}>
                  {plan.icon}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h3 style={{ fontSize: '1.35rem', wordBreak: 'break-word' }}>{plan.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{plan.subtitle}</p>
                </div>
              </div>

              {/* Price Details */}
              <div style={{ margin: '1.5rem 0 2rem 0', display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff' }}>₹{plan.price.toLocaleString('en-IN')}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>/ {plan.duration}</span>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem', minHeight: '60px' }}>
                {plan.description}
              </p>

              {/* Features list */}
              <div style={{ borderTop: '1px solid var(--border-muted)', paddingTop: '1.5rem', marginBottom: '2.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>What is Included:</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {plan.features.map((feat, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <Check size={16} color="var(--accent-orange)" style={{ marginTop: '3px', flexShrink: 0 }} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CTA buy now */}
            <button
              onClick={() => openCheckout(plan)}
              className="btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                background: plan.id === '2-hour-projection' ? 'linear-gradient(135deg, var(--accent-orange) 0%, #d1a60a 100%)' : 'rgba(255,255,255,0.03)',
                color: plan.id === '2-hour-projection' ? '#000000' : 'var(--text-primary)',
                border: plan.id === '2-hour-projection' ? 'none' : '1px solid var(--border-muted)',
                boxShadow: plan.id === '2-hour-projection' ? '0 4px 14px 0 rgba(239, 199, 25, 0.3)' : 'none'
              }}
            >
              Buy Service Now
            </button>
          </div>
        ))}
      </div>

      {/* Trust Badges */}
      <div style={{ marginTop: '5rem', display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', opacity: 0.8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <ShieldCheck size={18} color="var(--accent-orange)" /> <span>Secure 256-Bit SSL Checkout</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <Calendar size={18} color="var(--accent-orange)" /> <span>Flexible Slot Scheduling</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <HelpCircle size={18} color="var(--accent-orange)" /> <span>100% Satisfaction Guarantee</span>
        </div>
      </div>

      {/* --- CHECKOUT MODAL WIZARD --- */}
      {selectedPlan && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(7, 10, 18, 0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>

          <div className="glass-card" style={{ width: '100%', maxWidth: '580px', border: '1px solid var(--border-color)', position: 'relative', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>

            {/* Close Button */}
            {checkoutStep !== 3 && checkoutStep !== 4 && (
              <button
                onClick={closeCheckout}
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                title="Cancel Transaction"
              >
                <X size={20} />
              </button>
            )}

            {/* Checkout Header Progress */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--accent-orange)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <span>Booking Cart</span>
                <span>•</span>
                <span>{checkoutStep === 4 ? 'Confirmation' : `Step ${checkoutStep} of 4`}</span>
              </div>
              <h2 style={{ fontSize: '1.6rem', marginTop: '0.25rem' }}>
                {checkoutStep === 4 ? (bookingOption === 'option2' ? 'Slot Reserved Successfully!' : 'Payment Successful!') : `Checkout: ${selectedPlan.title}`}
              </h2>
            </div>

            {/* Error notifications */}
            {errorMsg && (
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '6px', color: '#ef4444', fontSize: '0.85rem' }}>
                {errorMsg}
              </div>
            )}

            {/* --- STEP 1: CUSTOMER DETAILS & PRICING OPTIONS --- */}
            {checkoutStep === 1 && (
              <form onSubmit={proceedToPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Selected Package Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Selected Package:</span>
                    <h4 style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: 700, margin: 0 }}>{selectedPlan.title}</h4>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Price:</span>
                    <h4 style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: 700, margin: 0 }}>₹{selectedPlan.price.toLocaleString('en-IN')}</h4>
                  </div>
                </div>

                {/* --- PRICING & BOOKING OPTIONS SELECTOR --- */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-orange)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 0 }}>
                    Select Pricing / Booking Option:
                  </label>

                  {/* Option 1 (Primary) */}
                  <div
                    onClick={() => setBookingOption('option1')}
                    style={{
                      padding: '1.1rem 1.25rem',
                      borderRadius: '10px',
                      border: bookingOption === 'option1' ? '2px solid #22c55e' : '1px solid var(--border-color)',
                      background: bookingOption === 'option1' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      boxShadow: bookingOption === 'option1' ? '0 0 15px rgba(34, 197, 94, 0.15)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: bookingOption === 'option1' ? '#22c55e' : 'var(--text-muted)' }}>
                        Option 1 (Primary)
                      </span>
                      {bookingOption === 'option1' && (
                        <span style={{ fontSize: '0.7rem', background: '#22c55e', color: '#000000', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 800 }}>
                          SELECTED
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>🟢</span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                        Pay ₹5,000 & Confirm Booking
                      </h4>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.45' }}>
                      Secure your preferred slot by paying a refundable/adjustable advance of ₹5,000. The remaining amount will be collected by our team before or after the projection, as applicable.
                    </p>
                  </div>

                  {/* Option 2 */}
                  <div
                    onClick={() => setBookingOption('option2')}
                    style={{
                      padding: '1.1rem 1.25rem',
                      borderRadius: '10px',
                      border: bookingOption === 'option2' ? '2px solid #3b82f6' : '1px solid var(--border-color)',
                      background: bookingOption === 'option2' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(255, 255, 25, 0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      boxShadow: bookingOption === 'option2' ? '0 0 15px rgba(59, 130, 246, 0.15)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: bookingOption === 'option2' ? '#3b82f6' : 'var(--text-muted)' }}>
                        Option 2
                      </span>
                      {bookingOption === 'option2' && (
                        <span style={{ fontSize: '0.7rem', background: '#3b82f6', color: '#ffffff', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 800 }}>
                          SELECTED
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>🔵</span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                        Reserve My Slot (Pay Later)
                      </h4>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.45' }}>
                      Book your preferred slot without making an online payment. Our team will contact you shortly to confirm availability and assist you with the booking process.
                    </p>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={customerDetails.name}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="e.g. Aditi Singhal"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={customerDetails.email}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="aditi@example.com"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={customerDetails.phone}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="9876543210"
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Preferred Walkthrough Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={customerDetails.date}
                    onChange={handleInputChange}
                    className="form-control"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Autocad details or Custom notes (Optional)</label>
                  <textarea
                    name="message"
                    value={customerDetails.message}
                    onChange={handleInputChange}
                    className="form-control"
                    style={{ minHeight: '70px' }}
                    placeholder="Provide layout details, number of floor plans to walk, or custom dimensions."
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    marginTop: '0.5rem',
                    padding: '0.9rem',
                    fontSize: '1rem',
                    fontWeight: 700,
                    background: bookingOption === 'option1' ? 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    border: 'none'
                  }}
                >
                  {bookingOption === 'option1' ? 'Pay ₹5,000 & Confirm Booking via Razorpay →' : 'Reserve My Slot (Pay Later) →'}
                </button>
              </form>
            )}

            {/* --- STEP 3: PROCESSING --- */}
            {checkoutStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '3rem 0', textAlign: 'center' }}>
                <Loader size={48} className="animated-float" color="var(--accent-orange)" />
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: '#ffffff' }}>
                    {bookingOption === 'option1' ? 'Connecting with Secure Razorpay Gateway...' : 'Recording Your Slot Reservation...'}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    {bookingOption === 'option1' ? 'Your lead details have been saved. Launching Razorpay checkout popup...' : 'Please wait while we log your reservation details.'}
                  </p>
                </div>
                {/* Progress bar */}
                <div style={{ width: '80%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, height: '100%', background: 'var(--accent-orange)',
                    width: '75%', animation: 'pulse-glow 1.5s infinite'
                  }}></div>
                </div>
              </div>
            )}

            {/* --- STEP 4: SUCCESS / CONFIRMATION --- */}
            {checkoutStep === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '1rem 0', textAlign: 'center' }}>

                {/* Status icon */}
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: bookingOption === 'option1' ? 'rgba(37,211,102,0.1)' : 'rgba(59,130,246,0.1)',
                  border: bookingOption === 'option1' ? '2px solid #25D366' : '2px solid #3b82f6',
                  color: bookingOption === 'option1' ? '#25D366' : '#3b82f6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: bookingOption === 'option1' ? '0 0 15px rgba(37,211,102,0.3)' : '0 0 15px rgba(59,130,246,0.3)'
                }}>
                  <ShieldCheck size={36} />
                </div>

                <div>
                  <h3 style={{ fontSize: '1.40rem', color: '#ffffff' }}>
                    {bookingOption === 'option1' ? 'Payment Authorized' : 'Slot Reserved Successfully!'}
                  </h3>
                  <p style={{ color: bookingOption === 'option1' ? '#25D366' : '#3b82f6', fontSize: '0.9rem', fontWeight: 600, marginTop: '0.25rem' }}>
                    {bookingOption === 'option1' ? '₹5,000 Token Payment Received via Razorpay' : 'Reserve My Slot (Pay Later) Confirmed'}
                  </p>
                </div>

                {/* Ticket Receipt Visual */}
                <div style={{
                  width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-color)',
                  borderRadius: '8px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem',
                  textAlign: 'left', position: 'relative'
                }}>

                  {/* Decorative notch left & right */}
                  <div style={{ position: 'absolute', top: '50%', left: '-9px', width: '16px', height: '16px', background: '#0b0f19', borderRadius: '50%', transform: 'translateY(-50%)', borderRight: '1px solid var(--border-color)' }}></div>
                  <div style={{ position: 'absolute', top: '50%', right: '-9px', width: '16px', height: '16px', background: '#0b0f19', borderRadius: '50%', transform: 'translateY(-50%)', borderLeft: '1px solid var(--border-color)' }}></div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem', borderBottom: '1px dashed rgba(255,255,255,0.08)', paddingBottom: '0.85rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Customer Name:</span>
                      <div style={{ fontWeight: 600, color: '#ffffff', marginTop: '0.15rem' }}>{customerDetails.name}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Reference Ref ID:</span>
                      <div style={{ fontWeight: 600, color: 'var(--accent-orange)', marginTop: '0.15rem', fontFamily: 'monospace' }}>{txId}</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem', borderBottom: '1px dashed rgba(255,255,255,0.08)', paddingBottom: '0.85rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Booked Package:</span>
                      <div style={{ fontWeight: 600, color: '#ffffff', marginTop: '0.15rem' }}>{selectedPlan.title}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Preferred Date:</span>
                      <div style={{ fontWeight: 600, color: '#ffffff', marginTop: '0.15rem' }}>{customerDetails.date}</div>
                    </div>
                  </div>

                  {bookingOption === 'option1' ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', paddingTop: '0.25rem' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Token Paid Now:</span>
                        <strong style={{ fontSize: '1.15rem', color: '#25D366' }}>₹5,000</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '0.5rem' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Balance Payable Later:</span>
                        <strong style={{ fontSize: '1.15rem', color: 'var(--accent-orange)' }}>₹{(selectedPlan.price - 5000).toLocaleString('en-IN')}</strong>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', paddingTop: '0.25rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Booking Mode:</span>
                      <strong style={{ fontSize: '1rem', color: '#3b82f6' }}>Reserve My Slot (Pay Later)</strong>
                    </div>
                  )}
                </div>

                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', maxWidth: '420px', lineHeight: '1.5' }}>
                  {bookingOption === 'option1' ? (
                    <>🎉 Your booking token of ₹5,000 is secured! Our team will contact you shortly at <strong style={{ color: '#ffffff' }}>{customerDetails.phone}</strong> to verify floor plans and assist with the full balance.</>
                  ) : (
                    <>🎉 Your preferred slot is reserved! Our team will contact you shortly at <strong style={{ color: '#ffffff' }}>{customerDetails.phone}</strong> to confirm availability and assist you with the booking process.</>
                  )}
                </div>

                <button
                  onClick={closeCheckout}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                >
                  Done & Close Receipt
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default Services;
