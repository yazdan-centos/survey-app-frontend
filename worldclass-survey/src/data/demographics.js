import raw from './demographics.json';

// raw[demoKey] -> array of { question, options: [...] }
export function getDemographicQuestions(demoKey) {
  return raw[demoKey] || [];
}

export default raw;
