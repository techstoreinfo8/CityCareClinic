
import { useState } from "react";
import {
  HeartPulse, Phone, Clock, MapPin,
  CalendarDays, UserRound, MessageSquare,
  CheckCircle2, ArrowRight, ShieldCheck
} from "lucide-react";
import "./App.css";

const API_URL = "http://localhost:5000";

function App() {
  const [form, setForm] = useState({
    patient_name: "",
    phone_number: "",
    preferred_date: "",
    message: ""
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const today = new Date().toLocaleDateString("en-CA");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/enquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Submission failed");
      }

      setSuccess(
        `Your enquiry #${data.enquiry.id} has been submitted successfully. The clinic will contact you for confirmation.`
      );

      setForm({
        patient_name: "",
        phone_number: "",
        preferred_date: "",
        message: ""
      });

    } catch (err) {
      setError(err.message || "Unable to connect to clinic server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="website">

      <header className="navbar">
        <a href="#home" className="brand">
          <HeartPulse size={30} />
          <span>
            <strong>CityCare Clinic</strong>
            <small>CARE THAT MATTERS</small>
          </span>
        </a>

        <nav>
          <a href="#home">Home</a>
          <a href="#services">Services</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>

        <a href="#appointment" className="nav-button">
          Request Appointment
        </a>
      </header>

      <section className="hero" id="home">
        <div className="hero-content">
          <span className="eyebrow">
            YOUR HEALTH, OUR PRIORITY
          </span>

          <h1>
            Quality Healthcare.<br />
            <span>Personal Care.</span>
          </h1>

          <p>
            Professional healthcare services with a patient-first
            approach. Request an appointment enquiry with our clinic team.
          </p>

          <a href="#appointment" className="primary-button">
            Request an Appointment <ArrowRight size={18} />
          </a>

          <div className="trust">
            <ShieldCheck size={20} />
            Patient-focused care and support
          </div>
        </div>

        <div className="hero-visual">
          <img
            src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=1000"
            alt="Healthcare professional in a clinic"
          />
          <div className="hero-card">
            <HeartPulse size={26} />
            <div>
              <strong>Patient First</strong>
              <small>Care with compassion</small>
            </div>
          </div>
        </div>
      </section>

      <section className="features" id="services">
        <div>
          <HeartPulse />
          <h3>General Consultation</h3>
          <p>Request a general health consultation.</p>
        </div>

        <div>
          <CalendarDays />
          <h3>Appointment Enquiry</h3>
          <p>Share your preferred appointment date.</p>
        </div>

        <div>
          <ShieldCheck />
          <h3>Patient Support</h3>
          <p>Our clinic team can assist with enquiries.</p>
        </div>
      </section>

      <section className="appointment-section" id="appointment">
        <div className="appointment-info">
          <span className="eyebrow">GET IN TOUCH</span>
          <h2>Request an Appointment</h2>

          <p>
            Complete the form and our clinic team will contact
            you to discuss appointment availability.
          </p>

          <div className="info-item">
            <Phone />
            <div>
              <strong>Phone Support</strong>
              <p>Contact the clinic directly</p>
            </div>
          </div>

          <div className="info-item">
            <Clock />
            <div>
              <strong>Appointment Scheduling</strong>
              <p>Subject to clinic availability</p>
            </div>
          </div>

          <div className="info-item">
            <MapPin />
            <div>
              <strong>Clinic Location</strong>
              <p>Update with your clinic address</p>
            </div>
          </div>
        </div>

        <div className="form-card">
          <h2>Patient Enquiry Form</h2>
          <p className="form-subtitle">
            Fields marked * are required.
          </p>

          {success && (
            <div className="success-message">
              <CheckCircle2 />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <label>Patient Name *</label>
            <div className="input-wrap">
              <UserRound />
              <input
                name="patient_name"
                value={form.patient_name}
                onChange={handleChange}
                placeholder="Enter full name"
                maxLength={150}
                required
              />
            </div>

            <label>Phone Number *</label>
            <div className="input-wrap">
              <Phone />
              <input
                name="phone_number"
                type="tel"
                value={form.phone_number}
                onChange={handleChange}
                placeholder="Enter mobile number"
                required
              />
            </div>

            <label>Preferred Appointment Date *</label>
            <div className="input-wrap">
              <CalendarDays />
              <input
                type="date"
                name="preferred_date"
                min={today}
                value={form.preferred_date}
                onChange={handleChange}
                required
              />
            </div>

            <label>Message</label>
            <div className="input-wrap textarea-wrap">
              <MessageSquare />
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Enter your enquiry..."
                maxLength={2000}
              />
            </div>

            <button
              className="submit-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Enquiry"}
              {!loading && <ArrowRight size={18} />}
            </button>

            <p className="disclaimer">
              <ShieldCheck size={16} />
              This is an appointment enquiry, not a confirmed
              appointment. The clinic will contact you to confirm
              availability.
            </p>

          </form>
        </div>
      </section>

      <section className="about" id="about">
        <h2>Healthcare with a Personal Touch</h2>
        <p>
          Our demonstration clinic website showcases a simple
          and accessible patient enquiry experience.
        </p>
      </section>

      <footer id="contact">
        <div className="brand">
          <HeartPulse />
          <strong>CityCare Clinic</strong>
        </div>
        <p>Healthcare website demonstration by Suvexa VUSM Consulting.</p>
        <small>© 2026 CityCare Clinic. Demo website.</small>
      </footer>

    </div>
  );
}

export default App;
