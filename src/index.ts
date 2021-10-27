import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { Post } from './entities/Post';
import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
//import { ApolloServer } from 'apollo-server';

//   const typeDefs = `
//   type Query {
//     info: String!
//     test: String!
//   }
// `;

//   // 2
//   const resolvers = {
//     Query: {
//       info: () => `This is the API of a Hackernews Clone`,
//       test: () => `Hello, there.`,
//     },
//   };

//   // 3
//   const server = new ApolloServer({
//     typeDefs,
//     resolvers,
//   });

//   server.listen().then(({ url }) => console.log(`Server is running on ${url}`));
// };
// main();

//Construct a schema, using GraphQL schema language

//The root provides a resolver function for each API endpoint

const main = async () => {
  var schema = buildSchema(`
  type Query {
    quoteOfTheDay: String
    random: Float!
    rollDice(numDice: Int!, numSides: Int): [Int]
    database: [PostInterface]
  }


    type PostInterface {
    id: Int
    title: String
    description: String
    views: Int
    isPublished: Boolean
  }
  
`);

  interface Dice {
    numDice: number;
    numSides: number;
  }

  let retrievedData = {};

  await createConnection({
    type: 'postgres',
    host: 'localhost',
    port: 5431,
    username: 'reilly',
    password: 'password',
    database: 'reilly',
    entities: [__dirname + '/entities/*.js'],
    synchronize: true,
    logging: false,
  })
    .then(async (connection) => {
      console.log('Connected');
      // let photo = new Post();
      // photo.title = 'First Post';
      // photo.description = 'I am near polar bears';
      // photo.views = 1;
      // photo.isPublished = true;

      // await connection.manager.save(photo);
      // console.log('Photo has been saved');
      //here you can start to work with your entities
      let savedPosts = await connection.manager.find(Post);
      retrievedData = savedPosts;
      console.log('All Posts from the db: ', savedPosts);
    })
    .catch((error) => console.log(error));

  var root = {
    quoteOfTheDay: () => {
      return Math.random() < 0.5 ? 'Take it easy' : 'Salvation lies within';
    },
    random: () => {
      return Math.random();
    },
    rollDice: (args: Dice) => {
      var output = [];
      for (var i = 0; i < args.numDice; i++) {
        output.push(1 + Math.floor(Math.random() * (args.numSides || 6)));
      }
      return output;
    },
    database: () => {
      console.log(retrievedData);
      return retrievedData;
    },
  };
  var app = express();
  app.use(
    '/graphql',
    graphqlHTTP({
      schema: schema,
      rootValue: root,
      graphiql: true,
    })
  );
  app.listen(4000);
  console.log('Running a GraphQL API server at localhost:4000/graphql');
};
main();
