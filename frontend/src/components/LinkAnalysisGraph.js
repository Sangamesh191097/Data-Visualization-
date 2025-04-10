import React, { useEffect, useState } from "react";
import { ForceGraph2D } from "react-force-graph";
import Card from "./ui/Card";
import Input from "./ui/Input";
import Select from "./ui/Select";
import Button from "./ui/Button";
import Tooltip from "./ui/Tooltip";
import { kmeans } from "ml-kmeans";

import { motion } from "framer-motion";
import { fetchGraphData } from "../services/neo4jServices";

const LinkAnalysisGraph = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [loadedNodes, setLoadedNodes] = useState([]);
  const [loadedLinks, setLoadedLinks] = useState([]);
  const [loadMore, setLoadMore] = useState(true);
  const [clusters, setClusters] = useState({});
  const [highlightNode, setHighlightNode] = useState(null);
  const [expandedClusters, setExpandedClusters] = useState(new Set());
  const [hoverNode, setHoverNode] = useState(null);
  const [skip, setSkip] = useState(0);
  const limit = 100;
 

  useEffect(() => {
    fetchGraphData().then((data) => {
      setGraphData(data);
      setLoadedNodes(data.nodes.slice(0, 100)); // Load first 100 nodes
      setLoadedLinks(data.links.slice(0, 100));
      applyClustering(data.nodes);
    });
  }, []);

  console.log(graphData, "Graph")

  const applyClustering = (nodes) => {
    if (!nodes || nodes.length < 2) {
      console.warn("Not enough nodes to perform clustering.");
      return;
    }
  
    // Ensure K is smaller than the number of nodes
    const numClusters = Math.min(5, nodes.length - 1); 
  
    const coordinates = nodes.map(node => [node.x, node.y]);
  
    try {
      const kmeansResult = kmeans(coordinates, numClusters); // Updated with dynamic K
      const clusteredNodes = nodes.map((node, index) => ({
        ...node,
        cluster: kmeansResult.clusters[index]
      }));
  
      setClusters(kmeansResult.centroids);
      setLoadedNodes(clusteredNodes.slice(0, 100));
    } catch (error) {
      console.error("K-means clustering error:", error);
    }
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    const foundNode = loadedNodes.find(node => node.name.toLowerCase().includes(event.target.value.toLowerCase()));
    setHighlightNode(foundNode || null);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const loadMoreNodes = () => {
    const currentLength = loadedNodes.length;
    const newNodes = graphData.nodes.slice(currentLength, currentLength + 100);
    const newLinks = graphData.links.slice(currentLength, currentLength + 100);

    if (newNodes.length > 0) {
      setLoadedNodes([...loadedNodes, ...newNodes]);
      setLoadedLinks([...loadedLinks, ...newLinks]);
    } else {
      setLoadMore(false);
    }
  };

  const toggleClusterExpansion = (clusterId) => {
    const updatedClusters = new Set(expandedClusters);
    if (updatedClusters.has(clusterId)) {
      updatedClusters.delete(clusterId);
    } else {
      updatedClusters.add(clusterId);
    }
    setExpandedClusters(updatedClusters);
    setLoadedNodes(
      graphData.nodes.filter(node => updatedClusters.has(node.cluster) || !updatedClusters.size)
    );
  };

  const nodeColorMapping = {
    "Crime": "#FF5733",      // Red
    "Person": "#33FF57",     // Green
    "Officer": "#3357FF",    // Blue
    "Location": "#FF33A8",   // Pink
    "Vehicle": "#FFC300",    // Yellow
    "PostCode": "#900C3F",   // Dark Red
    "PhoneCall": "#581845",  // Purple
    "Unknown": "#AAAAAA",    // Gray
  };
  
  // Function to Get Node Color Based on Type
  const getNodeColor = (type) => nodeColorMapping[type] || "#CCCCCC";

  const relationshipColorMapping = {
    "INVESTIGATED_BY": "#FF5733", // 🔴 Red
    "OCCURRED_AT": "#33FF57", // 🟢 Green
    "KNOWN_TO": "#3357FF", // 🔵 Blue
    "RELATIVE_OF": "#FF33A8", // 🟣 Pink
    "CALLS": "#FFC300", // 🟡 Yellow
    "Unknown": "#AAAAAA", // ⚪ Gray
  };
  
  // Function to Get Link Color Based on Relationship Type
  const getLinkColor = (type) => relationshipColorMapping[type] || "#999999"; // Default gray
  
  const existingNodeIds = new Set(loadedNodes.map(n => n.id));

const filteredLinks = loadedLinks.filter(link => 
  existingNodeIds.has(link.source) && existingNodeIds.has(link.target)
);

  return (
    <motion.div className="flex flex-col items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="w-full max-w-3xl mb-4 p-4 flex flex-col gap-2 shadow-lg rounded-lg">
        <Input
          type="text"
          placeholder="Search for a person or crime event..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full p-2 border rounded-lg shadow-sm"
        />
        <Select value={filter} onChange={handleFilterChange} className="w-full p-2 border rounded-lg shadow-sm">
          <option value="all">All</option>
          <option value="person">Person</option>
          <option value="crime">Crime Event</option>
        </Select>
        <Button onClick={() => console.log("Applying filter and search")} className="rounded-lg shadow-md">Apply</Button>
      </Card>

      
      <div className="flex gap-2 mb-4">
        {Object.keys(clusters).map(clusterId => (
          <Button key={clusterId} onClick={() => toggleClusterExpansion(clusterId)} className="rounded-lg shadow-md">
            {expandedClusters.has(clusterId) ? `Collapse Cluster ${clusterId}` : `Expand Cluster ${clusterId}`}
          </Button>
        ))}
      </div>
      

<ForceGraph2D
  graphData={{ nodes: loadedNodes, links: filteredLinks }} // ✅ Ensure all links are valid
  nodeAutoColorBy={(node) => node.type || "Unknown"} 
  linkColor={(link) => getLinkColor(link.type)} 
  linkDirectionalParticles={2} 
  linkDirectionalParticleSpeed={0.01} 
  linkDirectionalArrowLength={10} 
  linkDirectionalArrowRelPos={1} 
  linkWidth={2} 
/>








      {hoverNode && (
        <Tooltip position="top" className="absolute">
          <div className="p-2 bg-gray-700 text-white rounded-lg shadow-lg">
            <p><strong>Name:</strong> {hoverNode.name}</p>
            <p><strong>Type:</strong> {hoverNode.type}</p>
          </div>
        </Tooltip>
      )}
      {loadMore && <Button onClick={loadMoreNodes} className="mt-4 rounded-lg shadow-md">Load More</Button>}
    </motion.div>
  );
};

export default LinkAnalysisGraph;

