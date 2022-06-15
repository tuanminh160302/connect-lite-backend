const { Neo4jGraphQL } = require("@neo4j/graphql");
const { ApolloServer, gql } = require("apollo-server");
const neo4j = require("neo4j-driver");


const typeDefs = gql`
    # type User {
    #     username: String!
    #     email: String!
    #     createdAt: String
    #     displayName: String!
    #     photoURL: String
    #     uid: String!
    #     hasSkill: [Skill!]! @relationship(type: "HAS_SKILL", properties: "SkillLevel", direction: OUT)
    # }

    # type Skill {
    #     name: String! @unique
    #     photoURL: String!
    #     description: String!
    #     id: String! @unique
    #     skillIn: CATEGORY! @relationship(type:"SKILL_IN", direction: OUT)
    #     knownBy: [User!]! @relationship(type:"KNOWN_BY", direction: IN)
    # }

    # type CATEGORY {
    #     value: String!
    #     hasSkill: [Skill!]! @relationship(type:"SKILL_IN", direction: IN)
    # }

    # type JOB_ROLE {
    #     value: String!
    # }

    # type Admin {
    #     uid: String!
    # }

    # interface SkillLevel @relationshipProperties {
    #     level: Int!
    # }
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