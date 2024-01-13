const dataQueues = {};
const reqQueues = {};

export async function blockingGet(key) {
  const dataQueue = dataQueues[key];

  const timeout = setTimeout(() => {
    const resolve = reqQueues[key].shift();
    return resolve(null);
  }, 30000);

  const data = await new Promise((resolve) => {
    if (dataQueue && dataQueue.length != 0) {
      resolve(dataQueue.shift());
    } else {
      reqQueues[key]
        ? reqQueues[key].push(resolve)
        : (reqQueues[key] = [resolve]);
    }
  });
  clearTimeout(timeout);
  return data;
}

export async function push(key, data) {
  const reqQueue = reqQueues[key] ?? [];

  if (reqQueue.length > 0) {
    const resolve = reqQueue.shift();
    resolve(data);
  } else {
    dataQueues[key] ? dataQueues[key].push(data) : (dataQueues[key] = [data]);
  }

  return;
}
