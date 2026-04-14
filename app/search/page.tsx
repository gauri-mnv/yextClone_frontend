"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Business } from "@/types/business";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [results, setResults] = useState<Business[]>([]);
  const router = useRouter();

  const SCRAPER_API_URL = "http://localhost:4000/scrape";

  const handleStartScraping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setIsScraping(true);
    try {
      const res = await fetch(SCRAPER_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query }),
      });

      //   if (!res.ok) throw new Error("Scraper failed");

      const data = await res.json();
      setResults(data);
      console.log("data", data);

      alert(`Success! Found ${data.length} locations and saved to DB.`);
    } catch (err) {
      console.error(err);
      alert("Error: Check if NestJS is running on port 4000");
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <div className="container" style={{ padding: "40px" }}>
      <button
        onClick={() => router.push("/")}
        style={{ marginBottom: "20px", backgroundColor: "#6c757d" }}
      >
        ← Back to Dashboard
      </button>

      <section
        style={{
          backgroundColor: "var(--card-bg)",
          padding: "30px",
          borderRadius: "12px",
          border: "2px dashed var(--accent-color)",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        <h2 style={{ textAlign: "center" }}>🔍 Maps NAP Scraper</h2>
        <p style={{ textAlign: "center", opacity: 0.7, fontSize: "0.9rem" }}>
          Enter a location or business type to automatically fetch Name,
          Address, and Phone.
        </p>

        <form onSubmit={handleStartScraping} style={{ marginTop: "20px" }}>
          <div className="form-group">
            <input
              type="text"
              placeholder="e.g. Apollo Hospitals Ahmedabad"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ width: "100%", padding: "12px" }}
              disabled={isScraping}
            />
          </div>
          <button
            type="submit"
            style={{ width: "100%", marginTop: "10px" }}
            disabled={isScraping}
          >
            {isScraping ? "🔄 Scraping in Progress..." : "Start Discovery"}
          </button>
        </form>
      </section>

      {/* Scraped Results Preview */}
      {results.length > 0 && (
        <div style={{ marginTop: "40px" }}>
          <h3>Preview of Found Data:</h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "10px",
            }}
          >
            <thead>
              <tr
                style={{ background: "var(--border-color)", textAlign: "left" }}
              >
                <th style={{ padding: "10px" }}>Name</th>
                <th style={{ padding: "10px" }}>Address</th>
                <th style={{ padding: "10px" }}>Phone</th>
                <th style={{ padding: "10px" }}>Maps Link</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item, idx) => (
                <tr
                  key={idx}
                  style={{ borderBottom: "1px solid var(--border-color)" }}
                >
                  <td style={{ padding: "10px" }}>{item.name}</td>
                  <td style={{ padding: "10px" }}>{item.address}</td>
                  <td style={{ padding: "10px" }}>{item.phone}</td>
                  <td>
                    {item.locationLink !== "N/A" ? (
                      <a
                        href ={item.locationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                        style={{
                          color: "var(--accent-color)",
                          textDecoration: "underline",
                          
                        }}
                      >
                        View on Maps
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
