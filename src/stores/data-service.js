function getClient(dataService) {
  return dataService.client.client;
}

export function startSession(dataService) {
  return getClient(dataService).startSession();
}

export async function killSession(dataService, clientSession) {
  const adminDb = getClient(dataService).db('admin');
  await adminDb.command({
    killSessions: [
      clientSession.id
    ]}
  );
}

export function sample(dataService, namespace, {
  query, size, fields, maxTimeMS, session
}) {
  const pipeline = [];
  if (Object.keys(query).length > 0) {
    pipeline.push({
      $match: query
    });
  }

  pipeline.push({
    $sample: {
      size: size
    }
  });

  // add $project stage if projection (fields) was specified
  if (fields && Object.keys(fields).length > 0) {
    pipeline.push({
      $project: fields
    });
  }

  const aggregationOptions = {
    batchSize: size,
    maxTimeMS,
    session
  };

  return dataService.aggregate(namespace, pipeline, aggregationOptions);
}

