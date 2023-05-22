// import { readFileSync } from 'fs';
// import { resolve } from 'path';
// import { sql } from 'drizzle-orm';
import { db } from './db';
import { users } from './db/schema';

// const migration = readFileSync(
//   // eslint-disable-next-line unicorn/prefer-module
//   resolve(__dirname, '../drizzle/0000_eager_pet_avengers.sql'),
// )
//   .toString()
//   .split(';')
//   .map((str) => str.trim())
//   .filter(Boolean);

async function seed() {
  // for (const statement of migration) {
  // // eslint-disable-next-line no-await-in-loop
  // await db.run(sql([statement] as never));
  // }

  // const userRows = await db
  //   .insert(users)
  //   .values(Array.from({ length: 10 }).map((_, i) => ({ id: i, name: `user${i}` })))
  //   .run();
  // console.log(userRows);

  db.query.users.findMany({
    with: {},
  });

  console.log(await db.select().from(users).all());
}

seed().catch(console.error);
