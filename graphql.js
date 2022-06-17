const { Neo4jGraphQL } = require("@neo4j/graphql");
const { ApolloServer, gql } = require('apollo-server-lambda');
const neo4j = require("neo4j-driver");

const typeDefs = gql`
type Admin {
	uid: String!
	usersIsAdmin: [User!]! @relationship(type: "IS_ADMIN", direction: IN, properties: "IsAdminProperties")
}

type CATEGORY {
	hasSkill: [Skill!]! @relationship(type: "SKILL_IN", direction: IN)
	value: String!
}

interface HasSkillProperties @relationshipProperties {
	level: Int!
}

interface IsAdminProperties @relationshipProperties {
	value: Boolean!
}

type JOB_ROLE {
	value: String!
    hasSkill: [Skill!]! @relationship(type: "SKILL_FOR", direction: IN)
}

type Skill {
	description: String!
	id: String!
	name: String!
	photoURL: String!
	skillIn: CATEGORY @relationship(type: "SKILL_IN", direction: OUT)
    skillFor: JOB_ROLE @relationship(type: "SKILL_FOR", direction: OUT)
	usersHasSkill: [User!]! @relationship(type: "HAS_SKILL", direction: IN, properties: "HasSkillProperties")
}

type User {
	createdAt: String!
	displayName: String!
	email: String!
	hasSkill: [Skill!]! @relationship(type: "HAS_SKILL", direction: OUT, properties: "HasSkillProperties")
	isAdmin: [Admin!]! @relationship(type: "IS_ADMIN", direction: OUT, properties: "IsAdminProperties")
	photoURL: String!
	uid: String!
	username: String!
}
`;

const AURA_ENDPOINT = 'neo4j+s://f0f0dfb9.databases.neo4j.io';
const USERNAME = 'neo4j';
const PASSWORD = '4DjpE2aRrRZNxmaqTHtRmbjv0bfRrNQbubak1puRH9U';

const driver = neo4j.driver(AURA_ENDPOINT, neo4j.auth.basic(USERNAME, PASSWORD) );
const neoSchema = new Neo4jGraphQL({ typeDefs, driver });

const initServer = async () => {
  return await neoSchema.getSchema().then((schema) => {
    const server = new ApolloServer({
      schema,
      context: ({ event }) => ({ req: event }),
      introspection: true,
    });
    return server.createHandler();
  });
};

const graphqlHandler = async (event, context, callback) => {
  const serverHandler = await initServer();

  return serverHandler(
    {
      ...event,
      requestContext: event.requestContext || {},
    },
    context,
    callback
  );
};

module.exports = {graphqlHandler}