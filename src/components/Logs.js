import React, { useEffect, useState } from "react";

function Logs() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [next, setNext] = useState(null);
  const [prev, setPrev] = useState(null);
  const [loading, setLoading] = useState(true);

  function getToken() {
    return localStorage.getItem("access");
  }

  async function fetchLogs(pageNumber) {
    try {
      setLoading(true);

      const res = await fetch(`/api/logs/?page=${pageNumber}`, {
        headers: {
          "Authorization": "Bearer " + getToken(),
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      setLogs(data.results);
      setNext(data.next);
      setPrev(data.previous);
    } catch (err) {
      console.error("Error cargando logs:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Logs del Sistema</h1>

      {loading && <p>Cargando...</p>}

      {!loading && (
        <>
          {logs.length === 0 && <p>No hay logs registrados.</p>}

          {logs.length > 0 && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#eee" }}>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Detalle</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td>{log.user || "Sistema"}</td>
                    <td>{log.action}</td>
                    <td>{log.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div style={{ marginTop: "15px" }}>
            <button
              onClick={() => setPage(page - 1)}
              disabled={!prev}
              style={{ marginRight: "10px" }}
            >
              ◀ Anterior
            </button>

            <span style={{ margin: "0 10px" }}>Página {page}</span>

            <button
              onClick={() => setPage(page + 1)}
              disabled={!next}
            >
              Siguiente ▶
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Logs;
