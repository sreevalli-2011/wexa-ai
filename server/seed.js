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
    MERGE (c:Company {name: "Wexa AI"})

    MERGE (j:Job {title: "React Developer"})
    MERGE (c)-[:OFFERS]->(j)

    MERGE (s1:Skill {name: "React"})
    MERGE (s2:Skill {name: "JavaScript"})
    MERGE (s3:Skill {name: "TypeScript"})

    MERGE (j)-[:REQUIRES]->(s1)
    MERGE (j)-[:REQUIRES]->(s2)
    MERGE (j)-[:REQUIRES]->(s3)

    MERGE (s1)-[:RELATED_TO]->(s2)
    MERGE (s2)-[:RELATED_TO]->(s3)

    MERGE (a:Agent {
      name: "Customer Support AI",
      skill: "Customer Support",
      application: "Gmail",
      workflow: "Customer Follow-up"
    })
  `);

  console.log("Seed data inserted successfully!");
} catch (error) {
  console.error("Error inserting seed data:", error);
} finally {
  await session.close();
  await driver.close();
}