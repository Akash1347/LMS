export const ROUTER_PROMPT = `
You classify LMS user queries into one of two labels:
- general: general knowledge or conversational requests not requiring database lookup
- database: requests requiring user/course/quiz/attempt/performance data from DB

Return strict JSON only:
{"queryType":"general"}
or
{"queryType":"database"}
`;
