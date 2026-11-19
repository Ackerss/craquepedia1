import { ensureDatabase } from "../src/db/setup";
import { sql } from "../src/db/index";

ensureDatabase()
  .then(async () => {
    console.log("Banco pronto.");
    await sql.end();
  })
  .catch(async (e) => {
    console.error(e);
    await sql.end();
    process.exit(1);
  });
