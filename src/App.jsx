import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  const [agents, setAgents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [relatedSkills, setRelatedSkills] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [agentName, setAgentName] = useState("");
  const [skill, setSkill] = useState("");
  const [application, setApplication] = useState("");
  const [workflow, setWorkflow] = useState("");

  // ================================
  // Fetch Agents
  // ================================

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/agents");

      if (!response.ok) {
        throw new Error("Failed to fetch agents");
      }

      const data = await response.json();

      setAgents(data);
    } catch (error) {
      setError("Unable to load agents");
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // Fetch Jobs
  // ================================

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs");

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = await response.json();

      setJobs(data);
    } catch (error) {
      setError("Unable to load jobs");
    }
  };

  // ================================
  // Fetch Related Skills
  // ================================

  const fetchRelatedSkills = async (jobTitle) => {
    try {
      setError("");

      const response = await fetch(
        `/api/jobs/${encodeURIComponent(jobTitle)}/related-skills`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch related skills");
      }

      const data = await response.json();

      setRelatedSkills(data);
    } catch (error) {
      setRelatedSkills([]);
      setError("Unable to load related skills");
    }
  };

  // ================================
  // Initial Data Load
  // ================================

  useEffect(() => {
    fetchAgents();
    fetchJobs();
  }, []);

  // ================================
  // Add New Agent
  // ================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const response = await fetch("/api/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentName,
          skill,
          application,
          workflow,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add agent");
      }

      setAgentName("");
      setSkill("");
      setApplication("");
      setWorkflow("");

      await fetchAgents();
    } catch (error) {
      setError("Unable to add agent");
    }
  };

  return (
    <div className="min-vh-100 bg-light">

      {/* Header */}
      <nav className="navbar navbar-dark bg-dark">
        <div className="container">
          <span className="navbar-brand fw-bold">
            AI Agent Explorer
          </span>
        </div>
      </nav>

      <main className="container py-5">

        {/* Page Heading */}
        <div className="text-center mb-5">
          <h1 className="fw-bold">
            AI Agent Explorer
          </h1>

          <p className="text-secondary">
            Explore AI agents, jobs and skill relationships
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-danger mb-4">
            {error}
          </div>
        )}

        <div className="row g-4">

          {/* ================================
              Add Agent Form
          ================================= */}

          <div className="col-12 col-lg-5">

            <div className="card shadow-sm border-0">

              <div className="card-body p-4">

                <h3 className="h4 fw-bold mb-4">
                  Add AI Agent
                </h3>

                <form onSubmit={handleSubmit}>

                  {/* Agent Name */}
                  <div className="mb-3">

                    <label className="form-label">
                      Agent Name
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Customer Support AI"
                      value={agentName}
                      onChange={(e) =>
                        setAgentName(e.target.value)
                      }
                      required
                    />

                  </div>

                  {/* Skill */}
                  <div className="mb-3">

                    <label className="form-label">
                      Skill
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Customer Support"
                      value={skill}
                      onChange={(e) =>
                        setSkill(e.target.value)
                      }
                      required
                    />

                  </div>

                  {/* Application */}
                  <div className="mb-3">

                    <label className="form-label">
                      Application
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Gmail"
                      value={application}
                      onChange={(e) =>
                        setApplication(e.target.value)
                      }
                      required
                    />

                  </div>

                  {/* Workflow */}
                  <div className="mb-4">

                    <label className="form-label">
                      Workflow
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Customer Follow-up"
                      value={workflow}
                      onChange={(e) =>
                        setWorkflow(e.target.value)
                      }
                      required
                    />

                  </div>

                  <button
                    type="submit"
                    className="btn btn-dark w-100"
                  >
                    Add Agent
                  </button>

                </form>

              </div>

            </div>

          </div>

          {/* ================================
              AI Agents
          ================================= */}

          <div className="col-12 col-lg-7">

            <div className="card shadow-sm border-0">

              <div className="card-body p-4">

                <h3 className="h4 fw-bold mb-4">
                  AI Agents
                </h3>

                {loading && (
                  <div className="text-center py-4">
                    Loading agents...
                  </div>
                )}

                {!loading &&
                  agents.length === 0 && (
                    <div className="text-center text-secondary py-4">
                      No AI agents found.
                    </div>
                  )}

                {!loading &&
                  agents.map((agent, index) => (

                    <div
                      className="border rounded p-3 mb-3"
                      key={index}
                    >

                      <h5 className="fw-bold">
                        {agent.agentName}
                      </h5>

                      <p className="mb-1">
                        <strong>Skill:</strong>{" "}
                        {agent.skill}
                      </p>

                      <p className="mb-1">
                        <strong>Application:</strong>{" "}
                        {agent.application}
                      </p>

                      <p className="mb-3">
                        <strong>Workflow:</strong>{" "}
                        {agent.workflow}
                      </p>

                    </div>

                  ))}

              </div>

            </div>

          </div>

        </div>

        {/* ================================
            Jobs Section
        ================================= */}

        <div className="card shadow-sm border-0 mt-5">

          <div className="card-body p-4">

            <h3 className="h4 fw-bold mb-4">
              Jobs
            </h3>

            {jobs.length === 0 ? (

              <div className="text-center text-secondary py-4">
                No jobs found.
              </div>

            ) : (

              jobs.map((job, index) => (

                <div
                  className="border rounded p-3 mb-3"
                  key={index}
                >

                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

                    <div>

                      <h5 className="fw-bold mb-1">
                        {job.title}
                      </h5>

                      <p className="text-secondary mb-0">
                        Company: {job.company}
                      </p>

                    </div>

                    <button
                      className="btn btn-dark"
                      onClick={() =>
                        fetchRelatedSkills(job.title)
                      }
                    >
                      View Related Skills
                    </button>

                  </div>

                </div>

              ))

            )}

          </div>

        </div>

        {/* ================================
            Related Skills Section
        ================================= */}

        {relatedSkills.length > 0 && (

          <div className="card shadow-sm border-0 mt-4">

            <div className="card-body p-4">

              <h3 className="h4 fw-bold mb-4">
                Related Skills
              </h3>

              {relatedSkills.map((relationship, index) => (

                <div
                  className="border rounded p-3 mb-3"
                  key={index}
                >

                  <h5 className="fw-bold">
                    {relationship.job}
                  </h5>

                  <p className="mb-1">
                    <strong>Required Skill:</strong>{" "}
                    {relationship.requiredSkill}
                  </p>

                  <p className="mb-0">
                    <strong>Related Skill:</strong>{" "}
                    {relationship.relatedSkill}
                  </p>

                </div>

              ))}

            </div>

          </div>

        )}

      </main>

    </div>
  );
}

export default App;