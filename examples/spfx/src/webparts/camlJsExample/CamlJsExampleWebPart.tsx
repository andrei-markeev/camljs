import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import WebPartContext from '@microsoft/sp-webpart-base/lib/core/WebPartContext';

import * as CamlBuilder from 'camljs';

import {
    SPHttpClient,
    SPHttpClientResponse
   } from '@microsoft/sp-http';

export interface ICamlJsExampleWebPartProps {
    description: string;
}

interface IAppProps {
    context: WebPartContext;
}
interface IAppState {
    items: IListItem[];
}
interface IListItem {
    Title: string;
}

class AppComponent extends React.Component<IAppProps, IAppState> {
    public componentWillMount(): void {
        this.setState({ items: [] });
    }
    public componentDidMount(): void {
        this.props.context.spHttpClient.post(
            `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('Cities')/getitems`,
            SPHttpClient.configurations.v1,
            {
                body: JSON.stringify({
                    query: {
                        ViewXml: new CamlBuilder().View().Query().Where().BooleanField('Visited').IsTrue().ToString()
                    }
                })
            }
        )
        .then((response: SPHttpClientResponse) => {
            return response.json();
        })
        .then(items => {
            this.setState({ items: items.value });
        });
    }
    public render(): JSX.Element {
        return (<ul>{this.state.items.map(i => <li>{i.Title}</li>)}</ul>);
    }
}

export default class CamlJsExampleWebPart extends BaseClientSideWebPart<ICamlJsExampleWebPartProps> {

    public render(): void {
        ReactDom.render(<AppComponent context={this.context} />, this.domElement);
    }

    protected get dataVersion(): Version {
        return Version.parse('1.0');
    }

}
