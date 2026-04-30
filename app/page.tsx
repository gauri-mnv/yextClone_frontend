/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

// Updated Interface to match your JSON structure
interface ScrapedData {
  name?: string;
  phone?: string;
  address?: string;
}

interface AuditResult {
  status: string;
  results: {
    name?: any;
    phone?: any;
    address?: any;
  };
  matched:{
    name: boolean;
    phone: boolean;
    address: boolean;
  }
}

interface EnhancedBusiness {
  scraped: ScrapedData;
  meta: {
    source: string;
    locationLink: string;
    timestamp: string;
  };
  audit: AuditResult;
}

export default function SearchPage() {
  const [businessName, setBusinessName] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [results, setResults] = useState<EnhancedBusiness[]>([]);
  const [showAudit, setShowAudit] = useState(false);

  // --- Filter States ---
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>(["Verified", "Mismatch"]); 

  // const SCRAPER_API_URL = "http://localhost:4000/scrape";
    const socketRef = useRef<Socket | null>(null);

     useEffect(() => {
    // Backend URL connect
    // const socket = io("http://localhost:4000");

    const socket = io("http://localhost:4000", {
  reconnection: true,             
  reconnectionAttempts: 3,       
  reconnectionDelay: 5000,       
  // transports: ["polling", "websocket"] // default 
});
    socketRef.current = socket;
    // "dataChunk" listener
    socket.on("dataChunk", (newResult: EnhancedBusiness) => {
      // console.log("🔥 Backend Response:", newResult);
      setResults((prev) => {
        // Agar source pehle se hai toh update karein (Safety check)
        const exists = prev.findIndex(r => r.meta.source === newResult.meta.source);
        if (exists > -1) {
          const updated = [...prev];
          updated[exists] = newResult;
          return updated;
        }
        return [...prev, newResult];
      });
    });

    // Scraping khatam hone par
    socket.on("scrapingFinished", () => {
      setIsScraping(false);
    });
  // console.log("📊 All Results State:", results);
    return () => {
      // socketRef.current?.disconnect();
      socket.off("dataChunk");
    socket.off("scrapingFinished");
    socket.disconnect();
    };
  }, []);
// --- Logic for Filters ---
  const uniqueSources = useMemo(() => {
    return Array.from(new Set(results.map((r) => r.meta.source)));
  }, [results]);

  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      const sourceMatch = selectedSources.length === 0 || selectedSources.includes(item.meta.source);
      const statusMatch = statusFilter.length === 0 || statusFilter.includes(item.audit.status);
      return sourceMatch && statusMatch;
    });
  }, [results, selectedSources, statusFilter]);


  const toggleSource = (source: string) => {
    setSelectedSources(prev => 
      prev.includes(source) ? prev.filter(s => s !== source) : [...prev, source]
    );
  };

  const toggleStatus = (status: string) => {
    setStatusFilter(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };
  ///-----------------------
  
  const handleStartScraping = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!businessName || !location) {
      alert("Please enter both Business Name and Location");
      return;
    }

    setIsScraping(true);
    setResults([]);
    // setShowAudit(false);

    socketRef.current?.emit("startScraping", {
      name: businessName,
      location: location,
      phone: phone,
    });
  };

  const handleCheckAudit = async () => {
    if (!phone) {
      alert("Please enter a phone number to audit accuracy.");
      return;
    }
    setShowAudit(true);
    await handleStartScraping();
  };

  const getSourceColor = (source: string = "") => {
    const s = source.toLowerCase();
    if (s.includes("google")) return "#4285F4";
    if (s.includes("yelp")) return "#b90c0c";
    if (s.includes("facebook")) return "#1877f2";
    if (s.includes("instagram")) return "#c13584";
    if (s.includes("mapquest")) return "#69f79b";
    if (s.includes("n49")) return "#e65b29";
    if (s.includes("opendi")) return "#ffcc00";
    if (s.includes("profile")) return "#ff1f1f";
    if (s.includes("hotfrog")) return "#610094";
    if (s.includes("iglobal")) return "#00a8cc";
    return "#82888e";
  };

  return (
    <div style={{ backgroundColor: "#0f172a", minHeight: "100vh", color: "white", padding: "40px 20px", fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Search Header */}
        <div style={{ background: "#1e293b", padding: "40px", borderRadius: "20px", border: "1px solid #334155", textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "10px" }}>🔍 Multi-Source NAP Scraper</h1>
          <p style={{ color: "#bdc9d9", marginBottom: "30px" }}>Cross-reference data across the web</p>

          <form style={{ display: "flex", flexWrap: "wrap", gap: "15px", justifyContent: "center" }}>
            <input type="text" placeholder="Business Name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} style={inputStyle} />
            <input type="tel" placeholder="Audit Phone (Target)" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
            
            <button
              type="button"
              onClick={() => handleStartScraping()}
              disabled={isScraping}
              style={{ ...buttonStyle, background: isScraping ? "#475569" : "#02727c" }}
            >
              {isScraping ? "Scraping..." : "Search All Sources"}
            </button>

            {results.length > 0 && (
              <button
                type="button"
                onClick={handleCheckAudit}
                style={{ ...buttonStyle, background: "#334155", border: "1px solid #475569" }}
              >
                Re-Audit Accuracy
              </button>
            )}
          </form>
        </div>
{/* ///--------------------------------------------------------- */}
 {/* --- Filter Controls --- */}
        {results.length > 0 && (
          <div style={{ background: "#1e293b", padding: "20px", borderRadius: "15px", marginBottom: "20px", border: "1px solid #334155" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "30px" }}>
              
              {/* Source Filters */}
              <div>
                <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "10px", fontWeight: "bold" }}>FILTER BY SOURCE:</p>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {uniqueSources.map(source => (
                    <label key={source} style={checkboxLabelStyle}>
                      <input 
                        type="checkbox" 
                        checked={selectedSources.includes(source)} 
                        onChange={() => toggleSource(source)} 
                      />
                      {source}
                    </label>
                  ))}
                </div>
              </div>
{/* ///--------------------------------------------------------- */}
              {/* Status Filters */}
              <div>
                <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "10px", fontWeight: "bold" }}>AUDIT STATUS:</p>
                <div style={{ display: "flex", gap: "10px" }}>
                  {["Verified", "Mismatch"].map(status => (
                    <label key={status} style={checkboxLabelStyle}>
                      <input 
                        type="checkbox" 
                        checked={statusFilter.includes(status)} 
                        onChange={() => toggleStatus(status)} 
                      />
                      {status}
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ///--------------------------------------------------------- */}
<p style={{ color: "yellow" , marginBottom: "10px" }}>
  Total Results: {results.length} | Filtered: {filteredResults.length}
</p>

        {/* Results Table */}
        {filteredResults.length > 0 && (
          <div style={{ background: "#1e293b", borderRadius: "15px", overflow: "hidden", border: "1px solid #334155" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#334155", textAlign: "left" }}>
                  <th style={thStyle}>Source</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Address</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>Link</th>
                  <th style={{ ...thStyle, background: "#0284c7" }}>Audit Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((item, idx) =>{
                  return (
                    <tr key={idx} style={{ borderBottom: "1px solid #334155" }}>
                      <td style={tdStyle}>
                        <span style={{ fontSize: "0.65rem", fontWeight: "bold", padding: "4px 8px", borderRadius: "5px", background: getSourceColor(item.meta.source), color: "white" }}>
                          {item.meta.source}
                        </span>
                      </td>
                      <td style={tdStyle}>{item.scraped.name || item.audit.results.name || "—"}</td>
                      <td style={{ ...tdStyle, color: "#94a3b8", fontSize: "0.85rem" }}>{item.scraped.address || item.audit.results.address || "—"}</td>
                      <td style={tdStyle}>{item.scraped.phone || item.audit.results.phone || "—"}</td>
                      <td style={tdStyle}>
                        {item.meta.locationLink ? (
                           <a href={item.meta.locationLink} target="_blank" rel="noreferrer" style={{ color: "#38bdf8", textDecoration: "none" }}>Link</a>
                        ) : "—"}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span style={{ 
                            fontSize: "0.7rem", 
                            padding: "2px 6px", 
                            borderRadius: "4px", 
                            width: "fit-content",
                            background: item.audit.status === "Verified" ? "#10b981" : "#ef4444" 
                          }}>
                            {item.audit.status}
                          </span>
                      
                            <div style={{ fontSize: "0.8rem", display: "flex", gap: "8px" }}>
                              <span>N:{item.audit.results.name && item.audit.results.name !== '' ? "✅" : "❌"}</span>
                              <span>A:{item.audit.results.address && item.audit.results.address !== '' ? "✅" : "❌"}</span>
                              <span>P:{item.audit.results.phone && item.audit.results.phone !== '' ? "✅" : "❌"}</span>
                            </div>
                          
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = { flex: "1", minWidth: "200px", padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#0f172a", color: "white" };
const buttonStyle = { padding: "12px 20px", borderRadius: "8px", border: "none", color: "white", fontWeight: "bold" as const, cursor: "pointer" };
const thStyle = { padding: "15px", fontSize: "0.8rem", color: "#cbd5e1" };
const tdStyle = { padding: "15px", fontSize: "0.85rem" };
const checkboxLabelStyle = { display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", cursor: "pointer", background: "#334155", padding: "5px 12px", borderRadius: "20px" };