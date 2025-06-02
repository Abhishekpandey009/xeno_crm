type Job = {
  type: 'customer' | 'order';
  data: any;
};

const jobQueue: Job[] = [];

export const enqueue = (job: Job) => {
  jobQueue.push(job);
};

export const dequeue = (): Job | undefined => {
  return jobQueue.shift();
};
