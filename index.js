const { ApolloServer, gql } = require("apollo-server");
const SwapiDataSource = require("./SwapiDataSource");

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    character: Character
  }
  type Character {
    name: String
    height: String
    films: [Film]
  }
  type Film {
    title: String
    episode_id: ID!
    characters: [Character]
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    character: (root, args, context) =>
      context.dataSources.swapi.getCharacter(1)
  },
  Character: {
    films: (root, args, context) =>
      root.films.map(url => context.dataSources.swapi.get(url))
  },
  Film: {
    characters: (root, args, context) =>
      root.characters.map(url => context.dataSources.swapi.get(url))
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => {
    return {
      swapi: new SwapiDataSource()
    };
  }
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
