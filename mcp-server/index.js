import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyADiEg04u6_3QpklZyAB3DjolUy2Bf-Zxc",
  authDomain: "design-qa-board.firebaseapp.com",
  projectId: "design-qa-board"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const server = new Server(
  {
    name: "design-qa-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_projects",
        description: "List all Design-QA projects and their basic info.",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "get_project_issues",
        description: "Get all issues (pins) for a specific Design-QA project by its ID.",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string" },
          },
          required: ["projectId"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    if (request.params.name === "list_projects") {
      const snapshot = await getDocs(collection(db, "projects"));
      const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return {
        content: [{ type: "text", text: JSON.stringify(projects, null, 2) }],
      };
    }

    if (request.params.name === "get_project_issues") {
      const { projectId } = request.params.arguments;
      const screensSnapshot = await getDocs(collection(db, "project_screens", projectId, "screens"));
      
      let allIssues = [];
      screensSnapshot.docs.forEach(doc => {
        const screen = doc.data();
        const pins = [];
        if (screen.PC && screen.PC.pins) pins.push(...screen.PC.pins);
        if (screen.Mobile && screen.Mobile.pins) pins.push(...screen.Mobile.pins);
        
        pins.forEach(pin => {
          allIssues.push({
            screenId: doc.id,
            screenName: screen.name,
            deviceType: screen.deviceType || "PC",
            ...pin
          });
        });
      });

      return {
        content: [{ type: "text", text: JSON.stringify(allIssues, null, 2) }],
      };
    }

    throw new Error(`Unknown tool: ${request.params.name}`);
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Design QA MCP Server running on stdio");
}

main().catch(console.error);
