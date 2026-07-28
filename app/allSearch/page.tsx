"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Business } from "@/types/business";

interface EnhancedBusiness extends Business {
  source?: string;
}

export default function SearchPage() {
  const [businessName, setBusinessName] = useState("");
  const [location, setLocation] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [results, setResults] = useState<EnhancedBusiness[]>([]);
  const router = useRouter();

  const SCRAPER_API_URL = "http://localhost:4000/scrape";

  const handleStartScraping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !location) {
      alert("Please enter both Business Name and Location");
      return;
    }

    setIsScraping(true);
    setResults([]);

    try {
      const res = await fetch(SCRAPER_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Hum dono alag fields bhej rahe hain
        body: JSON.stringify({ 
          name: businessName, 
          location: location 
        }),
      });

      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      alert("Scraper failed. Check if Backend is running.");
    } finally {
      setIsScraping(false);
    }
  };

  const getSourceColor = (source: string = "") => {
    const s = source.toLowerCase();
    if (s.includes("google")) return "#52d1b8";
    if (s.includes("yelp")) return "#b90c0c";
    if (s.includes("N49")) return "#e65b29";
    if (s.includes("MapQuest")) return "#69f79b";
    return "#82888e";
  };

  return (
    <div style={{ backgroundColor: "#0f172a", minHeight: "100vh", color: "white", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
        <button
          onClick={() => router.push("/")}
          style={{ background: "#334155", color: "white", padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", marginBottom: "30px" }}
        >
          ← Back to Dashboard
        </button>

        {/* Search Header Section */}
        <div style={{ background: "#1e293b", padding: "40px", borderRadius: "20px", border: "1px solid #334155", textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "10px" }}>🔍 Multi-Source NAP Scraper</h1>
          <p style={{ color: "#bdc9d9", marginBottom: "30px" }}>Discover business data from Google, Yelp, MapQuest, and N49</p>

          <form onSubmit={handleStartScraping} style={{ display: "flex", flexWrap: "wrap", gap: "15px", justifyContent: "center" }}>
            <input
              type="text"
              placeholder="Business Name (e.g. Apollo)"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              style={{ flex: "2", minWidth: "250px", padding: "14px", borderRadius: "10px", border: "1px solid #c9d1dd", background: "#0f172a", color: "white" }}
            />
            <input
              type="text"
              placeholder="Location (e.g. Ahmedabad)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ flex: "1", minWidth: "180px", padding: "14px", borderRadius: "10px", border: "1px solid #c3c7ce", background: "#0f172a", color: "white" }}
            />
            <button
              type="submit"
              disabled={isScraping}
              style={{ 
                padding: "14px 30px", 
                borderRadius: "10px", 
                border: "none", 
                background: isScraping ? "#808387" : "#02727c", 
                color: "white", 
                fontWeight: "bold", 
                cursor: isScraping ? "not-allowed" : "pointer",
                transition: "0.3s"
              }}
            >
              {isScraping ? "Discovering..." : "Start Discovery"}
            </button>
          </form>
        </div>

        {/* Status Indicators */}
        <div style={{ display: "flex", gap: "20px", justifyContent: "flex-end", marginBottom: "10px", fontSize: "0.8rem" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><div style={{ width: 8, height: 8, background: "#52d1b8", borderRadius: "50%" }}></div> Google</span>
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><div style={{ width: 8, height: 8, background: "#b90c0c", borderRadius: "50%" }}></div> Yelp</span>
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><div style={{ width: 8, height: 8, background: "#69f79b", borderRadius: "50%" }}></div> MapQuest</span>
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><div style={{ width: 8, height: 8, background: "#e65b29", borderRadius: "50%" }}></div> N49</span>
        </div>

        {/* Results Table */}
        {results.length > 0 && (
          <div style={{ background: "#1e293b", borderRadius: "15px", overflow: "hidden", border: "1px solid #334155" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#334155", textAlign: "left" }}>
                  <th style={{ padding: "15px" }}>Source</th>
                  <th style={{ padding: "15px" }}>Business Name</th>
                  <th style={{ padding: "15px" }}>Address</th>
                  <th style={{ padding: "15px" }}>Phone</th>
                  <th style={{ padding: "15px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #334155" }}>
                    <td style={{ padding: "15px" }}>
                      <span style={{ 
                        fontSize: "0.7rem", 
                        fontWeight: "bold", 
                        padding: "4px 8px", 
                        borderRadius: "5px", 
                        background: getSourceColor(item.source),
                        textTransform: "uppercase" 
                      }}>
                        {item.source}
                      </span>
                    </td>
                    <td style={{ padding: "15px", fontWeight: "500" }}>{item.name}</td>
                    <td style={{ padding: "15px", color: "#94a3b8", fontSize: "0.9rem" }}>{item.address}</td>
                    <td style={{ padding: "15px" }}>{item.phone || "N/A"}</td>
                    <td style={{ padding: "15px" }}>
                      <a href={item.locationLink} target="_blank" style={{ color: "#0ea5e9", textDecoration: "none" }}>View</a>
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