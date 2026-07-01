import { seedDayanNetworkProfessionalsIfEmpty } from "../server/db";

async function main() {
  const result = await seedDayanNetworkProfessionalsIfEmpty();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
