export const simulateAIProcessing = async (
  operation: 'parse' | 'calculate' | 'recommend' | 'analyze',
  onProgress?: (progress: number) => void
): Promise<void> => {
  const delays = {
    parse: 2000,
    calculate: 1500,
    recommend: 1000,
    analyze: 2500
  };
  
  const totalTime = delays[operation];
  const steps = 20;
  const stepDelay = totalTime / steps;
  
  for (let i = 0; i <= steps; i++) {
    await new Promise(resolve => setTimeout(resolve, stepDelay));
    if (onProgress) {
      onProgress((i / steps) * 100);
    }
  }
};

export const randomDelay = (min: number = 500, max: number = 1500): Promise<void> => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};
