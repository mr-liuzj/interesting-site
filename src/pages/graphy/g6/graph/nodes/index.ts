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

export interface VueNodeStyleProps extends BaseNodeStyleProps {
  component: VNode;
}

const createCustomNode = (
  config: DisplayObjectConfig<BaseNodeStyleProps>,
  appContext: AppContext,
) => {
  const vnode = createVNode(CustomNode, {
    title: config.id,
  });

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
      this.config,
      (this.attributes as any)?.appContext,
    );
    const domElement = this.getDomElement();

    render(component, domElement);
  }

  public attributeChangedCallback(
    name: any,
    oldValue: any,
    newValue: any,
  ): void {
    if (name === 'component' && oldValue !== newValue) {
      render(null, this.getDomElement());

      const component = createCustomNode(
        this.config,
        (this.attributes as any)?.appContext,
      );

      setTimeout(() => {
        render(component, this.getDomElement());
      });
    }
  }

  public destroy(): void {
    render(null, this.getDomElement());
    super.destroy();
  }
}

export function registerVueNode() {
  register(ExtensionCategory.NODE, 'vue-node', VueNode);
}
