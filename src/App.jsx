import { useState, useEffect } from "react";

import {
  HeartPulse, Phone, Clock, MapPin,
  CalendarDays, UserRound, MessageSquare,
  CheckCircle2, ArrowRight, ShieldCheck,
  Search, RefreshCw
} from "lucide-react";

import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
function AdminDashboard() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const statuses = [
    "Pending",
    "Contacted",
    "Confirmed",
    "Completed",
    "Cancelled"
  ];

  const fetchEnquiries = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/enquiries`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load enquiries.");
      }

      setEnquiries(data.enquiries || []);
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/enquiries/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ status })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update status.");
      }

      setEnquiries((previous) =>
        previous.map((item) =>
          item.id === id
            ? { ...item, status: data.enquiry.status }
            : item
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredEnquiries = enquiries.filter((item) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      String(item.patient_name || "").toLowerCase().includes(searchText) ||
      String(item.phone_number || "").includes(searchText);

    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = enquiries.filter(
    (item) => item.status === "Pending"
  ).length;

  const confirmedCount = enquiries.filter(
    (item) => item.status === "Confirmed"
  ).length;

  const formatDate = (value) => {
    if (!value) return "—";

    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-brand">
          <HeartPulse size={30} />
          <div>
            <strong>CityCare Clinic</strong>
            <small>ADMIN DASHBOARD</small>
          </div>
        </div>

        <a href="/" className="admin-back-link">
          <ArrowRight size={16} />
          View Website
        </a>
      </header>

      <main className="admin-content">
        <div className="admin-heading">
          <div>
            <span className="eyebrow">CLINIC MANAGEMENT</span>
            <h1>Appointment Enquiries</h1>
            <p>Review and manage patient appointment enquiries.</p>
          </div>

          <button
            className="admin-refresh"
            onClick={fetchEnquiries}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        <section className="admin-stats">
          <div className="admin-stat-card">
            <span>Total Enquiries</span>
            <strong>{enquiries.length}</strong>
          </div>

          <div className="admin-stat-card">
            <span>Pending</span>
            <strong>{pendingCount}</strong>
          </div>

          <div className="admin-stat-card">
            <span>Confirmed</span>
            <strong>{confirmedCount}</strong>
          </div>
        </section>

        <section className="admin-table-card">
          <div className="admin-table-heading">
            <div>
              <h2>Enquiry Records</h2>
              <p>{filteredEnquiries.length} records found</p>
            </div>
          </div>

          <div className="admin-filters">
            <div className="admin-search">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search patient name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {loading && (
            <p className="admin-message">Loading enquiries...</p>
          )}

          {error && (
            <div className="admin-error">
              {error}
              <button onClick={fetchEnquiries}>Try again</button>
            </div>
          )}

          {!loading && !error && (
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Patient</th>
                    <th>Phone</th>
                    <th>Preferred Date</th>
                    <th>Message</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEnquiries.map((item) => (
                    <tr key={item.id}>
                      <td>#{item.id}</td>
                      <td>{item.patient_name}</td>
                      <td>{item.phone_number}</td>
                      <td>{formatDate(item.preferred_date)}</td>
                      <td className="admin-message-cell">
                        {item.message || "—"}
                      </td>
                      <td>
                        <select
                          className="admin-status-select"
                          value={item.status}
                          onChange={(e) =>
                            updateStatus(item.id, e.target.value)
                          }
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}

                  {filteredEnquiries.length === 0 && (
                    <tr>
                      <td colSpan="6" className="admin-empty">
                        No enquiries found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="admin-footer-note">
          CityCare Clinic demonstration dashboard. Appointment status
          changes are saved to the database.
        </p>
      </main>
    </div>
  );
}
function ClinicWebsite() {
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
        `Thank you for choosing CityCare Clinic! Your appointment request has been received successfully. Our team will contact you shortly to confirm your appointment.`
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

function App() {
  const isAdminPage = window.location.pathname === "/admin";

  return isAdminPage ? <AdminDashboard /> : <ClinicWebsite />;
}

export default App;
