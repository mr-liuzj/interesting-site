import type { HTMLStyleProps as GHTMLStyleProps } from '@antv/g';
import { HTML, HTMLStyleProps, register, ExtensionCategory } from '@antv/g6';
import { AppContext, createVNode, render } from 'vue';
import CustomNode from '../../components/CustomNode.vue';

const createCustomNode = (
  props: Record<string, any>,
  appContext: AppContext,
) => {
  const vnode = createVNode(CustomNode, props);

  vnode.appContext = appContext || null;

  return vnode;
};

class VueNode extends HTML {
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

register(ExtensionCategory.NODE, 'vue-node', VueNode);
