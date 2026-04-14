"use client";
import { useState, useEffect, FormEvent } from "react";
import dynamic from "next/dynamic";
import { Business } from "@/types/business";
import { useRouter } from "next/navigation";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div
      className="map-container"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "460px",
        background: "#eee",
        borderRadius: '5px'
      }}
    >
      Loading Map...
    </div>
  ),
});

export default function Dashboard() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 4;

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  
  // FIX: Hum niche isi 'currentRecords' ko map karenge
  const currentRecords = Array.isArray(businesses) 
    ? businesses.slice(indexOfFirstRecord, indexOfLastRecord) 
    : [];

  const totalPages = Math.ceil((businesses?.length || 0) / recordsPerPage);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    phone: "",
    lat: "0",
    lng: "0",
  });

  const API_URL = "http://localhost:4000/locations-history";

  const fetchBusinesses = async () => {
    try {
      const res = await fetch(`${API_URL}/all`);
      const data: Business[] = await res.json();
      setBusinesses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    fetchBusinesses();
  }, []);

  const deleteBusiness = async (id: number | undefined) => {
    if (!id || !confirm("Are you sure you want to delete this location?")) return;
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchBusinesses();
    // Delete ke baad agar page khali ho jaye toh piche wale page par bhejein
    if (currentRecords.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, additionalAttributes: { "Free WiFi": true }, hours: [] };
    const res = await fetch(`${API_URL}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setFormData({ name: "", address: "", city: "", phone: "", lat: "", lng: "" });
      fetchBusinesses();
    }
  };

  return (
    <div className="container">
      <header style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "2.5rem" }}>
          Yext <span style={{ color: "var(--accent-color)" }}>Dummy</span>
        </h1>
        <p style={{ color: "var(--text-color)", opacity: 0.7 }}>Enterprise Location Knowledge Graph</p>
      </header>

      <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
        <div style={{ padding: "10px 20px", borderRadius: "8px", background: "var(--accent-color)", color: "white", fontWeight: "bold" }}>
          Total: {businesses.length}
        </div>
        <button onClick={() => router.push("/search")} style={{ backgroundColor: "#28a745", color: "white" }}>
          🔍 Discover New Locations
        </button>
      </div>

      {isClient ? <Map businesses={businesses} /> : <div className="map-container" />}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px", marginTop: "20px" }}>
        {/* Form Section */}
        <section style={{ backgroundColor: "var(--card-bg)", padding: "25px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
          <h2 style={{ marginTop: 0, marginBottom: "20px", fontSize: "1.2rem" }}>🏥 Add New Hospital</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group"><input type="text" placeholder="Hospital Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div className="form-group"><input type="text" placeholder="Address" required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} /></div>
            <div className="form-group" style={{ display: "flex", gap: "10px" }}>
              <input type="text" placeholder="City" required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
              <input type="text" placeholder="Phone" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <button type="submit" style={{ width: "100%" }}>Add to Network</button>
          </form>
        </section>

        {/* List Section */}
        <section style={{ gridColumn: "span 2" }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "20px" }}>
            <h2 style={{ fontSize: "1.2rem", margin: 0 }}>📋 Searched Locations</h2>
            <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>
              Showing {businesses.length > 0 ? indexOfFirstRecord + 1 : 0}-{Math.min(indexOfLastRecord, businesses.length)} of {businesses.length}
            </span>
          </div>

          {loading ? (
            <p>Fetching data...</p>
          ) : currentRecords.length > 0 ? (
            <>
              {currentRecords.map((bus) => (
                <div key={bus.id} className="business-card">
                  <div>
                    <h3 style={{ margin: "0 0 5px 0", color: "var(--header-text)" }}>{bus.name}</h3>
                    <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.8 }}>📍 {bus.address}</p>
                    <small style={{ color: "var(--accent-color)" }}>{bus.phone}</small>
                    <div>
                      <a href={bus.locationLink} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-color)", textDecoration: "underline", fontSize: '0.8rem' }}>
                        View Maps
                      </a>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button style={{ backgroundColor: "#298a87", padding: "8px 15px" }}>Edit</button>
                    <button onClick={() => deleteBusiness(bus.id)} style={{ backgroundColor: "#68151d", padding: "8px 15px" }}>Delete</button>
                  </div>
                </div>
              ))}

              {/* Pagination UI */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                  Previous
                </button>
                <span>Page {currentPage} of {totalPages || 1}</span>
                <button 
                  disabled={currentPage === totalPages || totalPages === 0} 
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  style={{ opacity: (currentPage === totalPages || totalPages === 0) ? 0.5 : 1, cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer' }}
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <p>No locations found.</p>
          )}
        </section>
      </div>
    </div>
  );
}