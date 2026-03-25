import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export const options = {
  vus: 300,
  duration: '5m',
};

const users = JSON.parse(open('./users.json'));

export default function () {
  const user = users[__VU % users.length];

  const res = http.post(
    'https://erp-api-dev-922117522963.us-central1.run.app/api-external/v1/portal/auth/login',
    JSON.stringify({
      login: user.login,
      senha: user.senha,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  check(res, {
    'status 200': (r) => r.status === 200,
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    "report.html": htmlReport(data),
    "summary.json": JSON.stringify(data),
  };
}