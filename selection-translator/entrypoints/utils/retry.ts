import { ExponentialBackoff, handleAll, retry } from "cockatiel";

export const retryPolicy = retry(handleAll, {
  maxAttempts: 3,
  backoff: new ExponentialBackoff({
    initialDelay: 1000,
    exponent: 2,
  }),
});

retryPolicy.onRetry((data) => {
  if ("error" in data) {
    console.error(`Retrying in ${data.delay}ms (attempt ${data.attempt})`, {
      message: data.error.message,
      name: data.error.name,
      stack: data.error.stack,
    });
  }
});
