import React, { useEffect, useState } from "react";
import api from "../interceptor/api";

interface CompetencyStats {
  employee_number: string;
  total_competencies: number;
  average_fulfillment_rate_percentage: number;
  total_required_score: number;
  total_actual_score: number;
}

const StatsBar: React.FC<{ empNumber: string }> = ({empNumber}) => {
 
  const [stats, setStats] = useState<CompetencyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get(`/stats-bar/employee/${empNumber}/competency-stats`);
        setStats(res.data);
        setLoading(false);
      } catch {
        setError("Could not fetch stats");
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error || !stats) return <div>{error || "No data available"}</div>;

  const fulfillment = stats.average_fulfillment_rate_percentage;

  const getEmoji = () => {
    if (fulfillment >= 90) return "✅";
    if (fulfillment >= 70) return "👍";
    return "⚠️";
  };

  const styles = {
    container: {
      display: "flex",
      marginLeft:"160px" ,
      justifyContent: "space-between",
      alignItems: "center",
      padding: "15px 20px",
      backgroundColor: "#f6f9fc",
      borderRadius: "10px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      Width: "800px",
      height:"100px",
      margin: "0 auto",
      fontFamily: "Arial",
     
    },
    details: {
      flex: 1,
      display: "flex",
      flexDirection: "column" as const,
      gap: "4px",
      fontSize: "14px",
    },
    label: {
      color: "#444",
    },
    value: {
      fontWeight: "bold",
    },
    progressContainer: {
      flex: 1,
      padding: "0 20px",
    },
    progressLabel: {
      marginBottom: "5px",
      fontSize: "13px",
      color: "#666",
    },
    progressBarWrapper: {
      width: "100%",
      height: "15px",
      borderRadius: "10px",
      backgroundColor: "#ddd",
      display: "flex",
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: "#36a2eb", // blue
      width: `${fulfillment}%`,
      transition: "width 0.4s ease-in-out",
    },
    progressUnfilled: {
      height: "100%",
      backgroundColor: "#f44336", // red
      width: `${100 - fulfillment}%`,
    },
    emoji: {
      fontSize: "24px",
      marginLeft: "10px",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.details}>
        <div><span style={styles.label}>Competencies:</span> <span style={styles.value}>{stats.total_competencies}</span></div>
        <div><span style={styles.label}>Score:</span> <span style={styles.value}>{stats.total_actual_score}/{stats.total_required_score}</span></div>
      </div>

      <div style={styles.progressContainer}>
        <div style={styles.progressLabel}>
          Fulfillment: {fulfillment.toFixed(2)}%
        </div>
        <div style={styles.progressBarWrapper}>
          <div style={styles.progressFill}></div>
          <div style={styles.progressUnfilled}></div>
        </div>
      </div>

      <div style={styles.emoji} title="Performance Indicator">
        {getEmoji()}
      </div>
    </div>
  );
};

export default StatsBar;
