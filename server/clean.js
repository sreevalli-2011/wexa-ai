import neo4j from "neo4j-driver";
import dotenv from "dotenv";

dotenv.config();

const driver = neo4j.driver(
  process.env.COGNODB_URI,
  neo4j.auth.basic(
    process.env.COGNODB_USERNAME,
    process.env.COGNODB_PASSWORD
  )
);

const session = driver.session();

try {
  await session.run(`
    MATCH (j:Job {title: "React Developer"})
    WITH collect(j) AS jobs
    CALL {
      WITH jobs
      UNWIND tail(jobs) AS duplicate
      DETACH DELETE duplicate
    }
    RETURN size(jobs) AS totalJobs
  `);

  console.log("Duplicate jobs cleaned successfully!");
} catch (error) {
  console.error("Error cleaning data:", error);
} finally {
  await session.close();
  await driver.close();
}