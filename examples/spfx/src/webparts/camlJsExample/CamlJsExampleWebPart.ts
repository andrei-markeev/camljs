import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import CamlJsExample from './components/CamlJsExample';

export interface ICamlJsExampleWebPartProps {
  description: string;
}

export default class CamlJsExampleWebPart extends BaseClientSideWebPart<ICamlJsExampleWebPartProps> {

  public render(): void {
    const element = React.createElement(CamlJsExample, { context: this.context });
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

}
