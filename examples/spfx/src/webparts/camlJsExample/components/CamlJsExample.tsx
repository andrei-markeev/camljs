import { WebPartContext } from "@microsoft/sp-webpart-base";
import * as React from "react";
import * as CamlBuilder from "camljs";
import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";

export interface IAppProps {
    context: WebPartContext;
}
export interface IAppState {
    items: IListItem[];
}
export interface IListItem {
    Title: string;
}

export default class CamlJsExample extends React.Component<IAppProps, IAppState> {
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