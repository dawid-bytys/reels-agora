import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { LivesResponse } from '../responses/livesResponse';

export const LIVES_QUERY_KEY = 'lives';

async function fetchLives() {
  const response = await axios.get<LivesResponse>(
    'https://app.selmo.io/apimobileguest/liveVideo',
    {
      params: {
        page: 1,
        limit: 10,
      },
      headers: {
        lang: 'pl',
      },
    },
  );

  return response.data;
}

export function useLivesQuery() {
  return useQuery({
    queryKey: [LIVES_QUERY_KEY],
    queryFn: fetchLives,
  });
}
