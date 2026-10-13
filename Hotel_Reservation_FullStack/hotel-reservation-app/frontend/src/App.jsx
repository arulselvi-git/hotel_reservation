import React, { useEffect, useMemo, useState } from 'react';
import { Search, MapPin, CalendarDays, Users, BedDouble, ShieldCheck, Coffee, Wifi, ArrowRight, X, CheckCircle2, Hotel, ClipboardList, RotateCcw } from 'lucide-react';

const API = 'http://localhost:8080/api';
const tomorrow = () => { const d = new Date(); d.setDate(d.getDate()+1); return d.toISOString().slice(0,10); };
const afterTomorrow = () => { const d = new Date(); d.setDate(d.getDate()+2); return d.toISOString().slice(0,10); };
const money = n => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n || 0);

export default function App() {
  const [checkIn,setCheckIn] = useState(tomorrow());
  const [checkOut,setCheckOut] = useState(afterTomorrow());
  const [guests,setGuests] = useState('2');
  const [rooms,setRooms] = useState([]);
  const [properties,setProperties] = useState([]);
  const [bookings,setBookings] = useState([]);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');
  const [notice,setNotice] = useState('');
  const [selected,setSelected] = useState(null);
  const [form,setForm] = useState({guestName:'',email:''});
  const [tab,setTab] = useState('discover');

  async function request(url, options={}) {
    const response = await fetch(API+url,{headers:{'Content-Type':'application/json'},...options});
    const body = await response.json().catch(()=>({}));
    if (!response.ok) throw new Error(body.message || body.error || `Request failed (${response.status})`);
    return body;
  }
  async function searchRooms() {
    setLoading(true); setError(''); setNotice('');
    try {
      const q = new URLSearchParams({checkIn,checkOut,guests});
      setRooms(await request('/rooms?'+q.toString()));
    } catch(e) { setError(e.message || 'Could not connect to the backend. Start Spring Boot first.'); }
    finally { setLoading(false); }
  }
  async function loadInitial() {
    try { setProperties(await request('/properties')); } catch(e) { setError('Backend not connected. Start the backend using mvn spring-boot:run.'); }
  }
  async function loadBookings() {
    try { setBookings(await request('/reservations')); } catch(e) { setError('Could not load reservations. Check that the backend is running.'); }
  }
  useEffect(()=>{ loadInitial(); searchRooms(); },[]);
  useEffect(()=>{ if(tab==='bookings') loadBookings(); },[tab]);

  async function bookRoom(e) {
    e.preventDefault(); setError(''); setNotice('');
    try {
      const booking = await request('/reservations',{method:'POST',body:JSON.stringify({
        guestName:form.guestName,email:form.email,roomId:selected.id,checkIn,checkOut,guests:Number(guests)
      })});
      setNotice(`Booking confirmed! Your reservation number is #${booking.id}. Demo payment completed.`);
      setSelected(null); setForm({guestName:'',email:''}); await searchRooms(); await loadBookings(); setTab('bookings');
    } catch(e) { setError(e.message); }
  }
  async function cancelBooking(id) {
    try { await request(`/reservations/${id}/cancel`,{method:'POST'}); setNotice(`Reservation #${id} cancelled.`); await loadBookings(); await searchRooms(); }
    catch(e) { setError(e.message); }
  }
  async function retryPayment(id) {
    try { const r=await request(`/reservations/${id}/payment/retry`,{method:'POST'}); setNotice(r.message); await loadBookings(); }
    catch(e) { setError(e.message); }
  }
  const nights = useMemo(()=>Math.max(1,Math.round((new Date(checkOut)-new Date(checkIn))/86400000)),[checkIn,checkOut]);
  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#" onClick={()=>setTab('discover')}><span className="brand-mark"><Hotel size={22}/></span><span>Stay<span className="brand-accent">Ease</span><small>STAYS MADE SIMPLE</small></span></a><nav><button className={tab==='discover'?'nav-link active':'nav-link'} onClick={()=>setTab('discover')}>Discover stays</button><button className={tab==='bookings'?'nav-link active':'nav-link'} onClick={()=>setTab('bookings')}><ClipboardList size={16}/> My bookings</button></nav><div className="secure"><ShieldCheck size={17}/> Secure booking</div></header>
    <main>
      {tab==='discover' ? <>
        <section className="hero"><div className="hero-copy"><div className="eyebrow"><span/> YOUR NEXT STAY STARTS HERE</div><h1>Find a place<br/>to <em>feel at home.</em></h1><p>Thoughtfully selected stays, easy reservations, and a smoother way to travel.</p><div className="hero-points"><span><CheckCircle2 size={16}/> Easy booking</span><span><CheckCircle2 size={16}/> Clear pricing</span><span><CheckCircle2 size={16}/> Instant confirmation</span></div></div><div className="hero-art"><div className="sun"></div><div className="art-building building-back"></div><div className="art-building building-front"><div className="window-grid"><i/><i/><i/><i/><i/><i/></div></div><div className="plant"><i/><i/><i/></div><div className="art-caption"><span className="caption-icon"><MapPin size={16}/></span><span><b>Find your happy place</b><small>Stay a little differently.</small></span></div></div></section>
        <section className="search-card"><div className="search-heading"><div><span className="mini-label">PLAN YOUR STAY</span><h2>Where are you headed?</h2></div><span className="date-note"><CalendarDays size={16}/> Flexible dates, better stays</span></div><form className="search-form" onSubmit={e=>{e.preventDefault(); if(checkOut<=checkIn){setError('Check-out must be after check-in.');return;} searchRooms();}}><label className="field"><span><MapPin size={16}/> DESTINATION</span><select value={properties.length?'all':'all'} onChange={()=>{}}><option value="all">All destinations</option>{properties.map(p=><option key={p.id}>{p.city}</option>)}</select></label><label className="field"><span><CalendarDays size={16}/> CHECK-IN</span><input type="date" min={tomorrow()} value={checkIn} onChange={e=>setCheckIn(e.target.value)} required/></label><label className="field"><span><CalendarDays size={16}/> CHECK-OUT</span><input type="date" min={checkIn} value={checkOut} onChange={e=>setCheckOut(e.target.value)} required/></label><label className="field guest-field"><span><Users size={16}/> GUESTS</span><select value={guests} onChange={e=>setGuests(e.target.value)}>{[1,2,3,4].map(n=><option key={n} value={n}>{n} {n===1?'guest':'guests'}</option>)}</select></label><button className="search-button" type="submit" disabled={loading}><Search size={18}/>{loading?'Searching':'Search stays'}</button></form></section>
        {error&&<div className="alert error"><X size={18}/>{error}<button onClick={()=>setError('')}><X size={15}/></button></div>}
        {notice&&<div className="alert success"><CheckCircle2 size={18}/>{notice}<button onClick={()=>setNotice('')}><X size={15}/></button></div>}
        <section className="results-section"><div className="section-title"><div><span className="mini-label">HANDPICKED FOR YOU</span><h2>Available stays <span className="count">{rooms.length}</span></h2><p>Comfortable rooms for your next trip.</p></div><div className="nights-chip"><CalendarDays size={15}/>{nights} {nights===1?'night':'nights'}</div></div>
          {loading?<div className="empty-state">Finding your stay...</div>:rooms.length===0?<div className="empty-state"><BedDouble size={30}/><h3>No rooms available</h3><p>Try different dates or reduce the number of guests.</p><button className="outline-button" onClick={searchRooms}><RotateCcw size={15}/> Search again</button></div>:<div className="room-grid">{rooms.map((room,i)=><article className="room-card" key={room.id}><div className={`room-image image-${i%3}`}><div className="image-badge">{i===0?'GUEST FAVOURITE':i===1?'GREAT VALUE':'COMFORT STAY'}</div><div className="room-illustration"><div className="room-wall"><div className="room-window"/><div className="room-picture"/></div><div className="bed"><div className="pillow"/><div className="blanket"/></div><div className="nightstand"/></div><div className="image-bottom"><span><MapPin size={13}/>{room.city}</span><span>★ 4.8</span></div></div><div className="room-content"><div className="room-type">{room.roomType}</div><h3>{room.propertyName}</h3><p className="room-description">{room.description}</p><div className="amenities"><span><Wifi size={14}/> Wi-Fi</span><span><Coffee size={14}/> Essentials</span><span><Users size={14}/> Up to {room.capacity}</span></div><div className="room-footer"><div><strong>{money(room.pricePerNight)}</strong><span>/ night</span><small>{money(room.totalPrice)} total for {nights} {nights===1?'night':'nights'}</small></div><button className="book-button" onClick={()=>setSelected(room)}>Reserve <ArrowRight size={16}/></button></div></div></article>)}</div>}
        </section>
      </>:<section className="bookings-page"><span className="mini-label">YOUR TRAVEL DESK</span><h1>My bookings</h1><p className="page-subtitle">Manage your reservations in one place.</p>{error&&<div className="alert error">{error}</div>}{notice&&<div className="alert success">{notice}</div>}{bookings.length===0?<div className="empty-state"><ClipboardList size={30}/><h3>No bookings yet</h3><p>Your confirmed reservations will appear here.</p><button className="book-button" onClick={()=>setTab('discover')}>Explore stays <ArrowRight size={16}/></button></div>:<div className="booking-list">{[...bookings].sort((a,b)=>b.id-a.id).map(b=><article className="booking-row" key={b.id}><div className="booking-icon"><BedDouble size={24}/></div><div className="booking-info"><span className="booking-id">RESERVATION #{b.id}</span><h3>{b.guestName}</h3><p>{b.checkIn} → {b.checkOut} · {b.guests} guest(s) · Room #{b.roomId}</p><div className="status-row"><span className={b.status==='CANCELLED'?'status cancelled':'status'}>{b.status}</span><span className="status payment">{b.paymentStatus}</span></div></div><div className="booking-price"><strong>{money(b.totalPrice)}</strong>{b.status!=='CANCELLED'&&<button className="cancel-button" onClick={()=>cancelBooking(b.id)}>Cancel booking</button>}{b.paymentStatus!=='PAID_DEMO'&&<button className="retry-button" onClick={()=>retryPayment(b.id)}>Retry payment</button>}</div></article>)}</div>}</section>}
    </main>
    <footer><div className="footer-brand"><Hotel size={18}/> StayEase</div><span>Simple stays. Memorable journeys.</span><small>© 2026 StayEase · Educational demo</small></footer>
    {selected&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null)}}><section className="booking-modal"><button className="modal-close" onClick={()=>setSelected(null)}><X size={20}/></button><span className="mini-label">COMPLETE YOUR RESERVATION</span><h2>Almost there!</h2><p className="modal-subtitle">{selected.propertyName} · {selected.roomType}</p><div className="summary-box"><div><span>Dates</span><b>{checkIn} → {checkOut}</b></div><div><span>Guests</span><b>{guests} guest(s)</b></div><div><span>{nights} {nights===1?'night':'nights'}</span><b>{money(selected.pricePerNight)} / night</b></div><div className="summary-total"><span>Total amount</span><b>{money(selected.totalPrice)}</b></div></div><form onSubmit={bookRoom}><label className="modal-field">Full name<input value={form.guestName} onChange={e=>setForm({...form,guestName:e.target.value})} placeholder="Enter guest name" required minLength="2"/></label><label className="modal-field">Email address<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com" required/></label><div className="demo-note"><ShieldCheck size={17}/><span><b>Safe and simple</b><small>Demo payment only — no real charge will be made.</small></span></div><button className="confirm-button" type="submit">Confirm reservation <ArrowRight size={17}/></button></form></section></div>}
  </div>;
}
