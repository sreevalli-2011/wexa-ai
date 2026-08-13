import express from "express";
import neo4j from "neo4j-driver";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// =====================================================
// CognoDB / Neo4j Connection
// =====================================================

const driver = neo4j.driver(
  process.env.COGNODB_URI,
  neo4j.auth.basic(
    process.env.COGNODB_USERNAME,
    process.env.COGNODB_PASSWORD
  )
);

// =====================================================
// Test Database Connection
// =====================================================

app.get("/", async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(
      "RETURN 'Database connected!' AS message"
    );

    res.json({
      message: result.records[0].get("message"),
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      message: "Database connection failed",
    });
  } finally {
    await session.close();
  }
});

// =====================================================
// Test API
// =====================================================

app.get("/test", (req, res) => {
  res.json({
    message: "API is working",
  });
});

// =====================================================
// Test Related Skills API
// =====================================================

app.get("/api/test-related", (req, res) => {
  res.json({
    message: "Related skills API route is working",
  });
});

// =====================================================
// GET ALL JOBS
// =====================================================

app.get("/api/jobs", async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (c:Company)-[:OFFERS]->(j:Job)
      RETURN
        j.title AS title,
        c.name AS company
    `);

    const jobs = result.records.map((record) => ({
      title: record.get("title"),
      company: record.get("company"),
    }));

    res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);

    res.status(500).json({
      message: "Failed to fetch jobs",
    });
  } finally {
    await session.close();
  }
});

// =====================================================
// GET ALL AI AGENTS
// =====================================================

app.get("/api/agents", async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (a:Agent)
      RETURN
        a.name AS agentName,
        a.skill AS skill,
        a.application AS application,
        a.workflow AS workflow
    `);

    const agents = result.records.map((record) => ({
      agentName: record.get("agentName"),
      skill: record.get("skill"),
      application: record.get("application"),
      workflow: record.get("workflow"),
    }));

    res.json(agents);
  } catch (error) {
    console.error("Error fetching agents:", error);

    res.status(500).json({
      message: "Failed to fetch agents",
    });
  } finally {
    await session.close();
  }
});

// =====================================================
// ADD NEW AI AGENT
// =====================================================

app.post("/api/agents", async (req, res) => {
  const {
    agentName,
    skill,
    application,
    workflow,
  } = req.body;

  if (!agentName || !skill || !application || !workflow) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  const session = driver.session();

  try {
    const result = await session.run(
      `
      CREATE (a:Agent {
        name: $agentName,
        skill: $skill,
        application: $application,
        workflow: $workflow
      })

      RETURN
        a.name AS agentName,
        a.skill AS skill,
        a.application AS application,
        a.workflow AS workflow
      `,
      {
        agentName,
        skill,
        application,
        workflow,
      }
    );

    const record = result.records[0];

    res.status(201).json({
      agentName: record.get("agentName"),
      skill: record.get("skill"),
      application: record.get("application"),
      workflow: record.get("workflow"),
    });
  } catch (error) {
    console.error("Error creating agent:", error);

    res.status(500).json({
      message: "Failed to create agent",
    });
  } finally {
    await session.close();
  }
});

// =====================================================
// MULTI-HOP GRAPH QUERY
// =====================================================
//
// Job
//   ↓ REQUIRES
// Skill
//   ↓ RELATED_TO
// Related Skill
//
// =====================================================

app.get("/api/jobs/:jobTitle/related-skills", async (req, res) => {
  const { jobTitle } = req.params;

  console.log("Related skills route called:", jobTitle);

  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (j:Job {title: $jobTitle})
            -[:REQUIRES]->
            (s:Skill)
            -[:RELATED_TO]->
            (related:Skill)

      RETURN
        j.title AS job,
        s.name AS requiredSkill,
        related.name AS relatedSkill
      `,
      {
        jobTitle,
      }
    );

    const relationships = result.records.map((record) => ({
      job: record.get("job"),
      requiredSkill: record.get("requiredSkill"),
      relatedSkill: record.get("relatedSkill"),
    }));

    res.json(relationships);
  } catch (error) {
    console.error("Error fetching related skills:", error);

    res.status(500).json({
      message: "Failed to fetch related skills",
    });
  } finally {
    await session.close();
  }
});

// =====================================================
// ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    message: "Internal server error",
  });
});

// =====================================================
// START SERVER
// =====================================================
const PORT = 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;