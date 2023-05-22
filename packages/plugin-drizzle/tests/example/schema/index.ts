import { not, sql } from 'drizzle-orm';
import builder from '../builder';
import { db } from '../db';

builder.drizzleObject('users', {
  name: 'User',
  // Default selection when query users (optional, defaults to all columns)
  select: {
    columns: {
      id: true,
    },
    with: {
      invitee: {
        columns: {
          name: true,
        },
      },
    },
  },
  fields: (t) => ({
    email: t.string({
      resolve: (user) => `${user.lowercase}@example.com`,
      // field level selects can be merged in (only queried when the field is requested)
      // combines with selections from object level
      select: {
        with: {
          posts: true,
        },
        columns: {
          invitedBy: true,
        },
        extras: {
          lowercase: sql<string>`lowercase(name)`.as('lowercase'),
        },
      },
    }),
    // column values can be exposed even if they are not in the default selection (will be selected automatically)
    name: t.exposeString('name'),
    posts: t.relation('posts', {
      args: {
        limit: t.arg.int(),
      },
      // use args to modify how a relation is queried
      query: (args) => ({
        limit: args.limit ?? 10,
        where: (post, { eq }) => not(eq(post.id, 1)),
      }),
      // relation available to other plugins even when selections are at the field level
      authScopes: (user) => user.posts.length > 0,
      //                          ^?
    }),
    invitee: t.relation('invitee'),
  }),
});

builder.queryField('user', (t) =>
  t.drizzleField({
    type: 'users',
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: (query, root, args, ctx, info) =>
      db.query.users.findFirst({
        ...query,
        where: (user, { eq }) => eq(user.id, args.id),
      }),
  }),
);

export const query = /* graphql */ `{
  query getUser($id: Int!) {
    user(id: $id) {
      name,
      email
      posts {
        content
      }
      invitee {
        name
        email
        posts(limit: 2) {
          author {
            name
          }
        }
      }
    }
  }
}`;

db.query.users.findFirst({
  with: {
    posts: {
      columns: {
        id: true,
        content: true,
      },
    },
  },
});

export const schema = builder.toSchema();
