import type {
  DisplayObjectConfig,
  HTMLStyleProps as GHTMLStyleProps,
} from '@antv/g';
import {
  HTML,
  BaseNodeStyleProps,
  HTMLStyleProps,
  register,
  ExtensionCategory,
} from '@antv/g6';
import { AppContext, createVNode, render, VNode } from 'vue';
import CustomNode from '../../components/CustomNode.vue';
import { getGraphInstance } from '..';

const createCustomNode = (
  props: Record<string, any>,
  appContext: AppContext,
) => {
  const vnode = createVNode(CustomNode, props);

  vnode.appContext = appContext || null;

  return vnode;
};

export class VueNode extends HTML {
  protected getKeyStyle(attributes: Required<HTMLStyleProps>): GHTMLStyleProps {
    return { ...super.getKeyStyle(attributes) };
  }

  public connectedCallback(): void {
    super.connectedCallback();

    const component = createCustomNode(
      {
        nodeId: this.config.id,
      },
      (this.attributes as any)?.appContext,
    );

    const domElement = this.getDomElement();

    render(component, domElement);
  }

  public destroy(): void {
    render(null, this.getDomElement());
    super.destroy();
  }
}

export function registerVueNode() {
  register(ExtensionCategory.NODE, 'vue-node', VueNode);
}
