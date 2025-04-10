import neo4j from "neo4j-driver";

const URI = "neo4j+s://f77fbf0c.databases.neo4j.io";
const USER = "neo4j";
const PASSWORD = "rbNAMMd0dI6k9qIhcHiGqmR-LtyyoPzPMUtOFJ2tZgs";

const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));

export const fetchGraphData = async (skip = 0, limit = 100) => {
  const session = driver.session();

  try {
    console.log(`Fetching data from Neo4j (Skip: ${skip}, Limit: ${limit})`);

    const result = await session.run(
      `MATCH (n)-[r]->(m) 
       RETURN n, labels(n) AS nodeLabel, r, type(r) AS relationshipType, m, labels(m) AS targetLabel 
       LIMIT 500`
    );

    console.log("Raw Neo4j result:", result.records);

    const nodes = [];
    const links = new Set(); // ✅ Prevent duplicate links

    const extractId = (neo4jInt) => String(neo4jInt.low); // ✅ Convert Neo4j integer to string ID

    result.records.forEach(record => {
      const node1 = record.get("n").properties || {};
      const node2 = record.get("m").properties || {};
      const relationshipType = record.get("relationshipType") || "UNKNOWN_RELATIONSHIP";

      const node1Id = extractId(record.get("n").identity);
      const node2Id = extractId(record.get("m").identity);

      const node1Label = record.get("nodeLabel")[0] || "Unknown";
      const node2Label = record.get("targetLabel")[0] || "Unknown";

      const getNodeLabel = (node) => node.name || node.surname || node.type || node.code || "Unknown";

      if (!nodes.find(n => n.id === node1Id)) {
        nodes.push({ id: node1Id, name: getNodeLabel(node1), type: node1Label });
      }

      if (!nodes.find(n => n.id === node2Id)) {
        nodes.push({ id: node2Id, name: getNodeLabel(node2), type: node2Label });
      }

      links.add(JSON.stringify({ source: node1Id, target: node2Id, type: relationshipType }));
    });

    return { nodes, links: Array.from(links).map(link => JSON.parse(link)) };
  } catch (error) {
    console.error("Neo4j Fetch Error:", error);
    return { nodes: [], links: [] };
  } finally {
    await session.close();
  }
};



