import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
    BaseClientSideWebPart,
    IPropertyPaneConfiguration,
    PropertyPaneTextField
} from '@microsoft/sp-webpart-base';
import WebPartContext from '@microsoft/sp-webpart-base/lib/core/WebPartContext';

import * as CamlBuilder from 'camljs';
import {
    SPHttpClient,
    SPHttpClientResponse   
   } from '@microsoft/sp-http';

export interface ICamlJsExampleWebPartProps {
    description: string;
}

interface AppProps {
    context: WebPartContext;
}
interface AppState {
    items: ListItem[];
}
interface ListItem {
    Title: string;
}

class AppComponent extends React.Component<AppProps, AppState> {
    public componentWillMount() {
        this.setState({ items: [] });
    }
    public componentDidMount() {
        this.props.context.spHttpClient.post(
            `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('Cities')/getitems`,
            SPHttpClient.configurations.v1,
            {
                body: JSON.stringify({
                    query: {
                        ViewXml: new CamlBuilder().View().Query().Where().BooleanField("Visited").IsTrue().ToString()
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
    public render() {
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
