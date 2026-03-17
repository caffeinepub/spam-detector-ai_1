import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SpamResult } from "../backend.d";
import { useActor } from "./useActor";

export function useHistory() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["history"],
    queryFn: async () => {
      if (!actor) return [];
      const h = await actor.getHistory();
      return h.slice().reverse();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAnalyzeMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (text: string): Promise<SpamResult> => {
      if (!actor) throw new Error("Not connected");
      return actor.analyzeMessage(text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });
}

export function useClearHistory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.clearHistory();
    },
    onSuccess: () => {
      queryClient.setQueryData(["history"], []);
    },
  });
}
