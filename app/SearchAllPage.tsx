"use client";
import { useState } from "react";
import { Business } from "@/types/business";

interface EnhancedBusiness extends Business {
  source?: string;
  auditResult?: {
    nameMatch: string;
    addressMatch: string;
    phoneMatch: string;
  };
}

export default function SearchAllPage() {
  const [businessName, setBusinessName] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [results, setResults] = useState<EnhancedBusiness[]>([]);
  const [hasScraped, setHasScraped] = useState(false); // Track if we have results

  const SCRAPER_API_URL = "http://localhost:4000/scrape";

  const handleStartScraping = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsScraping(true);
    setHasScraped(false);
    try {
      const res = await fetch(SCRAPER_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: businessName, location: location }),
      });
      const data = await res.json();
      setResults(data);
      setHasScraped(true);
    } catch (err) {
      alert("Error fetching data");
    } finally {
      setIsScraping(false);
    }
  };

  // 1. Function jo Phone/NAP match check karega
  const handleCheckAudit = () => {
    if (!phone) {
      alert("Please enter a phone number to audit.");
      return;
    }

    const auditedResults = results.map((item) => {
      const cleanInputPhone = phone.replace(/\D/g, "");
      const cleanScrapedPhone = (item.phone || "").replace(/\D/g, "");

      return {
        ...item,
        auditResult: {
          nameMatch: item.name?.toLowerCase().includes(businessName.toLowerCase()) ? "✅" : "❌",
          addressMatch: item.address?.toLowerCase().includes(location.toLowerCase()) ? "✅" : "❌",
          phoneMatch: cleanScrapedPhone === cleanInputPhone ? "✅" : "❌",
        },
      };
    });
    setResults(auditedResults);
  };

  return (
    <div style={{ backgroundColor: "#0f172a", minHeight: "100vh", color: "white", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Search & Audit Section */}
        <div style={{ background: "#1e293b", padding: "40px", borderRadius: "20px", border: "1px solid #334155", textAlign: "center" }}>
          <h1>🔍 Business Discovery & Audit</h1>
          <form style={{ display: "flex", flexWrap: "wrap", gap: "15px", marginTop: "20px" }}>
            <input placeholder="Business Name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} style={inputStyle} />
            <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} style={inputStyle} />
            <input placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
            
            {/* Toggle Button Logic */}
            {!hasScraped ? (
              <button type="button" onClick={handleStartScraping} disabled={isScraping} style={buttonStyle}>
                {isScraping ? "Discovering..." : "Start Discovery"}
              </button>
            ) : (
              <button type="button" onClick={handleCheckAudit} style={{ ...buttonStyle, background: "#0ea5e9" }}>
                Check Accuracy
              </button>
            )}
          </form>
        </div>

        {/* Results Table */}
        {results.length > 0 && (
          <div style={{ marginTop: "40px", background: "#1e293b", borderRadius: "15px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#334155", textAlign: "left" }}>
                  <th style={thStyle}>Source</th>
                  <th style={thStyle}>Scraped Name</th>
                  <th style={thStyle}>Scraped Address</th>
                  <th style={thStyle}>Scraped Phone</th>
                  {/* Naya Column Results dikhane ke liye */}
                  <th style={{ ...thStyle, background: "#02727c" }}>Audit Result (N/A/P)</th>
                </tr>
              </thead>
              <tbody>
                {results.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #334155" }}>
                    <td style={tdStyle}>{item.source}</td>
                    <td style={tdStyle}>{item.name}</td>
                    <td style={tdStyle}>{item.address}</td>
                    <td style={tdStyle}>{item.phone || "N/A"}</td>
                    <td style={{ ...tdStyle, fontWeight: "bold" }}>
                      {item.auditResult ? (
                        <div style={{ display: "flex", gap: "10px" }}>
                          <span>Name: {item.auditResult.nameMatch}</span>
                          <span>Addr: {item.auditResult.addressMatch}</span>
                          <span>Phone: {item.auditResult.phoneMatch}</span>
                        </div>
                      ) : (
                        <span style={{ opacity: 0.5 }}>Click Check Accuracy</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Styling Constants
const inputStyle = { flex: "1", padding: "14px", borderRadius: "10px", border: "1px solid #c3c7ce", background: "#0f172a", color: "white" };
const buttonStyle = { padding: "14px 30px", borderRadius: "10px", border: "none", background: "#02727c", color: "white", fontWeight: "bold" as const, cursor: "pointer" };
const thStyle = { padding: "15px" };
const tdStyle = { padding: "15px", fontSize: "0.85rem" };