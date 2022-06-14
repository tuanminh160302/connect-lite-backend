const { Neo4jGraphQL } = require("@neo4j/graphql");
const { ApolloServer, gql } = require("apollo-server");
const neo4j = require("neo4j-driver");


const typeDefs = gql`
    type User {
        username: String!
        email: String!
        createdAt: String
        displayName: String!
        photoURL: String
        uid: String!
        hasSkill: [Skill!]! @relationship(type: "HAS_SKILL", properties: "SkillLevel", direction: OUT)
    }

    type Skill {
        name: String!
        photoURL: String!
        description: String!
        id: String!
        skillIn: CATEGORY! @relationship(type:"SKILL_IN", direction: OUT)
        knownBy: [User!]! @relationship(type:"KNOWN_BY", direction: IN)
    }

    type CATEGORY {
        value: String!
        hasSkill: [Skill!]! @relationship(type:"SKILL_IN", direction: IN)
    }

    type JOB_ROLE {
        value: String!
    }

    type Admin {
        uid: String!
    }

    interface SkillLevel @relationshipProperties {
        level: Int!
    }
`;

const driver = neo4j.driver(
    "bolt://localhost:7687",
    neo4j.auth.basic("neo4j", "160333")
);

const neoSchema = new Neo4jGraphQL({ typeDefs, driver });

neoSchema.getSchema().then((schema) => {
    const server = new ApolloServer({
        schema,
    });

    server.listen().then(({ url }) => {
        console.log(`🚀 Server ready at ${url}`);
    });
})