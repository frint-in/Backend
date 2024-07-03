export const up = async (db, client) => {
  // TODO write your migration here.
  // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
  // Example:
  // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
  try {
    const response = await db.collection("users").updateMany(
      {},
      {
        $set: {
          isVerfied: false,
        },
      }
    );

    if (response) {
        console.log('response>>>', response);

    console.log("operation success");
    }else {
    console.log("operation failed")
    }

  } catch (err) {
    console.log("error while migrating up", err);
  }
};

export const down = async (db, client) => {
  // TODO write the statements to rollback your migration (if possible)
  // Example:
  // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  await db.collection("users").updateMany(
    {},
    {
      $unset: {
        isVerfied: "",
      },
    }
  );
};
