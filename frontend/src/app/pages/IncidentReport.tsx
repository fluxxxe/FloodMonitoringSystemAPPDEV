import { FormEvent, useState, useEffect } from "react";
import { useWaters } from "../hooks/useWaters";
import { API_BASE_URL } from "../apiConfig";
import "../styles/pages/IncidentReport.css";

type Urgency = "Low" | "Medium" | "High";

export function IncidentReport() {
  const { waters } = useWaters();
  const [reporterName, setReporterName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [locationId, setLocationId] = useState("");
  const [waterLevel, setWaterLevel] = useState("");
  const [incidentType, setIncidentType] = useState("Flood");
  const [urgency, setUrgency] = useState<Urgency>("Medium");
  const [needsRescue, setNeedsRescue] = useState(false);
  const [notifySms, setNotifySms] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [reportDate, setReportDate] = useState("");
  const [reportTime, setReportTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Set default location when waters list changes
  useEffect(() => {
    if (waters.length > 0 && !locationId) {
      setLocationId(String(waters[0].id));
    }
  }, [waters, locationId]);

  const selectedLocation = waters.find((item) => item.id === locationId || String(item.id) === locationId) || waters[0];

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const rescueStr = [
      needsRescue ? "Needs Rescue" : "",
      notifySms ? "Notify SMS" : "",
      notifyEmail ? "Notify Email" : "",
      notes ? `Notes: ${notes}` : ""
    ].filter(Boolean).join(" | ");

    try {
      const response = await fetch(`${API_BASE_URL}/reports/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reporter_name: reporterName,
          incident_type: incidentType,
          rescue_needs: rescueStr || "None",
          location: selectedLocation?.locationName || "Unknown Location",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit incident report to the backend.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || "An error occurred while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="app__section">
      <h2 className="app__section-title">Incident Report</h2>
      <p className="app__page-text">
        Submit an incident report for floods or tsunami-related observations.
      </p>

      <form className="app__form" onSubmit={handleSubmit}>
        <label className="app__form-field">
          <span>Reporter Name (Text)</span>
          <input
            type="text"
            value={reporterName}
            onChange={(event) => setReporterName(event.target.value)}
            placeholder="Juan Dela Cruz"
            required
          />
        </label>

        <label className="app__form-field">
          <span>Email (Email)</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@email.com"
            required
          />
        </label>

        <label className="app__form-field">
          <span>Contact Number (Tel)</span>
          <input
            type="tel"
            value={contactNumber}
            onChange={(event) => setContactNumber(event.target.value)}
            placeholder="09XXXXXXXXX"
            required
          />
        </label>

        <label className="app__form-field">
          <span>Monitored Location (Select)</span>
          <select
            value={locationId}
            onChange={(event) => setLocationId(event.target.value)}
          >
            {waters.map((item) => (
              <option key={item.id} value={item.id}>
                {item.locationName}
              </option>
            ))}
          </select>
        </label>

        <label className="app__form-field">
          <span>Observed Water Level in Meters (Number)</span>
          <input
            type="number"
            min="0"
            step="0.1"
            value={waterLevel}
            onChange={(event) => setWaterLevel(event.target.value)}
            placeholder="e.g. 7.5"
            required
          />
        </label>

        <label className="app__form-field">
          <span>Incident Type (Select)</span>
          <select
            value={incidentType}
            onChange={(event) => setIncidentType(event.target.value)}
          >
            <option value="Flood">Flood</option>
            <option value="Tsunami Warning">Tsunami Warning</option>
            <option value="Heavy Rainfall">Heavy Rainfall</option>
            <option value="Landslide Risk">Landslide Risk</option>
          </select>
        </label>

        <fieldset className="app__form-group">
          <legend>Urgency (Radio)</legend>
          <label>
            <input
              type="radio"
              name="urgency"
              checked={urgency === "Low"}
              onChange={() => setUrgency("Low")}
            />
            Low
          </label>
          <label>
            <input
              type="radio"
              name="urgency"
              checked={urgency === "Medium"}
              onChange={() => setUrgency("Medium")}
            />
            Medium
          </label>
          <label>
            <input
              type="radio"
              name="urgency"
              checked={urgency === "High"}
              onChange={() => setUrgency("High")}
            />
            High
          </label>
        </fieldset>

        <fieldset className="app__form-group">
          <legend>Follow-up Preferences (Checkbox)</legend>
          <label>
            <input
              type="checkbox"
              checked={needsRescue}
              onChange={(event) => setNeedsRescue(event.target.checked)}
            />
            Needs rescue assistance
          </label>
          <label>
            <input
              type="checkbox"
              checked={notifySms}
              onChange={(event) => setNotifySms(event.target.checked)}
            />
            Notify by SMS
          </label>
          <label>
            <input
              type="checkbox"
              checked={notifyEmail}
              onChange={(event) => setNotifyEmail(event.target.checked)}
            />
            Notify by Email
          </label>
        </fieldset>

        <div className="app__form-row">
          <label className="app__form-field">
            <span>Report Date (Date)</span>
            <input
              type="date"
              value={reportDate}
              onChange={(event) => setReportDate(event.target.value)}
              required
            />
          </label>
          <label className="app__form-field">
            <span>Report Time (Time)</span>
            <input
              type="time"
              value={reportTime}
              onChange={(event) => setReportTime(event.target.value)}
              required
            />
          </label>
        </div>

        <label className="app__form-field">
          <span>Incident Notes (Textarea)</span>
          <textarea
            rows={4}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Describe what is happening in the area..."
            required
          />
        </label>

        {submitError && (
          <div className="app__form-error" style={{ color: "#ff4d4d", marginBottom: "1rem", fontWeight: "bold" }}>
            ❌ {submitError}
          </div>
        )}

        <button 
          type="submit" 
          className="app__page-link app__page-link--button"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Report"}
        </button>
      </form>

      {submitted && (
        <section className="app__form-preview" aria-live="polite">
          <h3>Submitted Report Preview</h3>
          <p><strong>Reporter:</strong> {reporterName}</p>
          <p><strong>Email:</strong> {email}</p>
          <p><strong>Contact:</strong> {contactNumber}</p>
          <p><strong>Location:</strong> {selectedLocation?.locationName}</p>
          <p><strong>Observed Water Level:</strong> {waterLevel}m</p>
          <p><strong>Incident Type:</strong> {incidentType}</p>
          <p><strong>Urgency:</strong> {urgency}</p>
          <p><strong>Needs Rescue:</strong> {needsRescue ? "Yes" : "No"}</p>
          <p><strong>Notify SMS:</strong> {notifySms ? "Yes" : "No"}</p>
          <p><strong>Notify Email:</strong> {notifyEmail ? "Yes" : "No"}</p>
          <p><strong>Date/Time:</strong> {reportDate} {reportTime}</p>
          <p><strong>Notes:</strong> {notes}</p>
        </section>
      )}
    </section>
  );
}


