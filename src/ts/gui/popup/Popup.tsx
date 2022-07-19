import * as $ from "JQuery";
import { ReactNode } from "react";
import React = require("react");
import ReactDOM = require("react-dom");

/**
 * This Popup class has been created as a react port of Realityboxs Popups, because they cannot be accessed from this module and to make working with react easier.
 */
export class Popup {
    root: JQuery;

    /**
     * Create a new popup. The popup will not be opened automatically
     * @param title The title of the popup
     * @param content The content as ReactNode. Will be placed inside a div container
     * @param maxWidth The maximal width for the popup as html style description
     */
    constructor(title: string, content: ReactNode, maxWidth: string) { // Change HTML to React
        const react = <><div>
            <div className="outer">
                <div className="container" style={{ maxWidth: maxWidth }}>
                    <div className="header">
                        <div>{title}</div>
                        <div>
                            <button className="btn" onClick={e => this.close()}>
                                <i className="material-icons">close</i>
                            </button>
                        </div>
                    </div>
                    <div className="content">
                        {[0].map(x => content)}
                    </div>
                </div>
            </div>
        </div>
        </>;
        let e = document.createElement("div");
        e.classList.add("viewer--popup");
        ReactDOM.render(react, e);
        this.root = $(e);
    }

    /**
     * Open this Popup
     */
    open() {
        $('body').append(this.root);
    }

    /**
     * Close this popup
     */
    close() {
        this.root.detach();
    }
}