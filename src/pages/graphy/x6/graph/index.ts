import { onMounted, Ref, shallowRef } from 'vue';

export function useGraph(container: Ref<HTMLElement | undefined>) {
  const graph = shallowRef();

  onMounted(() => {
    if (!container.value) return;
  });

  return {
    graph,
  };
}
